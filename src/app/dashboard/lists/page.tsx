import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { Suspense } from "react"
import { Container } from "@/components/layout/container"
import { PushBanner } from "@/components/notifications/push-banner"
import { OverviewCards } from "@/features/dashboard/components/overview-cards"
import { OnboardingView } from "@/features/households/components/onboarding-view"
import { OnboardingChecklist } from "@/features/onboarding/components/onboarding-checklist"
import { OnboardingWizard } from "@/features/onboarding/components/onboarding-wizard"
import { PantryRestockCard } from "@/features/pantry/components/pantry-restock-card"
import { CreateListDialog } from "@/features/shopping-lists/components/create-list-dialog"
import { ListsGrid } from "@/features/shopping-lists/components/lists-grid"
import { ListsPageSkeleton } from "@/features/shopping-lists/components/lists-page-skeleton"
import { SuggestedListCard } from "@/features/shopping-lists/components/suggested-list-card"
import { HouseholdRole } from "@/generated/prisma/enums"
import { resolveActiveHousehold } from "@/lib/active-household"
import { auth } from "@/lib/auth"
import { ONBOARDING_CHECKLIST_DISMISS_COOKIE } from "@/lib/onboarding"
import { getCurrentMonthSpent, getMonthlyBudget } from "@/services/budget.service"
import { getHouseholdMembers, getUserHouseholds } from "@/services/household.service"
import { getLowStockPantryItemsNeedingRestock } from "@/services/pantry.service"
import { getActiveListEstimates } from "@/services/purchase.service"
import { getListsByHousehold } from "@/services/shopping-list.service"
import { getSuggestedListPreview } from "@/services/suggestion.service"
import { getOnboardingCompletedAt } from "@/services/user.service"

export default function ListsPage() {
  return (
    <Suspense fallback={<ListsPageSkeleton />}>
      <ListsContent />
    </Suspense>
  )
}

async function ListsContent() {
  const session = await auth()
  if (!session?.user) {
    redirect("/login?callbackUrl=/dashboard/lists")
  }

  const [households, onboardingCompletedAt] = await Promise.all([
    getUserHouseholds(session.user.id),
    getOnboardingCompletedAt(session.user.id),
  ])
  const active = await resolveActiveHousehold(households)

  if (!onboardingCompletedAt) {
    return <OnboardingWizard hasHousehold={active != null} />
  }

  if (!active) {
    return <OnboardingView />
  }

  const canInvite = active.role === HouseholdRole.OWNER || active.role === HouseholdRole.ADMIN
  const [
    lists,
    members,
    currentMonthTotal,
    suggestedPreview,
    monthlyBudget,
    lowStockItems,
    listEstimates,
    cookieStore,
  ] = await Promise.all([
    getListsByHousehold(active.id),
    getHouseholdMembers(active.id),
    getCurrentMonthSpent(active.id),
    getSuggestedListPreview(active.id),
    getMonthlyBudget(active.id),
    getLowStockPantryItemsNeedingRestock(active.id),
    getActiveListEstimates(active.id),
    cookies(),
  ])

  const showInviteStep = lists.length === 0 && members.length === 1 && canInvite
  const checklistDismissed = cookieStore.get(ONBOARDING_CHECKLIST_DISMISS_COOKIE)?.value === "1"

  const onboardingProgress = {
    hasHousehold: true,
    hasInvited: members.length > 1,
    hasList: lists.length > 0,
    hasProduct: lists.some((list) => list.totalItems > 0),
    hasPurchase: lists.some((list) => list.purchaseCount > 0),
  }

  return (
    <Container size="wide" className="space-y-6 py-6">
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-page-title">Olá, {firstName(session.user.name)}</h1>
          <p className="text-sm text-muted-foreground">Listas de {active.name}</p>
        </div>
        <CreateListDialog householdId={active.id} showInviteStep={showInviteStep} />
      </div>

      <PushBanner />

      <OnboardingChecklist progress={onboardingProgress} dismissed={checklistDismissed} />

      <OverviewCards currentMonthTotal={currentMonthTotal} monthlyBudget={monthlyBudget} />

      {lowStockItems.length > 0 && (
        <PantryRestockCard
          householdId={active.id}
          productNames={lowStockItems.map((item) => item.productName)}
        />
      )}

      {suggestedPreview && (
        <SuggestedListCard householdId={active.id} items={suggestedPreview.items} />
      )}

      <ListsGrid
        lists={lists}
        members={members}
        householdId={active.id}
        canInvite={canInvite}
        showInviteStep={showInviteStep}
        estimates={Object.fromEntries(listEstimates)}
      />
    </Container>
  )
}

function firstName(name: string | null | undefined): string {
  if (!name) {
    return "bem-vindo"
  }
  return name.split(" ")[0]
}
