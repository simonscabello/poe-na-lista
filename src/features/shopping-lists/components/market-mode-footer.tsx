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
 * Resumo do modo mercado em formato compacto: renderizado dentro da barra de
 * adicionar produtos (ao lado do botão), então precisa caber em ~2,5rem para
 * não roubar espaço da lista em telas pequenas.
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

  return (
    <div className="relative min-w-0">
      <div
        className="absolute inset-x-0 top-0 h-0.5 overflow-hidden rounded-full bg-muted"
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

      <p className="flex items-center justify-between gap-2 pt-1.5 text-xs leading-tight text-muted-foreground tabular-nums">
        <span className="shrink-0">
          {checkedCount}/{totalCount} ·{" "}
          <strong className="font-semibold text-foreground">{formatCurrency(checkedTotal)}</strong>
        </span>
        {allChecked ? (
          <span className="truncate font-medium text-primary">Tudo no carrinho 🎉</span>
        ) : (
          <span className="truncate text-right">
            Falta ~{formatCurrency(remainingEstimate)}
            {remainingUnknownCount > 0 && ` · ${remainingUnknownCount} sem preço`}
          </span>
        )}
      </p>
    </div>
  )
}
