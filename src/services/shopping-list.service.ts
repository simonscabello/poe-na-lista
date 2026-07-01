import { prisma } from "@/lib/prisma"
import type { ShoppingListDetail, ShoppingListSummary } from "@/types/domain"

export async function getListsByHousehold(householdId: string): Promise<ShoppingListSummary[]> {
  const lists = await prisma.shoppingList.findMany({
    where: { householdId },
    orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
    include: {
      items: { select: { checked: true } },
    },
  })

  return lists.map((list) => ({
    id: list.id,
    name: list.name,
    totalItems: list.items.length,
    checkedItems: list.items.filter((item) => item.checked).length,
    status: list.status,
    updatedAt: list.updatedAt.toISOString(),
  }))
}

export async function getListDetail(listId: string): Promise<ShoppingListDetail | null> {
  const list = await prisma.shoppingList.findUnique({
    where: { id: listId },
    include: {
      items: {
        orderBy: [{ checked: "asc" }, { createdAt: "asc" }],
        include: { product: { include: { category: true } } },
      },
    },
  })

  if (!list) {
    return null
  }

  return {
    id: list.id,
    name: list.name,
    householdId: list.householdId,
    status: list.status,
    completedAt: list.completedAt?.toISOString() ?? null,
    items: list.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      productName: item.product.name,
      category: item.product.category?.name ?? null,
      quantity: Number(item.quantity),
      unit: item.unit,
      checked: item.checked,
      notes: item.notes,
      price: item.price != null ? Number(item.price) : null,
      priceMode: item.priceMode,
    })),
  }
}

export async function getListHouseholdId(listId: string): Promise<string | null> {
  const list = await prisma.shoppingList.findUnique({
    where: { id: listId },
    select: { householdId: true },
  })

  return list?.householdId ?? null
}

export async function createShoppingList(
  householdId: string,
  createdById: string,
  name: string,
): Promise<string> {
  const list = await prisma.shoppingList.create({
    data: { householdId, createdById, name },
  })

  return list.id
}

export async function renameShoppingList(listId: string, name: string): Promise<void> {
  await prisma.shoppingList.update({ where: { id: listId }, data: { name } })
}

export async function deleteShoppingList(listId: string): Promise<void> {
  await prisma.shoppingList.delete({ where: { id: listId } })
}

export async function duplicateShoppingList(listId: string, createdById: string): Promise<string> {
  const source = await prisma.shoppingList.findUniqueOrThrow({
    where: { id: listId },
    include: { items: true },
  })

  const duplicate = await prisma.shoppingList.create({
    data: {
      householdId: source.householdId,
      createdById,
      name: `${source.name} (cópia)`,
      items: {
        create: source.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          unit: item.unit,
          notes: item.notes,
        })),
      },
    },
  })

  return duplicate.id
}
