import { Container } from "@/components/layout/container"
import { Skeleton } from "@/components/ui/skeleton"

export function AdminOverviewSkeleton() {
  return (
    <Container size="wide" className="space-y-6 py-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton list
          <Skeleton key={index} className="h-20 rounded-xl" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    </Container>
  )
}
