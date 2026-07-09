import { Suspense } from "react"
import { Container } from "@/components/layout/container"
import { AdminStoresSkeleton } from "@/features/backoffice/components/admin-stores-skeleton"
import { AdminStoresTabs } from "@/features/backoffice/components/admin-stores-tabs"
import { getAdminHouseholdStores } from "@/services/admin-store.service"
import { getAdminGlobalStores } from "@/services/global-store.service"

type BackofficeStoresPageProps = {
  searchParams: Promise<{ tab?: string; q?: string; page?: string }>
}

export default function BackofficeStoresPage({ searchParams }: BackofficeStoresPageProps) {
  return (
    <Suspense fallback={<AdminStoresSkeleton />}>
      <BackofficeStoresContent searchParams={searchParams} />
    </Suspense>
  )
}

async function BackofficeStoresContent({ searchParams }: BackofficeStoresPageProps) {
  const { tab: tabParam, q, page: pageParam } = await searchParams
  const tab = tabParam === "household" ? "household" : "global"
  const page = Math.max(1, Number(pageParam) || 1)
  const search = q?.trim() || undefined

  const [globalData, householdData] = await Promise.all([
    getAdminGlobalStores({ search, page: tab === "global" ? page : 1 }),
    getAdminHouseholdStores({ search, page: tab === "household" ? page : 1 }),
  ])

  return (
    <Container size="wide" className="space-y-6 py-6">
      <div className="space-y-1">
        <h1 className="text-page-title">Lojas</h1>
        <p className="text-sm text-muted-foreground">
          Gerencie o catálogo oficial de mercados e acompanhe lojas criadas pelos grupos
        </p>
      </div>

      <AdminStoresTabs
        tab={tab}
        search={search}
        globalData={globalData}
        householdData={householdData}
      />
    </Container>
  )
}
