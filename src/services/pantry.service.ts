import type { Prisma } from "@/generated/prisma/client"
import { getMeasureConfig, itemUnitKey } from "@/lib/measure"
import { prisma } from "@/lib/prisma"
import { getMostRecentActiveListId } from "@/services/shopping-list.service"
import type { PantryItemDTO } from "@/types/domain"

type PantryEntryInput = {
  productId: string
  quantity: number
  unit: string | null
}

/**
 * Registra a entrada dos itens de uma compra na despensa (dentro da transação
 * da finalização). Mesma unidade (ou despensa zerada) soma; unidade diferente
 * substitui quantidade e unidade — não dá para somar kg com un.
 */
export async function addPurchaseToPantry(
  tx: Prisma.TransactionClient,
  input: {
    householdId: string
    updatedById: string
    items: PantryEntryInput[]
  },
): Promise<void> {
  for (const item of input.items) {
    if (item.quantity <= 0) continue

    const existing = await tx.pantryItem.findUnique({
      where: {
        householdId_productId: { householdId: input.householdId, productId: item.productId },
      },
      select: { id: true, quantity: true, unit: true },
    })

    if (!existing) {
      await tx.pantryItem.create({
        data: {
          householdId: input.householdId,
          productId: item.productId,
          quantity: item.quantity,
          unit: item.unit,
          updatedById: input.updatedById,
        },
      })
      continue
    }

    const sameUnit = (existing.unit ?? null) === (item.unit ?? null)
    const canMerge = sameUnit || Number(existing.quantity) === 0

    await tx.pantryItem.update({
      where: { id: existing.id },
      data: canMerge
        ? {
            quantity: { increment: item.quantity },
            unit: item.unit ?? existing.unit,
            updatedById: input.updatedById,
          }
        : { quantity: item.quantity, unit: item.unit, updatedById: input.updatedById },
    })
  }
}

export async function getPantryItems(householdId: string): Promise<PantryItemDTO[]> {
  const items = await prisma.pantryItem.findMany({
    where: { householdId },
    include: { product: { include: { category: true } } },
    orderBy: { createdAt: "asc" },
  })

  return items
    .map((item) => ({
      id: item.id,
      productId: item.productId,
      productName: item.product.name,
      category: item.product.category?.name ?? null,
      quantity: Number(item.quantity),
      minimumQuantity: Number(item.minimumQuantity),
      unit: item.unit,
      expirationDate: item.expirationDate?.toISOString() ?? null,
      belowMinimum: Number(item.quantity) < Number(item.minimumQuantity),
    }))
    .sort((a, b) => a.productName.localeCompare(b.productName, "pt-BR"))
}

export async function getPantryItemHouseholdId(itemId: string): Promise<string | null> {
  const item = await prisma.pantryItem.findUnique({
    where: { id: itemId },
    select: { householdId: true },
  })

  return item?.householdId ?? null
}

export async function updatePantryItem(
  itemId: string,
  updatedById: string,
  data: {
    quantity?: number
    minimumQuantity?: number
    expirationDate?: Date | null
  },
): Promise<void> {
  await prisma.pantryItem.update({
    where: { id: itemId },
    data: { ...data, updatedById },
  })
}

export async function removePantryItem(itemId: string): Promise<void> {
  await prisma.pantryItem.delete({ where: { id: itemId } })
}

export type PantryListAddItem = {
  productId: string
  productName: string
  quantity: number
  unit: string | null
  priceMode: "UNIT" | "TOTAL"
}

export type PantryListAddInput = Pick<
  PantryListAddItem,
  "productId" | "quantity" | "unit" | "priceMode"
>

export type LowStockItem = PantryListAddItem & {
  /** Quanto repor: o déficit até o mínimo, arredondado para cima em produtos unitários. */
  restockQuantity: number
}

function computePantryListQuantity(input: {
  quantity: number
  minimumQuantity: number
  measureKind: "UNIT" | "WEIGHT"
  defaultUnit: string | null
}): number {
  if (input.quantity < input.minimumQuantity) {
    const deficit = input.minimumQuantity - input.quantity
    if (input.measureKind === "WEIGHT") {
      return Math.round(deficit * 100) / 100
    }
    return Math.max(Math.ceil(deficit), 1)
  }

  return getMeasureConfig({
    measureKind: input.measureKind,
    defaultUnit: input.defaultUnit,
  }).defaultQuantity
}

function toPantryListAddItem(item: {
  productId: string
  quantity: unknown
  minimumQuantity: unknown
  unit: string | null
  product: {
    name: string
    measureKind: "UNIT" | "WEIGHT"
    defaultUnit: string | null
    pricedByWeight: boolean
  }
}): PantryListAddItem {
  const quantity = Number(item.quantity)
  const minimumQuantity = Number(item.minimumQuantity)
  return {
    productId: item.productId,
    productName: item.product.name,
    quantity: computePantryListQuantity({
      quantity,
      minimumQuantity,
      measureKind: item.product.measureKind,
      defaultUnit: item.product.defaultUnit,
    }),
    unit: item.unit,
    priceMode: item.product.pricedByWeight ? "TOTAL" : "UNIT",
  }
}

export async function getPantryItemForListAdd(
  itemId: string,
): Promise<(PantryListAddItem & { householdId: string; belowMinimum: boolean }) | null> {
  const item = await prisma.pantryItem.findUnique({
    where: { id: itemId },
    include: {
      product: {
        select: {
          name: true,
          active: true,
          measureKind: true,
          defaultUnit: true,
          pricedByWeight: true,
        },
      },
    },
  })

  if (!item?.product.active) {
    return null
  }

  const quantity = Number(item.quantity)
  const minimumQuantity = Number(item.minimumQuantity)

  return {
    householdId: item.householdId,
    belowMinimum: quantity < minimumQuantity,
    ...toPantryListAddItem(item),
  }
}

export async function getLowStockPantryItems(householdId: string): Promise<LowStockItem[]> {
  const items = await prisma.pantryItem.findMany({
    where: { householdId },
    include: {
      product: {
        select: {
          name: true,
          active: true,
          measureKind: true,
          defaultUnit: true,
          pricedByWeight: true,
        },
      },
    },
  })

  return items
    .filter((item) => item.product.active && Number(item.quantity) < Number(item.minimumQuantity))
    .map((item) => {
      const listItem = toPantryListAddItem(item)
      return {
        ...listItem,
        restockQuantity: listItem.quantity,
      }
    })
}

function pantryListItemKey(productId: string, unit: string | null): string {
  return `${productId}:${itemUnitKey(unit) ?? ""}`
}

function computeRemainingRestockQuantity(
  restockQuantity: number,
  listQuantity: number,
  priceMode: "UNIT" | "TOTAL",
): number | null {
  const remaining = restockQuantity - listQuantity
  if (priceMode === "TOTAL") {
    const rounded = Math.round(remaining * 100) / 100
    return rounded > 0 ? rounded : null
  }
  if (remaining < 1) {
    return null
  }
  return Math.ceil(remaining)
}

async function getUncheckedListQuantityMap(
  listId: string,
  productIds: string[],
): Promise<Map<string, number>> {
  if (productIds.length === 0) {
    return new Map()
  }

  const listItems = await prisma.shoppingListItem.findMany({
    where: {
      shoppingListId: listId,
      checked: false,
      productId: { in: productIds },
    },
    select: { productId: true, unit: true, quantity: true },
  })

  const quantities = new Map<string, number>()
  for (const item of listItems) {
    const key = pantryListItemKey(item.productId, item.unit)
    quantities.set(key, (quantities.get(key) ?? 0) + Number(item.quantity))
  }

  return quantities
}

function applyListCoverageToRestockItems(
  lowItems: LowStockItem[],
  listQuantities: Map<string, number>,
): LowStockItem[] {
  return lowItems.flatMap((item) => {
    const listQty = listQuantities.get(pantryListItemKey(item.productId, item.unit)) ?? 0
    const remaining = computeRemainingRestockQuantity(item.restockQuantity, listQty, item.priceMode)
    if (remaining == null) {
      return []
    }

    return [{ ...item, restockQuantity: remaining, quantity: remaining }]
  })
}

/** Itens abaixo do mínimo que ainda não estão cobertos na lista ativa mais recente. */
export async function getLowStockPantryItemsNeedingRestock(
  householdId: string,
): Promise<LowStockItem[]> {
  const lowItems = await getLowStockPantryItems(householdId)
  if (lowItems.length === 0) {
    return []
  }

  const listId = await getMostRecentActiveListId(householdId)
  if (!listId) {
    return lowItems
  }

  const listQuantities = await getUncheckedListQuantityMap(
    listId,
    lowItems.map((item) => item.productId),
  )

  return applyListCoverageToRestockItems(lowItems, listQuantities)
}

export async function getPantryItemRestockQuantityAfterListCoverage(
  householdId: string,
  item: PantryListAddItem,
): Promise<number | null> {
  const listId = await getMostRecentActiveListId(householdId)
  if (!listId) {
    return item.quantity
  }

  const listQuantities = await getUncheckedListQuantityMap(listId, [item.productId])
  const listQty = listQuantities.get(pantryListItemKey(item.productId, item.unit)) ?? 0

  return computeRemainingRestockQuantity(item.quantity, listQty, item.priceMode)
}

export type ExpiringPantryItem = {
  productName: string
  expirationDate: Date
}

/** Itens vencidos ou vencendo em até `withinDays` dias. */
export async function getExpiringPantryItems(
  householdId: string,
  withinDays = 3,
): Promise<ExpiringPantryItem[]> {
  const limit = new Date()
  limit.setDate(limit.getDate() + withinDays)

  const items = await prisma.pantryItem.findMany({
    where: { householdId, quantity: { gt: 0 }, expirationDate: { not: null, lte: limit } },
    include: { product: { select: { name: true } } },
    orderBy: { expirationDate: "asc" },
  })

  return items.map((item) => ({
    productName: item.product.name,
    expirationDate: item.expirationDate as Date,
  }))
}
