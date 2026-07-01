import type { Prisma } from "@/generated/prisma/client"
import { computePantryStatus } from "@/lib/pantry-status"
import { prisma } from "@/lib/prisma"
import type { PantryItemDTO } from "@/types/domain"

const withRelations = {
  include: {
    product: { include: { category: true } },
    updatedBy: { select: { name: true } },
  },
} satisfies Prisma.PantryItemDefaultArgs

type PantryItemWithRelations = Prisma.PantryItemGetPayload<typeof withRelations>

function toPantryItemDTO(item: PantryItemWithRelations): PantryItemDTO {
  const quantity = Number(item.quantity)
  const minimumQuantity = Number(item.minimumQuantity)

  return {
    id: item.id,
    productId: item.productId,
    productName: item.product.name,
    categoryId: item.product.categoryId,
    categoryName: item.product.category?.name ?? null,
    quantity,
    minimumQuantity,
    unit: item.unit,
    expirationDate: item.expirationDate?.toISOString() ?? null,
    status: computePantryStatus(quantity, minimumQuantity, item.expirationDate),
    updatedByName: item.updatedBy?.name ?? null,
    updatedAt: item.updatedAt.toISOString(),
  }
}

export async function getPantryItems(householdId: string): Promise<PantryItemDTO[]> {
  const items = await prisma.pantryItem.findMany({
    where: { householdId },
    orderBy: [{ product: { name: "asc" } }],
    ...withRelations,
  })

  return items.map(toPantryItemDTO)
}

export async function getPantryItemHouseholdId(pantryItemId: string): Promise<string | null> {
  const item = await prisma.pantryItem.findUnique({
    where: { id: pantryItemId },
    select: { householdId: true },
  })

  return item?.householdId ?? null
}

export async function addPantryItem(input: {
  householdId: string
  productId: string
  quantity: number
  minimumQuantity: number
  unit?: string | null
  expirationDate?: Date | null
  updatedById: string
}): Promise<PantryItemDTO> {
  const item = await prisma.pantryItem.upsert({
    where: {
      householdId_productId: { householdId: input.householdId, productId: input.productId },
    },
    create: {
      householdId: input.householdId,
      productId: input.productId,
      quantity: input.quantity,
      minimumQuantity: input.minimumQuantity,
      unit: input.unit ?? null,
      expirationDate: input.expirationDate ?? null,
      updatedById: input.updatedById,
    },
    update: {
      quantity: input.quantity,
      minimumQuantity: input.minimumQuantity,
      unit: input.unit ?? null,
      expirationDate: input.expirationDate ?? null,
      updatedById: input.updatedById,
    },
    ...withRelations,
  })

  return toPantryItemDTO(item)
}

export async function updatePantryItem(
  pantryItemId: string,
  input: {
    quantity: number
    minimumQuantity: number
    unit?: string | null
    expirationDate?: Date | null
  },
  updatedById: string,
): Promise<PantryItemDTO> {
  const item = await prisma.pantryItem.update({
    where: { id: pantryItemId },
    data: {
      quantity: input.quantity,
      minimumQuantity: input.minimumQuantity,
      unit: input.unit ?? null,
      expirationDate: input.expirationDate ?? null,
      updatedById,
    },
    ...withRelations,
  })

  return toPantryItemDTO(item)
}

export async function setPantryItemQuantity(
  pantryItemId: string,
  quantity: number,
  updatedById: string,
): Promise<PantryItemDTO> {
  const item = await prisma.pantryItem.update({
    where: { id: pantryItemId },
    data: { quantity: Math.max(0, quantity), updatedById },
    ...withRelations,
  })

  return toPantryItemDTO(item)
}

export async function removePantryItem(pantryItemId: string): Promise<void> {
  await prisma.pantryItem.delete({ where: { id: pantryItemId } })
}

/**
 * Repõe a despensa a partir de itens comprados, somando às quantidades existentes.
 * Usado no passo opcional após finalizar uma compra.
 */
export async function stockPantryItems(
  householdId: string,
  updatedById: string,
  items: Array<{ productId: string; quantity: number; unit?: string | null }>,
): Promise<void> {
  await prisma.$transaction(
    items.map((item) =>
      prisma.pantryItem.upsert({
        where: { householdId_productId: { householdId, productId: item.productId } },
        create: {
          householdId,
          productId: item.productId,
          quantity: item.quantity,
          unit: item.unit ?? null,
          updatedById,
        },
        update: {
          quantity: { increment: item.quantity },
          updatedById,
        },
      }),
    ),
  )
}

/** IDs de produtos já presentes na despensa da casa (para evitar duplicação na UI). */
export async function getPantryProductIds(householdId: string): Promise<string[]> {
  const items = await prisma.pantryItem.findMany({
    where: { householdId },
    select: { productId: true },
  })

  return items.map((item) => item.productId)
}
