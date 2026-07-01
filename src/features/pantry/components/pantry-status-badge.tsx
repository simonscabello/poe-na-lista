import { PANTRY_STATUS_LABEL } from "@/lib/pantry-status"
import { cn } from "@/lib/utils"
import type { PantryItemStatus } from "@/types/domain"

const STATUS_CLASSES: Record<PantryItemStatus, string> = {
  available: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  low_stock: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  out: "bg-destructive/10 text-destructive",
  expiring_soon: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
}

export function PantryStatusBadge({
  status,
  className,
}: {
  status: PantryItemStatus
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        STATUS_CLASSES[status],
        className,
      )}
    >
      {PANTRY_STATUS_LABEL[status]}
    </span>
  )
}
