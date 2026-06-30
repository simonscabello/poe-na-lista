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
      <div className="sticky bottom-0 border-t border-border/60 bg-background/85 pt-3 pb-3 backdrop-blur-xl safe-bottom">
        <Container size="wide">
          <Skeleton className="h-13 w-full rounded-2xl" />
        </Container>
      </div>
    </div>
  )
}
