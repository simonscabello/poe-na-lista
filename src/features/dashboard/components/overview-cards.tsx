import { Receipt, TrendingUp } from "lucide-react"
import Link from "next/link"
import { formatCurrency } from "@/lib/format-currency"
import type { ExpenseEstimateDTO } from "@/types/domain"

type OverviewCardsProps = {
  currentMonthTotal: number
  estimate: ExpenseEstimateDTO | null
}

export function OverviewCards({ currentMonthTotal, estimate }: OverviewCardsProps) {
  return (
    <div className="space-y-3">
      <Link
        href="/dashboard/expenses"
        className="block rounded-2xl bg-card p-4 ring-1 ring-border/70 transition-colors hover:bg-muted/40 active:scale-[0.99]"
      >
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Receipt className="size-3.5" />
          Gasto do mês
        </span>
        <span className="mt-1 block font-heading text-xl font-semibold tabular-nums">
          {formatCurrency(currentMonthTotal)}
        </span>
      </Link>

      {estimate && (
        <Link
          href="/dashboard/expenses"
          className="flex items-center gap-3 rounded-2xl bg-primary/5 p-4 ring-1 ring-primary/20 transition-colors hover:bg-primary/10 active:scale-[0.99]"
        >
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <TrendingUp className="size-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-xs text-muted-foreground">
              Estimativa da próxima compra
            </span>
            <span className="block font-heading text-base font-semibold tabular-nums">
              {formatCurrency(estimate.min)} a {formatCurrency(estimate.max)}
            </span>
          </span>
        </Link>
      )}
    </div>
  )
}
