import { Container } from "@/components/layout/container"
import { Skeleton } from "@/components/ui/skeleton"
import { ListsGridSkeleton } from "@/features/shopping-lists/components/lists-grid-skeleton"

export function ListsPageSkeleton() {
  return (
    <Container size="wide" className="space-y-6 py-6">
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-2">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-4 w-28" />
        </div>
        <Skeleton className="h-10 w-32 rounded-lg" />
      </div>
      <ListsGridSkeleton />
    </Container>
  )
}
