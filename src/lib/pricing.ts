import type { PriceModeDTO } from "@/types/domain"

export function computeLineTotal(
  price: number | null,
  quantity: number,
  priceMode: PriceModeDTO,
): number | null {
  if (price == null) return null
  return priceMode === "TOTAL" ? price : price * quantity
}
