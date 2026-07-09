import { Container } from "@/components/layout/container"
import { Skeleton } from "@/components/ui/skeleton"

export function AdminProductsSkeleton() {
  return (
    <Container size="wide" className="space-y-6 py-6">
      <div className="flex items-center justify-between gap-2">
        <div className="space-y-2">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-56" />
        </div>
        <Skeleton className="h-10 w-32 rounded-lg" />
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Skeleton className="h-11 flex-1 rounded-xl" />
        <Skeleton className="h-11 rounded-xl sm:w-48" />
        <Skeleton className="h-11 w-24 rounded-xl" />
      </div>
      <div className="overflow-hidden rounded-2xl ring-1 ring-border/70">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((id) => (
          <Skeleton
            key={id}
            className="h-16 rounded-none border-b border-border/70 last:border-b-0"
          />
        ))}
      </div>
    </Container>
  )
}
