import { Star } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { AdminFeedbackDistributionDTO } from "@/types/domain"

type AdminFeedbackSummaryProps = {
  averageRating: number
  total: number
  distribution: AdminFeedbackDistributionDTO[]
}

export function AdminFeedbackSummary({
  averageRating,
  total,
  distribution,
}: AdminFeedbackSummaryProps) {
  const rounded = Math.round(averageRating)

  return (
    <Card className="ring-1 ring-border/70">
      <CardContent className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <div className="flex shrink-0 flex-col items-center gap-1 sm:w-32">
          <span className="font-heading text-4xl font-semibold tabular-nums">
            {averageRating.toFixed(1)}
          </span>
          <span className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((value) => (
              <Star
                key={value}
                className={cn(
                  "size-4",
                  value <= rounded
                    ? "fill-primary text-primary"
                    : "fill-transparent text-muted-foreground/40",
                )}
              />
            ))}
          </span>
          <span className="text-xs text-muted-foreground">
            {total} avaliaç{total === 1 ? "ão" : "ões"}
          </span>
        </div>

        <div className="min-w-0 flex-1 space-y-1.5">
          {distribution.map(({ rating, count }) => {
            const percent = total > 0 ? (count / total) * 100 : 0

            return (
              <div key={rating} className="flex items-center gap-2">
                <span className="flex w-8 shrink-0 items-center gap-0.5 text-xs text-muted-foreground tabular-nums">
                  {rating}
                  <Star className="size-3 fill-muted-foreground/40 text-muted-foreground/40" />
                </span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <span className="w-6 shrink-0 text-right text-xs text-muted-foreground tabular-nums">
                  {count}
                </span>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
