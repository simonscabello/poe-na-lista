import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react"
import { formatCurrency } from "@/lib/format-currency"
import { cn } from "@/lib/utils"
import type { ExpenseMetricsDTO } from "@/types/domain"

export function ExpenseMetricsCards({ metrics }: { metrics: ExpenseMetricsDTO }) {
  return (
    <div className="space-y-3">
      <div className="rounded-2xl bg-card p-5 ring-1 ring-border/70">
        <p className="text-section-label">Gasto do mês</p>
        <p className="mt-1 font-heading text-3xl font-semibold tracking-tight tabular-nums">
          {formatCurrency(metrics.currentMonthTotal)}
        </p>
        <MonthComparison
          percentChange={metrics.percentChange}
          previous={metrics.previousMonthTotal}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <MetricCard label="Mês anterior" value={formatCurrency(metrics.previousMonthTotal)} />
        <MetricCard label="Média por compra" value={formatCurrency(metrics.averageLastPurchases)} />
        <MetricCard label="Média mensal" value={formatCurrency(metrics.monthlyAverage)} />
        <MetricCard label="Maior compra" value={formatCurrency(metrics.largestPurchase)} />
      </div>
    </div>
  )
}

function MonthComparison({
  percentChange,
  previous,
}: {
  percentChange: number | null
  previous: number
}) {
  if (percentChange == null || previous === 0) {
    return null
  }

  const up = percentChange > 0
  const flat = percentChange === 0
  const Icon = flat ? Minus : up ? ArrowUpRight : ArrowDownRight

  return (
    <p
      className={cn(
        "mt-2 flex items-center gap-1 text-xs font-medium",
        flat && "text-muted-foreground",
        up && "text-destructive",
        !up && !flat && "text-emerald-600 dark:text-emerald-400",
      )}
    >
      <Icon className="size-3.5" />
      {Math.abs(percentChange).toFixed(1)}% em relação ao mês anterior
    </p>
  )
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-card p-4 ring-1 ring-border/70">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-heading text-lg font-semibold tabular-nums">{value}</p>
    </div>
  )
}
