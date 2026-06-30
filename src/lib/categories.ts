/**
 * UI-only helpers for presenting product categories.
 *
 * Categories are free-text strings stored on each Product (no dedicated table),
 * so this module derives emoji/labels purely for presentation. It never touches
 * business rules — it only makes the catalog pleasant to browse by touch.
 */

const CATEGORY_EMOJI: Record<string, string> = {
  laticínios: "🥛",
  laticinios: "🥛",
  frios: "🧀",
  padaria: "🍞",
  carnes: "🥩",
  carne: "🥩",
  aves: "🍗",
  peixes: "🐟",
  mercearia: "🥫",
  grãos: "🌾",
  graos: "🌾",
  limpeza: "🧹",
  bebidas: "🥤",
  frutas: "🍎",
  hortifruti: "🥬",
  verduras: "🥬",
  legumes: "🥕",
  congelados: "🧊",
  pet: "🐶",
  higiene: "🧴",
  doces: "🍫",
  matinais: "🥣",
  temperos: "🧂",
  bebês: "🍼",
  bebes: "🍼",
}

/** Per-product overrides so the most common items get a recognizable glyph. */
const PRODUCT_EMOJI: Array<[RegExp, string]> = [
  [/leite/i, "🥛"],
  [/caf[eé]/i, "☕"],
  [/p[ãa]o/i, "🍞"],
  [/ovo/i, "🥚"],
  [/manteiga/i, "🧈"],
  [/queijo/i, "🧀"],
  [/arroz/i, "🍚"],
  [/feij[ãa]o/i, "🫘"],
  [/banana/i, "🍌"],
  [/ma[çc][ãa]/i, "🍎"],
  [/tomate/i, "🍅"],
  [/a[çc][úu]car/i, "🧂"],
  [/papel\s*higi[êe]nico/i, "🧻"],
  [/detergente|sab[ãa]o/i, "🧴"],
  [/cerveja/i, "🍺"],
  [/[áa]gua/i, "💧"],
  [/refrigerante|coca|guaran[áa]/i, "🥤"],
  [/frango|galinha/i, "🍗"],
  [/carne|bife|patinho/i, "🥩"],
  [/macarr[ãa]o|massa/i, "🍝"],
  [/chocolate/i, "🍫"],
]

const DEFAULT_EMOJI = "🛒"

/** Emoji for a category chip / fallback grouping. */
export function categoryEmoji(category: string | null | undefined): string {
  if (!category) return DEFAULT_EMOJI
  return CATEGORY_EMOJI[category.trim().toLowerCase()] ?? DEFAULT_EMOJI
}

/** Emoji that best represents a single product (name wins over category). */
export function productEmoji(name: string, category: string | null | undefined): string {
  for (const [pattern, emoji] of PRODUCT_EMOJI) {
    if (pattern.test(name)) return emoji
  }
  return categoryEmoji(category)
}

export const ALL_CATEGORIES = "__all__" as const
