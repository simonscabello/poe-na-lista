import { redirect } from "next/navigation"
import { Suspense } from "react"
import { OnboardingView } from "@/features/households/components/onboarding-view"
import { PantrySkeleton } from "@/features/pantry/components/pantry-skeleton"
import { PantryView } from "@/features/pantry/components/pantry-view"
import { resolveActiveHousehold } from "@/lib/active-household"
import { auth } from "@/lib/auth"
import { requireOnboardingCompleted } from "@/lib/onboarding"
import { getUserHouseholds } from "@/services/household.service"
import { getLowStockPantryItemsNeedingRestock, getPantryItems } from "@/services/pantry.service"
import { getMostRecentActiveListId } from "@/services/shopping-list.service"

export default function PantryPage() {
  return (
    <Suspense fallback={<PantrySkeleton />}>
      <PantryContent />
    </Suspense>
  )
}

async function PantryContent() {
  const session = await auth()
  if (!session?.user) {
    redirect("/login?callbackUrl=/dashboard/pantry")
  }
  await requireOnboardingCompleted(session.user.id)

  const households = await getUserHouseholds(session.user.id)
  const active = await resolveActiveHousehold(households)

  if (!active) {
    return <OnboardingView />
  }

  const [items, restockItems, activeListId] = await Promise.all([
    getPantryItems(active.id),
    getLowStockPantryItemsNeedingRestock(active.id),
    getMostRecentActiveListId(active.id),
  ])

  return (
    <PantryView
      householdId={active.id}
      items={items}
      restockCount={restockItems.length}
      activeListId={activeListId}
    />
  )
}
