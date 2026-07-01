import type { MeasureKindDTO, ProductDTO } from "@/types/domain"

export type MeasureConfig = {
  step: number
  minQuantity: number
  defaultQuantity: number
  pricePlaceholder: string
  quantityPresets: number[]
}

export function isMeasurableProduct(product: Pick<ProductDTO, "measureKind">): boolean {
  return product.measureKind !== "UNIT"
}

export function getMeasureConfig(
  product: Pick<ProductDTO, "measureKind" | "defaultUnit">,
): MeasureConfig {
  switch (product.measureKind) {
    case "WEIGHT":
      return {
        step: 0.5,
        minQuantity: 0.05,
        defaultQuantity: 1,
        pricePlaceholder: formatPriceLabel(product.defaultUnit),
        quantityPresets: [0.5, 1, 1.5, 2],
      }
    case "VOLUME":
      return {
        step: 0.5,
        minQuantity: 0.1,
        defaultQuantity: 1,
        pricePlaceholder: formatPriceLabel(product.defaultUnit),
        quantityPresets: [0.5, 1, 1.5, 2],
      }
    default:
      return {
        step: 1,
        minQuantity: 1,
        defaultQuantity: 1,
        pricePlaceholder: "preço un.",
        quantityPresets: [1, 2, 3, 4, 5],
      }
  }
}

export function getMeasureConfigForItem(
  product: Pick<ProductDTO, "measureKind" | "defaultUnit"> | undefined,
  unit: string | null,
): MeasureConfig {
  if (product) {
    return getMeasureConfig(product)
  }
  if (unit) {
    return getMeasureConfig({ measureKind: inferMeasureKind(unit), defaultUnit: unit })
  }
  return getMeasureConfig({ measureKind: "UNIT", defaultUnit: null })
}

function inferMeasureKind(unit: string): MeasureKindDTO {
  const normalized = unit.trim().toLowerCase()
  if (normalized === "l" || normalized === "ml") return "VOLUME"
  if (normalized === "kg" || normalized === "g") return "WEIGHT"
  return "UNIT"
}

export function formatQuantity(value: number, unit?: string | null): string {
  const formatted = Number.isInteger(value)
    ? String(value)
    : value.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 2 })
  return unit ? `${formatted} ${unit}` : formatted
}

export function formatPriceLabel(unit?: string | null): string {
  if (!unit) return "preço un."
  return `preço/${unit}`
}

export function itemUnitKey(unit: string | null | undefined): string | null {
  const trimmed = unit?.trim()
  return trimmed ? trimmed : null
}

export function itemsMatchForMerge(
  productId: string,
  unitA: string | null | undefined,
  productIdB: string,
  unitB: string | null | undefined,
): boolean {
  return productId === productIdB && itemUnitKey(unitA) === itemUnitKey(unitB)
}

export function roundQuantity(value: number, step: number): number {
  const decimals = step < 1 ? 2 : 0
  const factor = 10 ** decimals
  return Math.round(value * factor) / factor
}

export function nextQuantityDown(
  current: number,
  step: number,
  minQuantity: number,
): number | null {
  const next = roundQuantity(current - step, step)
  if (next < minQuantity) return null
  return next
}

export function nextQuantityUp(current: number, step: number): number {
  return roundQuantity(current + step, step)
}
