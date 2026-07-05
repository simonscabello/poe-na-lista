export function formatCurrencyInputFromNumber(value: number): string {
  return value.toFixed(2).replace(".", ",")
}

export function applyCurrencyInputMask(digits: string): string {
  const normalized = digits.replace(/\D/g, "")
  if (normalized.length === 0) return ""
  const cents = Number.parseInt(normalized, 10)
  return (cents / 100).toFixed(2).replace(".", ",")
}

export function parseCurrencyInput(value: string): number | null {
  const trimmed = value.trim()
  if (!trimmed) return null
  const normalized = trimmed.replace(",", ".")
  const parsed = Number(normalized)
  if (Number.isNaN(parsed) || parsed < 0) return null
  return parsed
}
