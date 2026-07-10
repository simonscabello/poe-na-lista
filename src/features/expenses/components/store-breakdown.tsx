import { formatCurrency } from "@/lib/format-currency"
import type { StoreExpenseDTO } from "@/types/domain"

export function StoreBreakdown({ stores }: { stores: StoreExpenseDTO[] }) {
  const top = stores.slice(0, 6)
  const max = Math.max(...top.map((store) => store.total), 1)

  return (
    <div className="space-y-3 rounded-2xl bg-card p-5 ring-1 ring-border/70">
      <p className="text-section-label">Gastos por mercado</p>
      <ul className="space-y-3">
        {top.map((store) => (
          <li key={store.store} className="space-y-1">
            <div className="flex items-center justify-between gap-2 text-sm">
              <span className="truncate">{store.store}</span>
              <span className="shrink-0 font-medium tabular-nums">
                {formatCurrency(store.total)}
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${(store.total / max) * 100}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground tabular-nums">
              {store.purchaseCount} {store.purchaseCount === 1 ? "compra" : "compras"} · média{" "}
              {formatCurrency(store.averagePerPurchase)}
            </p>
          </li>
        ))}
      </ul>
    </div>
  )
}
