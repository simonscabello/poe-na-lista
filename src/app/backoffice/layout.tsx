import { ArrowLeft, ShieldCheck } from "lucide-react"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { Suspense } from "react"
import { Container } from "@/components/layout/container"
import { BackofficeLayoutSkeleton } from "@/features/backoffice/components/backoffice-layout-skeleton"
import { BackofficeNav } from "@/features/backoffice/components/backoffice-nav"
import { isAdminEmail } from "@/lib/admin"
import { auth } from "@/lib/auth"

export default function BackofficeLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<BackofficeLayoutSkeleton />}>
      <BackofficeLayoutContent>{children}</BackofficeLayoutContent>
    </Suspense>
  )
}

async function BackofficeLayoutContent({ children }: { children: React.ReactNode }) {
  const session = await auth()

  if (!session?.user) {
    redirect("/login?callbackUrl=/backoffice")
  }

  if (!isAdminEmail(session.user.email)) {
    notFound()
  }

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <Container size="wide" className="flex h-14 items-center justify-between gap-2">
          <span className="flex items-center gap-2 font-semibold tracking-tight">
            <ShieldCheck className="size-5 text-primary" />
            Backoffice
          </span>
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Voltar ao app
          </Link>
        </Container>
      </header>
      <BackofficeNav />
      <main className="flex-1">{children}</main>
    </>
  )
}
