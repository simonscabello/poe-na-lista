import { Receipt } from "lucide-react"
import Link from "next/link"
import { formatCurrency } from "@/lib/format-currency"
import { cn } from "@/lib/utils"

type OverviewCardsProps = {
  currentMonthTotal: number
  monthlyBudget?: number | null
}

export function OverviewCards({ currentMonthTotal, monthlyBudget = null }: OverviewCardsProps) {
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
    </div>
  )
}
