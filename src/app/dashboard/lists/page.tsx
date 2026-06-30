import { redirect } from "next/navigation"
import { Suspense } from "react"
import { Container } from "@/components/layout/container"
import { CreateListDialog } from "@/features/shopping-lists/components/create-list-dialog"
import { ListsGrid } from "@/features/shopping-lists/components/lists-grid"
import { ListsPageSkeleton } from "@/features/shopping-lists/components/lists-page-skeleton"
import { resolveActiveHousehold } from "@/lib/active-household"
import { auth } from "@/lib/auth"
import { getUserHouseholds } from "@/services/household.service"
import { getListsByHousehold } from "@/services/shopping-list.service"

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

  const households = await getUserHouseholds(session.user.id)
  const active = await resolveActiveHousehold(households)

  if (!active) {
    redirect("/dashboard")
  }

  const lists = await getListsByHousehold(active.id)

  return (
    <Container size="wide" className="space-y-6 py-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-page-title">Listas</h1>
        <CreateListDialog householdId={active.id} />
      </div>

      <ListsGrid lists={lists} />
    </Container>
  )
}
