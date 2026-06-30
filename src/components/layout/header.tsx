import Link from "next/link"
import { AppLogo } from "@/components/common/app-logo"
import { LinkButton } from "@/components/common/link-button"
import { Container } from "@/components/layout/container"
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
            <>
              <LinkButton variant="ghost" size="sm" href="/login">
                Entrar
              </LinkButton>
              <LinkButton size="sm" className="hidden sm:inline-flex" href="/dashboard">
                Dashboard
              </LinkButton>
            </>
          )}
        </div>
      </Container>
    </header>
  )
}
