import type { ProductDTO, ShoppingListItemDTO } from "@/types/domain"

export const UNCATEGORIZED = "Outros"

export type CategoryGroup = {
  category: string
  items: ShoppingListItemDTO[]
}

function compareByName(a: ShoppingListItemDTO, b: ShoppingListItemDTO): number {
  return a.productName.localeCompare(b.productName, "pt-BR")
}

function categoryKey(item: ShoppingListItemDTO): string {
  return item.category?.trim() || UNCATEGORIZED
}

function categorySortOrder(
  category: string,
  productsById: Map<string, ProductDTO>,
  items: ShoppingListItemDTO[],
): number {
  if (category === UNCATEGORIZED) return Number.POSITIVE_INFINITY

  for (const item of items) {
    if (categoryKey(item) !== category) continue
    const sortOrder = productsById.get(item.productId)?.categorySortOrder
    if (sortOrder != null) return sortOrder
  }

  return Number.POSITIVE_INFINITY - 1
}

export function sortAlphabetically(items: ShoppingListItemDTO[]): ShoppingListItemDTO[] {
  return [...items].sort(compareByName)
}

export function groupByCategory(
  items: ShoppingListItemDTO[],
  productsById: Map<string, ProductDTO>,
): CategoryGroup[] {
  const groups = new Map<string, ShoppingListItemDTO[]>()

  for (const item of items) {
    const key = categoryKey(item)
    const group = groups.get(key) ?? []
    group.push(item)
    groups.set(key, group)
  }

  return [...groups.entries()]
    .sort((a, b) => {
      if (a[0] === UNCATEGORIZED) return 1
      if (b[0] === UNCATEGORIZED) return -1

      const orderA = categorySortOrder(a[0], productsById, a[1])
      const orderB = categorySortOrder(b[0], productsById, b[1])
      if (orderA !== orderB) return orderA - orderB

      return a[0].localeCompare(b[0], "pt-BR")
    })
    .map(([category, groupItems]) => ({
      category,
      items: groupItems.sort(compareByName),
    }))
}
