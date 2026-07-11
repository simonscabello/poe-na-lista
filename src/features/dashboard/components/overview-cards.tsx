import { Receipt, TrendingUp } from "lucide-react"
import Link from "next/link"
import { formatCurrency } from "@/lib/format-currency"
import { cn } from "@/lib/utils"
import type { ExpenseEstimateDTO } from "@/types/domain"

type OverviewCardsProps = {
  currentMonthTotal: number
  monthlyBudget?: number | null
  estimate: ExpenseEstimateDTO | null
}

export function OverviewCards({
  currentMonthTotal,
  monthlyBudget = null,
  estimate,
}: OverviewCardsProps) {
  const budgetPercent =
    monthlyBudget != null && monthlyBudget > 0 ? (currentMonthTotal / monthlyBudget) * 100 : null

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
          {monthlyBudget != null && (
            <span className="text-sm font-normal text-muted-foreground">
              {" "}
              de {formatCurrency(monthlyBudget)}
            </span>
          )}
        </span>
        {budgetPercent != null && (
          <span className="mt-2 block h-1.5 overflow-hidden rounded-full bg-muted">
            <span
              className={cn(
                "block h-full rounded-full",
                budgetPercent > 100
                  ? "bg-destructive"
                  : budgetPercent >= 80
                    ? "bg-amber-500"
                    : "bg-primary",
              )}
              style={{ width: `${Math.min(budgetPercent, 100)}%` }}
            />
          </span>
        )}
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
