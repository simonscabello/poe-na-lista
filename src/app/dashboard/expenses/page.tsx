import { Receipt } from "lucide-react"
import { redirect } from "next/navigation"
import { Suspense } from "react"
import { EmptyState } from "@/components/common/empty-state"
import { Container } from "@/components/layout/container"
import { CategoryBreakdown } from "@/features/expenses/components/category-breakdown"
import { ExpenseEstimateCard } from "@/features/expenses/components/expense-estimate-card"
import { ExpenseMetricsCards } from "@/features/expenses/components/expense-metrics-cards"
import { ExpensesSkeleton } from "@/features/expenses/components/expenses-skeleton"
import { MonthlyExpensesChart } from "@/features/expenses/components/monthly-expenses-chart"
import { PurchaseHistoryList } from "@/features/expenses/components/purchase-history-list"
import { StoreBreakdown } from "@/features/expenses/components/store-breakdown"
import { OnboardingView } from "@/features/households/components/onboarding-view"
import { resolveActiveHousehold } from "@/lib/active-household"
import { auth } from "@/lib/auth"
import { getExpenseEstimate, getExpenseMetrics } from "@/services/expense-metrics.service"
import { getUserHouseholds } from "@/services/household.service"
import { getPurchaseHistory } from "@/services/purchase.service"
import { getListsByHousehold } from "@/services/shopping-list.service"

export default function ExpensesPage() {
  return (
    <Suspense fallback={<ExpensesSkeleton />}>
      <ExpensesContent />
    </Suspense>
  )
}

async function ExpensesContent() {
  const session = await auth()
  if (!session?.user) {
    redirect("/login?callbackUrl=/dashboard/expenses")
  }

  const households = await getUserHouseholds(session.user.id)
  const active = await resolveActiveHousehold(households)

  if (!active) {
    return <OnboardingView />
  }

  const [metrics, purchases, lists] = await Promise.all([
    getExpenseMetrics(active.id),
    getPurchaseHistory(active.id),
    getListsByHousehold(active.id),
  ])

  const activeList = lists.find((list) => list.status === "ACTIVE")
  const estimate = await getExpenseEstimate(active.id, activeList?.id ?? null)

  return (
    <Container size="wide" className="space-y-6 py-6">
      <h1 className="text-page-title">Gastos</h1>

      {purchases.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="Nenhuma compra registrada"
          description="Finalize uma lista de compras informando o valor total para começar a acompanhar seus gastos."
        />
      ) : (
        <>
          <ExpenseMetricsCards metrics={metrics} />

          {estimate && <ExpenseEstimateCard estimate={estimate} />}

          <MonthlyExpensesChart data={metrics.monthlySeries} />

          {metrics.categoryBreakdown.length > 0 && (
            <CategoryBreakdown categories={metrics.categoryBreakdown} />
          )}

          {metrics.storeBreakdown.length > 0 && <StoreBreakdown stores={metrics.storeBreakdown} />}

          <section className="space-y-3">
            <h2 className="text-section-label px-0.5">Histórico</h2>
            <PurchaseHistoryList purchases={purchases} />
          </section>
        </>
      )}
    </Container>
  )
}
