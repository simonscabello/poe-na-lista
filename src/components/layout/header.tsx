import Link from "next/link"
import { Suspense } from "react"
import { AppLogo } from "@/components/common/app-logo"
import { Container } from "@/components/layout/container"
import {
  HeaderAuthActions,
  HeaderAuthActionsFallback,
} from "@/components/layout/header-auth-actions"
import { ThemeToggle } from "@/components/layout/theme-toggle"

type HeaderProps = {
  showAuthActions?: boolean
}

export function Header({ showAuthActions = true }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <Container className="flex h-14 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <AppLogo size="md" />
          <span>Põe na Lista</span>
        </Link>

        <div className="flex items-center gap-1">
          <ThemeToggle />
          {showAuthActions && (
            <Suspense fallback={<HeaderAuthActionsFallback />}>
              <HeaderAuthActions />
            </Suspense>
          )}
        </div>
      </Container>
    </header>
  )
}
