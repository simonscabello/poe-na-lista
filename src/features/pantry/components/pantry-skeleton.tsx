import { Container } from "@/components/layout/container"
import { Skeleton } from "@/components/ui/skeleton"

export function PantrySkeleton() {
  return (
    <Container size="wide" className="space-y-6 py-6">
      <div className="space-y-2">
        <Skeleton className="h-7 w-36" />
        <Skeleton className="h-4 w-52" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-40 w-full rounded-2xl" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-28 w-full rounded-2xl" />
      </div>
    </Container>
  )
}
