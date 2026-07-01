import { redirect } from "next/navigation"
import { Suspense } from "react"
import { Container } from "@/components/layout/container"
import { OverviewCards } from "@/features/dashboard/components/overview-cards"
import { OnboardingView } from "@/features/households/components/onboarding-view"
import { CreateListDialog } from "@/features/shopping-lists/components/create-list-dialog"
import { ListsGrid } from "@/features/shopping-lists/components/lists-grid"
import { ListsPageSkeleton } from "@/features/shopping-lists/components/lists-page-skeleton"
import { HouseholdRole } from "@/generated/prisma/enums"
import { resolveActiveHousehold } from "@/lib/active-household"
import { auth } from "@/lib/auth"
import { getExpenseEstimate, getExpenseMetrics } from "@/services/expense-metrics.service"
import { getHouseholdMembers, getUserHouseholds } from "@/services/household.service"
import { getPantryItems } from "@/services/pantry.service"
import { getListsByHousehold } from "@/services/shopping-list.service"

export default function DashboardPage() {
  return (
    <Suspense fallback={<ListsPageSkeleton />}>
      <DashboardContent />
    </Suspense>
  )
}

async function DashboardContent() {
  const session = await auth()
  if (!session?.user) {
    redirect("/login?callbackUrl=/dashboard")
  }

  const households = await getUserHouseholds(session.user.id)
  const active = await resolveActiveHousehold(households)

  if (!active) {
    return <OnboardingView />
  }

  const canInvite = active.role === HouseholdRole.OWNER || active.role === HouseholdRole.ADMIN
  const [lists, members, metrics, pantryItems] = await Promise.all([
    getListsByHousehold(active.id),
    getHouseholdMembers(active.id),
    getExpenseMetrics(active.id),
    getPantryItems(active.id),
  ])

  const activeList = lists.find((list) => list.status === "ACTIVE")
  const estimate = await getExpenseEstimate(active.id, activeList?.id ?? null)
  const pantryAlerts = pantryItems.filter(
    (item) =>
      item.status === "low_stock" || item.status === "out" || item.status === "expiring_soon",
  ).length

  return (
    <Container size="wide" className="space-y-6 py-6">
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-page-title">Olá, {firstName(session.user.name)}</h1>
          <p className="text-sm text-muted-foreground">Listas de {active.name}</p>
        </div>
        <CreateListDialog householdId={active.id} />
      </div>

      <OverviewCards
        currentMonthTotal={metrics.currentMonthTotal}
        pantryAlerts={pantryAlerts}
        estimate={estimate}
      />

      <ListsGrid lists={lists} members={members} householdId={active.id} canInvite={canInvite} />
    </Container>
  )
}

function firstName(name: string | null | undefined): string {
  if (!name) {
    return "bem-vindo"
  }
  return name.split(" ")[0]
}
