import { Star } from "lucide-react"
import { EmptyState } from "@/components/common/empty-state"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatCalendarDate } from "@/lib/calendar-date"
import { cn } from "@/lib/utils"
import type { AdminFeedbackSummaryDTO } from "@/types/domain"

type AdminFeedbackListProps = {
  feedback: AdminFeedbackSummaryDTO[]
}

function StarRow({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5" role="img" aria-label={`${rating} de 5 estrelas`}>
      {[1, 2, 3, 4, 5].map((value) => (
        <Star
          key={value}
          className={cn(
            "size-3.5",
            value <= rating
              ? "fill-primary text-primary"
              : "fill-transparent text-muted-foreground/40",
          )}
        />
      ))}
    </span>
  )
}

export function AdminFeedbackList({ feedback }: AdminFeedbackListProps) {
  if (feedback.length === 0) {
    return (
      <EmptyState
        icon={Star}
        title="Nenhuma avaliação ainda"
        description="As avaliações enviadas pelos usuários aparecerão aqui."
      />
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl bg-card ring-1 ring-border/70">
      <ul className="divide-y divide-border/70">
        {feedback.map((item) => {
          const initials = (item.userName ?? item.userEmail ?? "U").slice(0, 1).toUpperCase()

          return (
            <li key={item.id} className="flex items-start gap-3 px-4 py-3">
              <Avatar size="sm" className="mt-0.5">
                {item.userImage && <AvatarImage src={item.userImage} alt={item.userName ?? ""} />}
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1 space-y-1.5">
                <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                  <p className="truncate text-sm font-medium">{item.userName ?? "Sem nome"}</p>
                  <span className="text-xs text-muted-foreground">
                    {formatCalendarDate(item.updatedAt)}
                  </span>
                </div>
                <StarRow rating={item.rating} />
                {item.comment ? (
                  <p className="text-sm text-foreground/90 whitespace-pre-line">{item.comment}</p>
                ) : (
                  <p className="text-xs text-muted-foreground italic">Sem comentário</p>
                )}
                <p className="truncate text-xs text-muted-foreground">
                  {item.userEmail ?? "Sem e-mail"}
                </p>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
