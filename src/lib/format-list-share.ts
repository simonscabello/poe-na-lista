import type { PublicListItemDTO, ShoppingListItemDTO } from "@/types/domain"

const UNCATEGORIZED = "Outros"

type ShareableItem = Pick<ShoppingListItemDTO, "productName" | "category" | "quantity" | "unit">

/**
 * Monta o texto de compartilhamento de uma lista, agrupado por categoria.
 * Serve tanto para a Web Share API quanto para o fallback de copiar texto.
 */
export function formatListShareText(input: {
  listName: string
  items: ShareableItem[]
  appUrl?: string | null
}): string {
  const groups = new Map<string, ShareableItem[]>()

  for (const item of input.items) {
    const key = item.category?.trim() || UNCATEGORIZED
    const group = groups.get(key) ?? []
    group.push(item)
    groups.set(key, group)
  }

  const sortedCategories = [...groups.keys()].sort((a, b) => {
    if (a === UNCATEGORIZED) return 1
    if (b === UNCATEGORIZED) return -1
    return a.localeCompare(b, "pt-BR")
  })

  const lines: string[] = [input.listName, ""]

  for (const category of sortedCategories) {
    lines.push(category)
    for (const item of groups.get(category) ?? []) {
      lines.push(`- ${formatItemLabel(item)}`)
    }
    lines.push("")
  }

  lines.push("Criado com o Põe na Lista:")
  if (input.appUrl) {
    lines.push(input.appUrl)
  }

  return lines.join("\n").trim()
}

function formatItemLabel(item: ShareableItem): string {
  const quantity = item.quantity
  const showQuantity = quantity > 1 || (item.unit != null && item.unit !== "")
  if (!showQuantity) {
    return item.productName
  }
  const unit = item.unit ? ` ${item.unit}` : ""
  return `${item.productName} (${formatQuantity(quantity)}${unit})`
}

function formatQuantity(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(2).replace(/\.?0+$/, "")
}

export function toShareableItems(items: PublicListItemDTO[]): ShareableItem[] {
  return items.map((item) => ({
    productName: item.productName,
    category: item.category,
    quantity: item.quantity,
    unit: item.unit,
  }))
}
