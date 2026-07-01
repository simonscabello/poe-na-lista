import { Container } from "@/components/layout/container"
import { Skeleton } from "@/components/ui/skeleton"

export function PantrySkeleton() {
  return (
    <Container size="wide" className="space-y-6 py-6">
      <div className="flex items-center justify-between gap-3">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-9 w-28" />
      </div>
      <Skeleton className="h-11 w-full rounded-xl" />
      <div className="flex gap-2">
        {["a", "b", "c"].map((key) => (
          <Skeleton key={key} className="h-9 w-24 rounded-full" />
        ))}
      </div>
      <div className="space-y-2">
        {["a", "b", "c", "d"].map((key) => (
          <Skeleton key={key} className="h-16 w-full rounded-2xl" />
        ))}
      </div>
    </Container>
  )
}
