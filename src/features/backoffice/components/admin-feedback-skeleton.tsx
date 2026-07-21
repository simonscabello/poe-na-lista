import { Container } from "@/components/layout/container"
import { Skeleton } from "@/components/ui/skeleton"

export function AdminFeedbackSkeleton() {
  return (
    <Container size="wide" className="space-y-6 py-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-56" />
      </div>
      <Skeleton className="h-32 rounded-2xl" />
      <div className="overflow-hidden rounded-2xl ring-1 ring-border/70">
        {[1, 2, 3, 4, 5, 6].map((id) => (
          <Skeleton
            key={id}
            className="h-[104px] rounded-none border-b border-border/70 last:border-b-0"
          />
        ))}
      </div>
    </Container>
  )
}
