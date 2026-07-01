import { redirect } from "next/navigation"
import { Suspense } from "react"
import { BottomNav, BottomNavFallback } from "@/components/layout/bottom-nav"
import { DashboardHeader } from "@/components/layout/dashboard-header"
import { DashboardHeaderSkeleton } from "@/components/layout/dashboard-header-skeleton"
import { resolveActiveHousehold } from "@/lib/active-household"
import { isAdminEmail } from "@/lib/admin"
import { auth } from "@/lib/auth"
import { getUserHouseholds } from "@/services/household.service"
import { getNotifications, getUnreadNotificationCount } from "@/services/notification.service"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Suspense fallback={<DashboardHeaderSkeleton />}>
        <DashboardHeaderSection />
      </Suspense>
      <main className="flex-1">{children}</main>
      <Suspense fallback={<BottomNavFallback />}>
        <BottomNav />
      </Suspense>
    </>
  )
}

async function DashboardHeaderSection() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login?callbackUrl=/dashboard")
  }

  const households = await getUserHouseholds(session.user.id)
  const active = await resolveActiveHousehold(households)

  const [notifications, unreadCount] = active
    ? await Promise.all([
        getNotifications(session.user.id, active.id),
        getUnreadNotificationCount(session.user.id, active.id),
      ])
    : [[], 0]

  return (
    <DashboardHeader
      households={households}
      activeId={active?.id ?? null}
      user={{
        name: session.user.name ?? null,
        email: session.user.email ?? null,
        image: session.user.image ?? null,
      }}
      notifications={notifications}
      unreadCount={unreadCount}
      isAdmin={isAdminEmail(session.user.email)}
    />
  )
}
