/** Normaliza o nome para deduplicar mercados ("Carrefour " e "carrefour" viram o mesmo). */
export function normalizeStoreName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, " ")
}
