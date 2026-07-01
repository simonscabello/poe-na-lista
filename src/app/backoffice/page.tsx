import {
  ClipboardList,
  PackageCheck,
  Receipt,
  ShoppingBasket,
  UserPlus,
  Users,
  Wallet,
} from "lucide-react"
import { redirect } from "next/navigation"
import { Suspense } from "react"
import { Container } from "@/components/layout/container"
import { ActivityChart } from "@/features/backoffice/components/activity-chart"
import { AdminOverviewSkeleton } from "@/features/backoffice/components/admin-overview-skeleton"
import { AdminStatCard } from "@/features/backoffice/components/admin-stat-card"
import { UserGrowthChart } from "@/features/backoffice/components/user-growth-chart"
import { isAdminEmail } from "@/lib/admin"
import { auth } from "@/lib/auth"
import { formatCurrency } from "@/lib/format-currency"
import { getAdminOverview } from "@/services/admin-stats.service"

export default function BackofficePage() {
  return (
    <Suspense fallback={<AdminOverviewSkeleton />}>
      <BackofficeContent />
    </Suspense>
  )
}

async function BackofficeContent() {
  const session = await auth()
  if (!session?.user || !isAdminEmail(session.user.email)) {
    redirect("/login?callbackUrl=/backoffice")
  }

  const overview = await getAdminOverview()

  return (
    <Container size="wide" className="space-y-6 py-6">
      <div className="space-y-1">
        <h1 className="text-page-title">Visão geral do sistema</h1>
        <p className="text-sm text-muted-foreground">
          Uso agregado do Põe na Lista em todos os grupos
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <AdminStatCard label="Usuários" value={String(overview.totalUsers)} icon={Users} />
        <AdminStatCard
          label="Novos (30 dias)"
          value={String(overview.newUsersLast30Days)}
          icon={UserPlus}
        />
        <AdminStatCard
          label="Grupos"
          value={String(overview.totalHouseholds)}
          icon={ShoppingBasket}
        />
        <AdminStatCard
          label="Listas ativas"
          value={String(overview.totalActiveLists)}
          icon={ClipboardList}
          hint={`${overview.totalCompletedLists} concluídas`}
        />
        <AdminStatCard
          label="Itens de lista"
          value={String(overview.totalListItems)}
          icon={PackageCheck}
        />
        <AdminStatCard
          label="Itens de despensa"
          value={String(overview.totalPantryItems)}
          icon={PackageCheck}
        />
        <AdminStatCard label="Compras" value={String(overview.totalPurchases)} icon={Receipt} />
        <AdminStatCard
          label="Valor total"
          value={formatCurrency(overview.totalPurchaseAmount)}
          icon={Wallet}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <UserGrowthChart data={overview.userGrowthSeries} />
        <ActivityChart data={overview.activitySeries} />
      </div>
    </Container>
  )
}
