import { prisma } from "@/lib/prisma"
import type { PriceModeDTO } from "@/types/domain"

export async function getItemListId(itemId: string): Promise<string | null> {
  const item = await prisma.shoppingListItem.findUnique({
    where: { id: itemId },
    select: { shoppingListId: true },
  })

  return item?.shoppingListId ?? null
}

export type ItemToggleContext = {
  listId: string
  householdId: string
  productId: string
  price: number | null
  priceMode: PriceModeDTO
}

export async function getItemToggleContext(itemId: string): Promise<ItemToggleContext | null> {
  const item = await prisma.shoppingListItem.findUnique({
    where: { id: itemId },
    select: {
      shoppingListId: true,
      productId: true,
      price: true,
      priceMode: true,
      shoppingList: { select: { householdId: true } },
    },
  })

  if (!item) return null

  return {
    listId: item.shoppingListId,
    householdId: item.shoppingList.householdId,
    productId: item.productId,
    price: item.price != null ? Number(item.price) : null,
    priceMode: item.priceMode,
  }
}

export async function addShoppingListItem(input: {
  shoppingListId: string
  productId: string
  quantity: number
  unit?: string | null
  notes?: string | null
  priceMode?: PriceModeDTO
}): Promise<void> {
  // Não confiar só na UI: a lista precisa existir e estar ativa, e o produto
  // precisa ser global ou do próprio grupo da lista (evita referenciar produto
  // privado de outra família por id).
  const list = await prisma.shoppingList.findUnique({
    where: { id: input.shoppingListId },
    select: { status: true, householdId: true },
  })
  if (!list) {
    throw new Error("Lista não encontrada")
  }
  if (list.status !== "ACTIVE") {
    throw new Error("Esta lista já foi finalizada")
  }

  const product = await prisma.product.findUnique({
    where: { id: input.productId },
    select: { active: true, isGlobal: true, householdId: true },
  })
  if (!product?.active) {
    throw new Error("Produto indisponível")
  }
  if (!product.isGlobal && product.householdId !== list.householdId) {
    throw new Error("Produto indisponível")
  }

  const existing = await prisma.shoppingListItem.findFirst({
    where: {
      shoppingListId: input.shoppingListId,
      productId: input.productId,
      unit: input.unit ?? null,
    },
  })

  if (existing) {
    await prisma.shoppingListItem.update({
      where: { id: existing.id },
      data: {
        quantity: { increment: input.quantity },
        checked: false,
        notes: input.notes ?? existing.notes,
      },
    })
  } else {
    await prisma.shoppingListItem.create({
      data: {
        shoppingListId: input.shoppingListId,
        productId: input.productId,
        quantity: input.quantity,
        unit: input.unit ?? null,
        notes: input.notes ?? null,
        priceMode: input.priceMode ?? "UNIT",
      },
    })
  }

  await prisma.shoppingList.update({
    where: { id: input.shoppingListId },
    data: { updatedAt: new Date() },
  })
}

export async function setItemChecked(itemId: string, checked: boolean): Promise<void> {
  await prisma.shoppingListItem.update({ where: { id: itemId }, data: { checked } })
}

export async function setItemPrice(
  itemId: string,
  price: number | null,
  priceMode: PriceModeDTO,
): Promise<void> {
  await prisma.shoppingListItem.update({ where: { id: itemId }, data: { price, priceMode } })
}

export async function updateItemQuantity(
  itemId: string,
  quantity: number,
  unit?: string | null,
): Promise<void> {
  await prisma.shoppingListItem.update({
    where: { id: itemId },
    data: { quantity, unit: unit ?? null },
  })
}

export async function removeShoppingListItem(itemId: string): Promise<void> {
  await prisma.shoppingListItem.delete({ where: { id: itemId } })
}
