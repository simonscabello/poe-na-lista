import type { Prisma } from "@/generated/prisma/client"
import { prisma } from "@/lib/prisma"
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

export type LowStockItem = {
  productId: string
  productName: string
  /** Quanto repor: o déficit até o mínimo, arredondado para cima em produtos unitários. */
  restockQuantity: number
  unit: string | null
  priceMode: "UNIT" | "TOTAL"
}

export async function getLowStockPantryItems(householdId: string): Promise<LowStockItem[]> {
  const items = await prisma.pantryItem.findMany({
    where: { householdId },
    include: {
      product: { select: { name: true, active: true, measureKind: true, pricedByWeight: true } },
    },
  })

  return items
    .filter((item) => item.product.active && Number(item.quantity) < Number(item.minimumQuantity))
    .map((item) => {
      const deficit = Number(item.minimumQuantity) - Number(item.quantity)
      const restockQuantity =
        item.product.measureKind === "WEIGHT"
          ? Math.round(deficit * 100) / 100
          : Math.max(Math.ceil(deficit), 1)
      return {
        productId: item.productId,
        productName: item.product.name,
        restockQuantity,
        unit: item.unit,
        priceMode: item.product.pricedByWeight ? ("TOTAL" as const) : ("UNIT" as const),
      }
    })
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
