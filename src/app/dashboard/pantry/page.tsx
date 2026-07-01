import { redirect } from "next/navigation"
import { Suspense } from "react"
import { Container } from "@/components/layout/container"
import { OnboardingView } from "@/features/households/components/onboarding-view"
import { PantrySkeleton } from "@/features/pantry/components/pantry-skeleton"
import { PantryView } from "@/features/pantry/components/pantry-view"
import { resolveActiveHousehold } from "@/lib/active-household"
import { auth } from "@/lib/auth"
import { getUserHouseholds } from "@/services/household.service"
import { getPantryItems } from "@/services/pantry.service"
import { getCategories, getProductCatalog } from "@/services/product.service"
import { getListsByHousehold } from "@/services/shopping-list.service"

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

  const households = await getUserHouseholds(session.user.id)
  const active = await resolveActiveHousehold(households)

  if (!active) {
    return <OnboardingView />
  }

  const [items, catalog, categories, lists] = await Promise.all([
    getPantryItems(active.id),
    getProductCatalog(active.id),
    getCategories(),
    getListsByHousehold(active.id),
  ])

  const activeLists = lists
    .filter((list) => list.status === "ACTIVE")
    .map((list) => ({ id: list.id, name: list.name }))

  return (
    <Container size="wide" className="space-y-6 py-6">
      <PantryView
        householdId={active.id}
        items={items}
        catalog={catalog}
        categories={categories}
        lists={activeLists}
      />
    </Container>
  )
}
