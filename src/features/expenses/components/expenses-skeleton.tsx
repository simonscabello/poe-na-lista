import { Container } from "@/components/layout/container"
import { Skeleton } from "@/components/ui/skeleton"

export function ExpensesSkeleton() {
  return (
    <Container size="wide" className="space-y-6 py-6">
      <Skeleton className="h-8 w-28" />
      <Skeleton className="h-28 w-full rounded-2xl" />
      <div className="grid grid-cols-2 gap-3">
        {["a", "b", "c", "d"].map((key) => (
          <Skeleton key={key} className="h-20 w-full rounded-2xl" />
        ))}
      </div>
      <div className="space-y-2">
        {["a", "b", "c"].map((key) => (
          <Skeleton key={key} className="h-20 w-full rounded-2xl" />
        ))}
      </div>
    </Container>
  )
}
