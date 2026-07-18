"use client"

import { formatCurrency } from "@/lib/format-currency"

type MarketModeFooterProps = {
  checkedCount: number
  totalCount: number
  checkedTotal: number
  remainingEstimate: number
  remainingUnknownCount: number
}

/**
 * Resumo financeiro do modo mercado: progresso da compra, total já no carrinho,
 * estimativa do que falta e total previsto ao fim (baseados nos últimos preços
 * pagos — por isso o "~").
 */
export function MarketModeFooter({
  checkedCount,
  totalCount,
  checkedTotal,
  remainingEstimate,
  remainingUnknownCount,
}: MarketModeFooterProps) {
  const allChecked = totalCount > 0 && checkedCount === totalCount
  const progressPercent = totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 0
  const projectedTotal = checkedTotal + remainingEstimate

  return (
    <div className="space-y-2 rounded-2xl bg-card px-4 py-2.5 text-sm ring-1 ring-border/70">
      <div className="flex items-center justify-between gap-3 text-xs font-medium text-muted-foreground tabular-nums">
        <span>
          {checkedCount} de {totalCount} {totalCount === 1 ? "item" : "itens"} no carrinho
        </span>
        {!allChecked && projectedTotal > 0 && (
          <span>
            Previsto ~<span className="text-foreground">{formatCurrency(projectedTotal)}</span>
          </span>
        )}
      </div>

      <div
        className="h-1.5 overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuenow={progressPercent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Progresso da compra"
      >
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-[var(--duration-fast)]"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="flex items-center justify-between gap-3">
        <span className="text-muted-foreground">
          No carrinho{" "}
          <strong className="font-semibold text-foreground tabular-nums">
            {formatCurrency(checkedTotal)}
          </strong>
        </span>
        {allChecked ? (
          <span className="text-right font-medium text-primary">Tudo no carrinho 🎉</span>
        ) : (
          <span className="text-right text-muted-foreground">
            Falta ~<span className="tabular-nums">{formatCurrency(remainingEstimate)}</span>
            {remainingUnknownCount > 0 && (
              <span className="block text-xs">
                {remainingUnknownCount} {remainingUnknownCount === 1 ? "item" : "itens"} sem
                estimativa
              </span>
            )}
          </span>
        )}
      </div>
    </div>
  )
}
