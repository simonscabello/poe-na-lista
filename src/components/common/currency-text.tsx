import { formatCurrencyParts } from "@/lib/format-currency"
import { cn } from "@/lib/utils"

type CurrencyTextProps = {
  value: number
  className?: string
}

export function CurrencyText({ value, className }: CurrencyTextProps) {
  const { negative, integer, decimal } = formatCurrencyParts(value)

  return (
    <span className={cn("tabular-nums", className)}>
      {negative ? "-" : null}
      R$ {integer},{decimal}
    </span>
  )
}
