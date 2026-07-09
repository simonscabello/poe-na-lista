import { Container } from "@/components/layout/container"
import { Skeleton } from "@/components/ui/skeleton"

export function AdminStoresSkeleton() {
  return (
    <Container size="wide" className="space-y-6 py-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-64" />
      </div>
      <Skeleton className="h-9 w-72 rounded-lg" />
      <div className="flex gap-2">
        <Skeleton className="h-11 flex-1 rounded-xl" />
        <Skeleton className="h-11 w-24 rounded-xl" />
      </div>
      <div className="overflow-hidden rounded-2xl ring-1 ring-border/70">
        {[1, 2, 3, 4, 5].map((id) => (
          <Skeleton
            key={id}
            className="h-16 rounded-none border-b border-border/70 last:border-b-0"
          />
        ))}
      </div>
    </Container>
  )
}
