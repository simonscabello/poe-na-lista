import { ListKind, ShoppingListStatus } from "@/generated/prisma/enums"
import { computeLineTotal, type EstimatableItem, estimateItemsTotal } from "@/lib/pricing"
import { prisma } from "@/lib/prisma"
import { addPurchaseToPantry } from "@/services/pantry.service"
import { findOrCreateStore } from "@/services/store.service"
import type {
  LastPriceDTO,
  ProjectBudgetStatusDTO,
  PurchaseDetailDTO,
  PurchaseSummaryDTO,
} from "@/types/domain"

export type PurchaseItemInput = {
  productId?: string | null
  productName: string
  quantity: number
  unit?: string | null
  unitPrice?: number | null
  totalPrice?: number | null
}

export type PendingHandling = "NEW_LIST" | "KEEP_IN_LIST" | "NONE"

export type ListCleanupInput = {
  checkedItemIds: string[]
  pendingItemIds: string[]
  pendingHandling: PendingHandling
  pendingListName?: string
  listName: string
}

/**
 * Registra uma compra e atualiza a lista em uma única transação,
 * garantindo que gastos e status da lista fiquem sempre consistentes.
 */
export async function finalizePurchase(input: {
  householdId: string
  shoppingListId: string | null
  createdById: string
  totalAmount: number
  purchasedAt: Date
  storeName?: string | null
  notes?: string | null
  items: PurchaseItemInput[]
  listCleanup?: ListCleanupInput
}): Promise<{ purchaseId: string; pendingListId?: string }> {
  const result = await prisma.$transaction(async (tx) => {
    const trimmedStoreName = input.storeName?.trim() || null
    const store = trimmedStoreName
      ? await findOrCreateStore(tx, input.householdId, trimmedStoreName)
      : null

    // O tipo da lista é copiado para a compra: mantém o relatório correto mesmo
    // depois de a lista ser apagada, e separa gasto de mercado de gasto de projeto.
    const listKind: ListKind = input.shoppingListId
      ? ((
          await tx.shoppingList.findUnique({
            where: { id: input.shoppingListId },
            select: { kind: true },
          })
        )?.kind ?? ListKind.GROCERY)
      : ListKind.GROCERY

    const created = await tx.purchase.create({
      data: {
        householdId: input.householdId,
        shoppingListId: input.shoppingListId,
        storeId: store?.id ?? null,
        createdById: input.createdById,
        totalAmount: input.totalAmount,
        purchasedAt: input.purchasedAt,
        storeName: store?.name ?? null,
        notes: input.notes ?? null,
        kind: listKind,
        items: {
          create: input.items.map((item) => ({
            productId: item.productId ?? null,
            productName: item.productName,
            quantity: item.quantity,
            unit: item.unit ?? null,
            unitPrice: item.unitPrice ?? null,
            totalPrice: item.totalPrice ?? null,
          })),
        },
      },
    })

    // Despensa automática só para lista de mercado: um projeto (reforma, enxoval)
    // não vira estoque da casa.
    if (listKind === ListKind.GROCERY) {
      await addPurchaseToPantry(tx, {
        householdId: input.householdId,
        updatedById: input.createdById,
        items: input.items
          .filter((item) => item.productId != null)
          .map((item) => ({
            productId: item.productId as string,
            quantity: item.quantity,
            unit: item.unit ?? null,
          })),
      })
    }

    let pendingListId: string | undefined

    if (input.shoppingListId && input.listCleanup) {
      const { checkedItemIds, pendingItemIds, pendingHandling, pendingListName, listName } =
        input.listCleanup

      if (pendingHandling === "NEW_LIST" && pendingItemIds.length > 0) {
        const pendingItems = await tx.shoppingListItem.findMany({
          where: { id: { in: pendingItemIds } },
        })

        const newList = await tx.shoppingList.create({
          data: {
            householdId: input.householdId,
            createdById: input.createdById,
            name: pendingListName ?? `${listName} · pendências`,
            items: {
              create: pendingItems.map((item) => ({
                productId: item.productId,
                quantity: item.quantity,
                unit: item.unit,
                notes: item.notes,
              })),
            },
          },
        })
        pendingListId = newList.id

        await tx.shoppingListItem.deleteMany({ where: { id: { in: pendingItemIds } } })
        await tx.shoppingList.update({
          where: { id: input.shoppingListId },
          data: { status: ShoppingListStatus.COMPLETED, completedAt: new Date() },
        })
      } else if (pendingHandling === "KEEP_IN_LIST") {
        await tx.shoppingListItem.deleteMany({ where: { id: { in: checkedItemIds } } })
      } else {
        await tx.shoppingList.update({
          where: { id: input.shoppingListId },
          data: { status: ShoppingListStatus.COMPLETED, completedAt: new Date() },
        })
      }
    } else if (input.shoppingListId) {
      await tx.shoppingList.update({
        where: { id: input.shoppingListId },
        data: { status: ShoppingListStatus.COMPLETED, completedAt: new Date() },
      })
    }

    return { purchaseId: created.id, pendingListId }
  })

  return result
}

export async function syncPurchaseItemFromListItem(itemId: string): Promise<string | null> {
  const item = await prisma.shoppingListItem.findUnique({
    where: { id: itemId },
    include: {
      shoppingList: { select: { status: true, id: true } },
    },
  })

  if (!item || item.shoppingList.status !== ShoppingListStatus.COMPLETED) {
    return null
  }

  const purchase = await prisma.purchase.findFirst({
    where: { shoppingListId: item.shoppingListId },
    orderBy: { purchasedAt: "desc" },
    include: { items: true },
  })

  if (!purchase) {
    return null
  }

  const quantity = Number(item.quantity)
  const purchaseItem = purchase.items.find(
    (row) =>
      row.productId === item.productId &&
      row.unit === item.unit &&
      Number(row.quantity) === quantity,
  )

  if (!purchaseItem) {
    return purchase.id
  }

  const price = item.price != null ? Number(item.price) : null
  const totalPrice = computeLineTotal(price, quantity, item.priceMode)
  const unitPrice = item.priceMode === "TOTAL" ? null : price

  await prisma.$transaction(async (tx) => {
    await tx.purchaseItem.update({
      where: { id: purchaseItem.id },
      data: { unitPrice, totalPrice },
    })

    const allItems = await tx.purchaseItem.findMany({
      where: { purchaseId: purchase.id },
    })

    const allPriced = allItems.every((row) => row.totalPrice != null)
    if (!allPriced) {
      return
    }

    const totalAmount = allItems.reduce((sum, row) => sum + Number(row.totalPrice ?? 0), 0)
    await tx.purchase.update({
      where: { id: purchase.id },
      data: { totalAmount },
    })
  })

  return purchase.id
}

export async function getPurchaseHistory(householdId: string): Promise<PurchaseSummaryDTO[]> {
  const purchases = await prisma.purchase.findMany({
    where: { householdId, kind: ListKind.GROCERY },
    orderBy: { purchasedAt: "desc" },
    include: {
      shoppingList: { select: { name: true } },
      _count: { select: { items: true } },
    },
  })

  return purchases.map((purchase) => ({
    id: purchase.id,
    listName: purchase.shoppingList?.name ?? null,
    purchasedAt: purchase.purchasedAt.toISOString(),
    totalAmount: Number(purchase.totalAmount),
    itemCount: purchase._count.items,
    storeName: purchase.storeName,
  }))
}

export async function getPurchaseHouseholdId(purchaseId: string): Promise<string | null> {
  const purchase = await prisma.purchase.findUnique({
    where: { id: purchaseId },
    select: { householdId: true },
  })

  return purchase?.householdId ?? null
}

export async function getPurchaseDetail(purchaseId: string): Promise<PurchaseDetailDTO | null> {
  const purchase = await prisma.purchase.findUnique({
    where: { id: purchaseId },
    include: {
      shoppingList: { select: { name: true } },
      items: { orderBy: { productName: "asc" } },
    },
  })

  if (!purchase) {
    return null
  }

  return {
    id: purchase.id,
    listName: purchase.shoppingList?.name ?? null,
    purchasedAt: purchase.purchasedAt.toISOString(),
    totalAmount: Number(purchase.totalAmount),
    storeName: purchase.storeName,
    notes: purchase.notes,
    items: purchase.items.map((item) => ({
      id: item.id,
      productName: item.productName,
      quantity: Number(item.quantity),
      unit: item.unit,
      unitPrice: item.unitPrice != null ? Number(item.unitPrice) : null,
      totalPrice: item.totalPrice != null ? Number(item.totalPrice) : null,
    })),
  }
}

/** Mercado da compra mais recente, para pré-selecionar na finalização. */
export async function getLastPurchaseStoreName(householdId: string): Promise<string | null> {
  const purchase = await prisma.purchase.findFirst({
    where: { householdId },
    orderBy: { purchasedAt: "desc" },
    select: { storeName: true },
  })

  return purchase?.storeName ?? null
}

/** Totais das últimas compras de mercado (mais recentes primeiro), para a estimativa. */
export async function getRecentPurchaseTotals(householdId: string, limit = 5): Promise<number[]> {
  const purchases = await prisma.purchase.findMany({
    where: { householdId, kind: ListKind.GROCERY },
    orderBy: { purchasedAt: "desc" },
    take: limit,
    select: { totalAmount: true },
  })

  return purchases.map((purchase) => Number(purchase.totalAmount))
}

/**
 * Último preço pago por produto (com mercado e data), para lembrar o usuário e
 * estimar a próxima compra. Quando a compra só registrou o valor total (itens
 * pesados), o preço unitário é derivado de totalPrice/quantity — a referência
 * fica sempre por unidade (R$/kg, R$/un).
 */
export async function getLastPaidPrices(
  householdId: string,
  productIds: string[],
): Promise<Map<string, LastPriceDTO>> {
  if (productIds.length === 0) {
    return new Map()
  }

  const rows = await prisma.purchaseItem.findMany({
    where: {
      productId: { in: productIds },
      purchase: { householdId },
      OR: [{ unitPrice: { not: null } }, { totalPrice: { not: null } }],
    },
    orderBy: { purchase: { purchasedAt: "desc" } },
    select: {
      productId: true,
      unitPrice: true,
      totalPrice: true,
      quantity: true,
      purchase: { select: { storeName: true, purchasedAt: true } },
    },
  })

  const prices = new Map<string, LastPriceDTO>()
  for (const row of rows) {
    if (!row.productId || prices.has(row.productId)) continue

    const quantity = Number(row.quantity)
    const unitPrice =
      row.unitPrice != null
        ? Number(row.unitPrice)
        : row.totalPrice != null && quantity > 0
          ? Math.round((Number(row.totalPrice) / quantity) * 100) / 100
          : null

    if (unitPrice == null || unitPrice <= 0) continue

    prices.set(row.productId, {
      unitPrice,
      storeName: row.purchase.storeName,
      purchasedAt: row.purchase.purchasedAt.toISOString(),
    })
  }

  return prices
}

/** Cobertura mínima de preços para o card da lista exibir uma estimativa honesta. */
const ESTIMATE_MIN_COVERAGE = 0.5

/**
 * Estimativa de total por lista ativa do household, para os cards da grade.
 * Só inclui listas em que ao menos metade dos itens tem preço ou referência.
 */
export async function getActiveListEstimates(householdId: string): Promise<Map<string, number>> {
  const items = await prisma.shoppingListItem.findMany({
    where: { shoppingList: { householdId, status: ShoppingListStatus.ACTIVE } },
    select: {
      shoppingListId: true,
      productId: true,
      quantity: true,
      price: true,
      priceMode: true,
    },
  })

  if (items.length === 0) {
    return new Map()
  }

  const lastPrices = await getLastPaidPrices(householdId, [
    ...new Set(items.map((item) => item.productId)),
  ])

  const byList = new Map<string, EstimatableItem[]>()
  for (const item of items) {
    const group = byList.get(item.shoppingListId) ?? []
    group.push({
      productId: item.productId,
      quantity: Number(item.quantity),
      price: item.price != null ? Number(item.price) : null,
      priceMode: item.priceMode,
    })
    byList.set(item.shoppingListId, group)
  }

  const estimates = new Map<string, number>()
  for (const [listId, listItems] of byList) {
    const estimate = estimateItemsTotal(listItems, (id) => lastPrices.get(id)?.unitPrice)
    const coverage = (estimate.pricedCount + estimate.referencedCount) / listItems.length
    if (estimate.total > 0 && coverage >= ESTIMATE_MIN_COVERAGE) {
      estimates.set(listId, estimate.total)
    }
  }

  return estimates
}

/**
 * Situação de gasto de uma lista-projeto: soma o que já foi comprado, estima o
 * que falta (itens não marcados, pelos últimos preços pagos) e compara com o
 * teto. Retorna null quando a lista não é um projeto.
 */
export async function getProjectBudgetStatus(
  listId: string,
): Promise<ProjectBudgetStatusDTO | null> {
  const list = await prisma.shoppingList.findUnique({
    where: { id: listId },
    select: {
      kind: true,
      budgetCap: true,
      householdId: true,
      items: {
        where: { checked: false },
        select: { productId: true, quantity: true, price: true, priceMode: true },
      },
    },
  })

  if (!list || list.kind !== ListKind.PROJECT) {
    return null
  }

  const spentAgg = await prisma.purchase.aggregate({
    where: { shoppingListId: listId },
    _sum: { totalAmount: true },
  })
  const realizedSpent = round(Number(spentAgg._sum.totalAmount ?? 0))

  const prices = await getLastPaidPrices(
    list.householdId,
    list.items.map((item) => item.productId),
  )
  const estimate = estimateItemsTotal(
    list.items.map((item) => ({
      productId: item.productId,
      quantity: Number(item.quantity),
      price: item.price != null ? Number(item.price) : null,
      priceMode: item.priceMode,
    })),
    (productId) => prices.get(productId)?.unitPrice,
  )

  const budgetCap = list.budgetCap != null ? Number(list.budgetCap) : null

  return {
    budgetCap,
    realizedSpent,
    estimatedRemaining: round(estimate.total),
    projectedTotal: round(realizedSpent + estimate.total),
    remaining: budgetCap != null ? round(budgetCap - realizedSpent) : null,
    percentUsed:
      budgetCap != null && budgetCap > 0 ? round((realizedSpent / budgetCap) * 100) : null,
    unknownCount: estimate.unknownCount,
  }
}

function round(value: number): number {
  return Math.round(value * 100) / 100
}
