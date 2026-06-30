import { AppLogo } from "@/components/common/app-logo"
import { Container } from "@/components/layout/container"
import { Skeleton } from "@/components/ui/skeleton"

export function DashboardHeaderSkeleton() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <Container size="wide" className="flex h-14 items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <AppLogo size="md" />
          <Skeleton className="h-5 w-28 rounded-md" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="size-9 rounded-lg" />
          <Skeleton className="size-9 rounded-full" />
        </div>
      </Container>
    </header>
  )
}
