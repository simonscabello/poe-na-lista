import { Skeleton } from "@/components/ui/skeleton"

export function ListsGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: static placeholder list
        <div key={index} className="space-y-3 rounded-xl bg-card p-4 ring-1 ring-foreground/10">
          <Skeleton className="h-5 w-2/3" />
          <div className="flex items-center justify-between">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-8" />
          </div>
          <Skeleton className="h-2 w-full rounded-full" />
        </div>
      ))}
    </div>
  )
}
