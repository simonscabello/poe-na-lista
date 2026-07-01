import type { ExpenseEstimateDTO } from "@/types/domain"

/** Margem aplicada em torno do valor-base para formar a faixa da estimativa. */
export const ESTIMATE_MARGIN = 0.1

/**
 * Estimativa transparente da próxima compra, apresentada sempre como faixa.
 *
 * O valor-base é o maior entre:
 * - a média das últimas compras da família (`recentTotals`);
 * - a soma dos últimos preços conhecidos dos produtos já na lista atual
 *   (`itemBasedTotal`), quando houver histórico de preços.
 *
 * A faixa é `base * (1 ± {@link ESTIMATE_MARGIN})`. Retorna `null` quando não há
 * dados suficientes para uma estimativa honesta.
 */
export function buildExpenseEstimate(input: {
  recentTotals: number[]
  itemBasedTotal: number | null
}): ExpenseEstimateDTO | null {
  const validTotals = input.recentTotals.filter((total) => total > 0)
  const average =
    validTotals.length > 0
      ? validTotals.reduce((sum, total) => sum + total, 0) / validTotals.length
      : 0

  const itemBased = input.itemBasedTotal ?? 0
  const base = Math.max(average, itemBased)

  if (base <= 0) {
    return null
  }

  const hasItemPricing = itemBased > 0
  const method = hasItemPricing
    ? "Baseada nos últimos preços dos produtos da lista atual e na média das últimas compras."
    : "Baseada na média das suas últimas compras. Fica mais precisa quando você informa os preços dos itens."

  return {
    min: roundCurrency(base * (1 - ESTIMATE_MARGIN)),
    max: roundCurrency(base * (1 + ESTIMATE_MARGIN)),
    basedOnPurchases: validTotals.length,
    hasItemPricing,
    method,
  }
}

function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100
}
