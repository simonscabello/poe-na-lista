import { formatCurrency } from "@/lib/format-currency"
import type { CategoryExpenseDTO } from "@/types/domain"

export function CategoryBreakdown({ categories }: { categories: CategoryExpenseDTO[] }) {
  const top = categories.slice(0, 6)
  const max = Math.max(...top.map((category) => category.total), 1)

  return (
    <div className="space-y-3 rounded-2xl bg-card p-5 ring-1 ring-border/70">
      <p className="text-section-label">Categorias com maior gasto</p>
      <ul className="space-y-2.5">
        {top.map((category) => (
          <li key={category.category} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="truncate">{category.category}</span>
              <span className="shrink-0 font-medium tabular-nums">
                {formatCurrency(category.total)}
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${(category.total / max) * 100}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
