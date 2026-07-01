import { ShieldCheck } from "lucide-react"
import { Container } from "@/components/layout/container"
import { Skeleton } from "@/components/ui/skeleton"

export function BackofficeLayoutSkeleton() {
  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <Container size="wide" className="flex h-14 items-center justify-between gap-2">
          <span className="flex items-center gap-2 font-semibold tracking-tight">
            <ShieldCheck className="size-5 text-primary" />
            Backoffice
          </span>
          <Skeleton className="h-4 w-24 rounded-md" />
        </Container>
      </header>
      <div className="border-b border-border/60 bg-background">
        <Container size="wide" className="flex gap-1 py-2.5">
          <Skeleton className="h-5 w-24 rounded-md" />
          <Skeleton className="h-5 w-20 rounded-md" />
        </Container>
      </div>
      <main className="flex-1">
        <Container size="wide" className="space-y-6 py-6">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48 rounded-md" />
            <Skeleton className="h-4 w-64 rounded-md" />
          </div>
          <Skeleton className="h-64 rounded-xl" />
        </Container>
      </main>
    </>
  )
}
