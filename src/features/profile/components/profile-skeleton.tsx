import { Container } from "@/components/layout/container"
import { Skeleton } from "@/components/ui/skeleton"

export function ProfileSkeleton() {
  return (
    <Container size="narrow" className="space-y-6 py-6">
      <div className="flex items-center gap-3">
        <Skeleton className="size-10 rounded-full" />
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-3 w-48" />
        </div>
      </div>
      {Array.from({ length: 2 }).map((_, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: static placeholder list
        <div key={index} className="space-y-3 rounded-xl bg-card p-4 ring-1 ring-foreground/10">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-56" />
          <Skeleton className="h-9 w-full" />
        </div>
      ))}
      <Skeleton className="h-10 w-full" />
    </Container>
  )
}
