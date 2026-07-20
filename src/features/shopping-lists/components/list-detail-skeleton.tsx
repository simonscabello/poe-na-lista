import { Container } from "@/components/layout/container"
import { Skeleton } from "@/components/ui/skeleton"

export function ListDetailSkeleton() {
  return (
    <div className="flex min-h-[calc(100dvh-3.5rem)] flex-col">
      <Container size="wide" className="flex-1 space-y-4 py-4">
        <div className="flex items-center gap-2">
          <Skeleton className="size-7 rounded-lg" />
          <Skeleton className="h-6 w-44" />
        </div>
        <ul className="overflow-hidden rounded-2xl bg-card ring-1 ring-border/70">
          {Array.from({ length: 5 }).map((_, index) => (
            <li
              // biome-ignore lint/suspicious/noArrayIndexKey: static placeholder list
              key={index}
              className="flex items-center gap-3 border-b px-3 py-3.5 last:border-b-0"
            >
              <Skeleton className="size-6 rounded-full" />
              <Skeleton
                className="h-4 flex-1"
                style={{ maxWidth: `${60 + ((index * 7) % 30)}%` }}
              />
            </li>
          ))}
        </ul>
      </Container>
      <div className="sticky bottom-[calc(4rem_+_env(safe-area-inset-bottom))] border-t border-border/60 bg-background/85 py-1.5 backdrop-blur-xl sm:bottom-0 sm:pb-[calc(0.375rem_+_env(safe-area-inset-bottom))]">
        <Container size="wide">
          <div className="flex items-center gap-3">
            <Skeleton className="h-5 min-w-0 flex-1 rounded-md" />
            <Skeleton className="size-11 shrink-0 rounded-xl" />
          </div>
        </Container>
      </div>
    </div>
  )
}
