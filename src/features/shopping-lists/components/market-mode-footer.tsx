"use client"

import { formatCurrency } from "@/lib/format-currency"

type MarketModeFooterProps = {
  checkedTotal: number
  remainingEstimate: number
  remainingUnknownCount: number
}

/**
 * Resumo financeiro do modo mercado: total já no carrinho e estimativa do que
 * falta (baseada nos últimos preços pagos — por isso o "~").
 */
export function MarketModeFooter({
  checkedTotal,
  remainingEstimate,
  remainingUnknownCount,
}: MarketModeFooterProps) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl bg-card px-4 py-2.5 text-sm ring-1 ring-border/70">
      <span className="text-muted-foreground">
        No carrinho{" "}
        <strong className="font-semibold text-foreground tabular-nums">
          {formatCurrency(checkedTotal)}
        </strong>
      </span>
      <span className="text-right text-muted-foreground">
        Falta ~<span className="tabular-nums">{formatCurrency(remainingEstimate)}</span>
        {remainingUnknownCount > 0 && (
          <span className="block text-xs">
            {remainingUnknownCount} {remainingUnknownCount === 1 ? "item" : "itens"} sem estimativa
          </span>
        )}
      </span>
    </div>
  )
}
