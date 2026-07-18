import type { PriceModeDTO } from "@/types/domain"

export function computeLineTotal(
  price: number | null,
  quantity: number,
  priceMode: PriceModeDTO,
): number | null {
  if (price == null) return null
  return priceMode === "TOTAL" ? price : price * quantity
}

export type EstimatableItem = {
  productId: string
  quantity: number
  price: number | null
  priceMode: PriceModeDTO
}

export type ListEstimate = {
  /** Soma dos preços informados + referências dos últimos preços pagos. */
  total: number
  /** Itens com preço informado na própria lista. */
  pricedCount: number
  /** Itens estimados pelo último preço pago. */
  referencedCount: number
  /** Itens sem preço nem referência — ficam de fora do total. */
  unknownCount: number
}

/**
 * Estima o total de um conjunto de itens: usa o preço informado quando existe;
 * senão, o último preço unitário pago pelo household (também vale para itens
 * TOTAL, porque a referência é sempre por unidade — R$/kg, R$/un).
 */
export function estimateItemsTotal(
  items: EstimatableItem[],
  lastUnitPriceOf: (productId: string) => number | null | undefined,
): ListEstimate {
  let total = 0
  let pricedCount = 0
  let referencedCount = 0
  let unknownCount = 0

  for (const item of items) {
    const own = computeLineTotal(item.price, item.quantity, item.priceMode)
    if (own != null && own > 0) {
      total += own
      pricedCount += 1
      continue
    }

    const lastUnitPrice = lastUnitPriceOf(item.productId)
    if (lastUnitPrice != null && lastUnitPrice > 0) {
      total += lastUnitPrice * item.quantity
      referencedCount += 1
      continue
    }

    unknownCount += 1
  }

  return {
    total: Math.round(total * 100) / 100,
    pricedCount,
    referencedCount,
    unknownCount,
  }
}
