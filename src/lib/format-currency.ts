const CURRENCY_PREFIX = "R$\u0020"

type CurrencyParts = {
  negative: boolean
  integer: string
  decimal: string
}

export function formatCurrencyParts(value: number): CurrencyParts {
  const negative = value < 0
  const cents = Math.round(Math.abs(value) * 100)
  const integerPart = Math.floor(cents / 100)
  const decimalPart = (cents % 100).toString().padStart(2, "0")
  const withThousands = integerPart.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")

  return { negative, integer: withThousands, decimal: decimalPart }
}

export function formatCurrency(value: number): string {
  const { negative, integer, decimal } = formatCurrencyParts(value)

  if (negative) {
    return `-${CURRENCY_PREFIX}${integer},${decimal}`
  }

  return `${CURRENCY_PREFIX}${integer},${decimal}`
}
