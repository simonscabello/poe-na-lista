import { CalendarDays, Store } from "lucide-react"
import Link from "next/link"
import { formatCalendarDate } from "@/lib/calendar-date"
import { formatCurrency } from "@/lib/format-currency"
import type { PurchaseSummaryDTO } from "@/types/domain"

export function PurchaseHistoryList({ purchases }: { purchases: PurchaseSummaryDTO[] }) {
  return (
    <ul className="space-y-2">
      {purchases.map((purchase) => (
        <li key={purchase.id}>
          <Link
            href={`/dashboard/expenses/${purchase.id}`}
            className="flex items-center gap-3 rounded-2xl bg-card p-4 ring-1 ring-border/70 transition-colors hover:bg-muted/40 active:scale-[0.99]"
          >
            <div className="min-w-0 flex-1 space-y-1">
              <p className="truncate text-sm font-medium">{purchase.listName ?? "Compra avulsa"}</p>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <CalendarDays className="size-3.5" />
                  {formatCalendarDate(purchase.purchasedAt)}
                </span>
                <span>
                  {purchase.itemCount} {purchase.itemCount === 1 ? "item" : "itens"}
                </span>
                {purchase.storeName && (
                  <span className="inline-flex items-center gap-1">
                    <Store className="size-3.5" />
                    {purchase.storeName}
                  </span>
                )}
              </div>
            </div>
            <span className="shrink-0 font-heading text-base font-semibold tabular-nums">
              {formatCurrency(purchase.totalAmount)}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  )
}
