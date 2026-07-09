import Link from "next/link"
import { AppLogo } from "@/components/common/app-logo"
import { Container } from "@/components/layout/container"
import { HeaderNav } from "@/components/layout/header-nav"
import { ThemeToggle } from "@/components/layout/theme-toggle"
import { UserMenu } from "@/components/layout/user-menu"
import { NotificationBell } from "@/components/notifications/notification-bell"
import { HouseholdSwitcher } from "@/features/households/components/household-switcher"
import type { HouseholdSummary, NotificationDTO } from "@/types/domain"

type DashboardHeaderProps = {
  households: HouseholdSummary[]
  activeId: string | null
  user: { name: string | null; email: string | null; image: string | null }
  notifications: NotificationDTO[]
  unreadCount: number
  isAdmin?: boolean
}

export function DashboardHeader({
  households,
  activeId,
  user,
  notifications,
  unreadCount,
  isAdmin = false,
}: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <Container size="wide" className="flex h-14 items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <Link
            href="/dashboard/lists"
            className="flex items-center gap-2 font-semibold tracking-tight"
          >
            <AppLogo size="md" />
            <span className="hidden lg:inline">Põe na Lista</span>
          </Link>
          {activeId && <HouseholdSwitcher households={households} activeId={activeId} />}
        </div>

        {activeId && <HeaderNav />}

        <div className="flex items-center gap-1">
          {activeId && (
            <NotificationBell
              householdId={activeId}
              initialNotifications={notifications}
              initialUnreadCount={unreadCount}
            />
          )}
          <ThemeToggle />
          <UserMenu name={user.name} email={user.email} image={user.image} isAdmin={isAdmin} />
        </div>
      </Container>
    </header>
  )
}
