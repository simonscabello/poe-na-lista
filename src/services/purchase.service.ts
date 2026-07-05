import { ShoppingListStatus } from "@/generated/prisma/enums"
import { computeLineTotal } from "@/lib/pricing"
import { prisma } from "@/lib/prisma"
import type { PurchaseDetailDTO, PurchaseSummaryDTO } from "@/types/domain"

export type PurchaseItemInput = {
  productId?: string | null
  productName: string
  quantity: number
  unit?: string | null
  unitPrice?: number | null
  totalPrice?: number | null
}

/**
 * Registra uma compra e marca a lista como finalizada em uma única transação,
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
}): Promise<{ purchaseId: string }> {
  const purchase = await prisma.$transaction(async (tx) => {
    const created = await tx.purchase.create({
      data: {
        householdId: input.householdId,
        shoppingListId: input.shoppingListId,
        createdById: input.createdById,
        totalAmount: input.totalAmount,
        purchasedAt: input.purchasedAt,
        storeName: input.storeName ?? null,
        notes: input.notes ?? null,
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

    if (input.shoppingListId) {
      await tx.shoppingList.update({
        where: { id: input.shoppingListId },
        data: { status: ShoppingListStatus.COMPLETED, completedAt: new Date() },
      })
    }

    return created
  })

  return { purchaseId: purchase.id }
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
    where: { householdId },
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

/** Totais das últimas compras da família (mais recentes primeiro), para a estimativa. */
export async function getRecentPurchaseTotals(householdId: string, limit = 5): Promise<number[]> {
  const purchases = await prisma.purchase.findMany({
    where: { householdId },
    orderBy: { purchasedAt: "desc" },
    take: limit,
    select: { totalAmount: true },
  })

  return purchases.map((purchase) => Number(purchase.totalAmount))
}

/** Último preço unitário conhecido por produto, para estimar a próxima compra. */
export async function getLastKnownUnitPrices(
  householdId: string,
  productIds: string[],
): Promise<Map<string, number>> {
  if (productIds.length === 0) {
    return new Map()
  }

  const rows = await prisma.purchaseItem.findMany({
    where: {
      productId: { in: productIds },
      unitPrice: { not: null },
      purchase: { householdId },
    },
    orderBy: { purchase: { purchasedAt: "desc" } },
    select: { productId: true, unitPrice: true },
  })

  const prices = new Map<string, number>()
  for (const row of rows) {
    if (row.productId && !prices.has(row.productId) && row.unitPrice != null) {
      prices.set(row.productId, Number(row.unitPrice))
    }
  }

  return prices
}
