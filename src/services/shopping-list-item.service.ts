import { prisma } from "@/lib/prisma"

export async function getItemListId(itemId: string): Promise<string | null> {
  const item = await prisma.shoppingListItem.findUnique({
    where: { id: itemId },
    select: { shoppingListId: true },
  })

  return item?.shoppingListId ?? null
}

export async function addShoppingListItem(input: {
  shoppingListId: string
  productId: string
  quantity: number
  unit?: string | null
  notes?: string | null
}): Promise<void> {
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

export async function setItemPrice(itemId: string, price: number | null): Promise<void> {
  await prisma.shoppingListItem.update({ where: { id: itemId }, data: { price } })
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
