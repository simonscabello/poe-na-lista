import { Skeleton } from "@/components/ui/skeleton"

export function ListsGridSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <div
          // biome-ignore lint/suspicious/noArrayIndexKey: static placeholder list
          key={index}
          className="flex min-h-36 flex-col justify-between rounded-2xl bg-card p-5 ring-1 ring-foreground/10"
        >
          <Skeleton className="h-6 w-2/3" />
          <Skeleton className="mt-2 h-6 w-20 rounded-full" />
          <div className="mt-4 flex items-center gap-2">
            <Skeleton className="size-6 rounded-full" />
            <Skeleton className="size-6 rounded-full" />
            <Skeleton className="size-6 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  )
}
