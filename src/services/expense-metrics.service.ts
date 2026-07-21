import { ListKind } from "@/generated/prisma/enums"
import { calendarMonthKey, currentCalendarMonthKey } from "@/lib/calendar-date"
import { buildExpenseEstimate } from "@/lib/expense-estimate"
import { estimateItemsTotal } from "@/lib/pricing"
import { prisma } from "@/lib/prisma"
import { getLastPaidPrices, getRecentPurchaseTotals } from "@/services/purchase.service"
import type {
  CategoryExpenseDTO,
  ExpenseEstimateDTO,
  ExpenseMetricsDTO,
  MonthlyExpensePointDTO,
  StoreExpenseDTO,
} from "@/types/domain"

const MONTHS_IN_SERIES = 6

function monthLabel(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR", { month: "short", year: "2-digit" })
    .format(date)
    .replace(".", "")
}

export async function getExpenseMetrics(householdId: string): Promise<ExpenseMetricsDTO> {
  const purchases = await prisma.purchase.findMany({
    where: { householdId, kind: ListKind.GROCERY },
    orderBy: { purchasedAt: "desc" },
    select: { totalAmount: true, purchasedAt: true, storeName: true },
  })

  const now = new Date()
  const currentKey = currentCalendarMonthKey(now)
  const previousDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const previousKey = currentCalendarMonthKey(previousDate)

  const totalsByMonth = new Map<string, number>()
  const totalsByStore = new Map<string, { total: number; purchaseCount: number }>()
  let currentMonthTotal = 0
  let previousMonthTotal = 0
  let largestPurchase = 0
  let largestPurchaseStoreName: string | null = null

  for (const purchase of purchases) {
    const amount = Number(purchase.totalAmount)
    const key = calendarMonthKey(purchase.purchasedAt)
    totalsByMonth.set(key, (totalsByMonth.get(key) ?? 0) + amount)

    const storeKey = purchase.storeName ?? "Sem mercado"
    const storeAcc = totalsByStore.get(storeKey) ?? { total: 0, purchaseCount: 0 }
    storeAcc.total += amount
    storeAcc.purchaseCount += 1
    totalsByStore.set(storeKey, storeAcc)

    if (key === currentKey) currentMonthTotal += amount
    if (key === previousKey) previousMonthTotal += amount
    if (amount > largestPurchase) {
      largestPurchase = amount
      largestPurchaseStoreName = purchase.storeName
    }
  }

  let storeBreakdown: StoreExpenseDTO[] = [...totalsByStore.entries()]
    .map(([store, acc]) => ({
      store,
      total: round(acc.total),
      purchaseCount: acc.purchaseCount,
      averagePerPurchase: round(acc.total / acc.purchaseCount),
    }))
    .sort((a, b) => b.total - a.total)

  // O bloco só faz sentido quando há pelo menos um mercado nomeado.
  if (storeBreakdown.every((entry) => entry.store === "Sem mercado")) {
    storeBreakdown = []
  }

  const percentChange =
    previousMonthTotal > 0
      ? ((currentMonthTotal - previousMonthTotal) / previousMonthTotal) * 100
      : null

  const recentTotals = purchases.slice(0, 5).map((purchase) => Number(purchase.totalAmount))
  const averageLastPurchases =
    recentTotals.length > 0
      ? recentTotals.reduce((sum, total) => sum + total, 0) / recentTotals.length
      : 0

  const monthlyAverage =
    totalsByMonth.size > 0
      ? [...totalsByMonth.values()].reduce((sum, total) => sum + total, 0) / totalsByMonth.size
      : 0

  const monthlySeries: MonthlyExpensePointDTO[] = []
  for (let offset = MONTHS_IN_SERIES - 1; offset >= 0; offset--) {
    const date = new Date(now.getFullYear(), now.getMonth() - offset, 1)
    const key = currentCalendarMonthKey(date)
    monthlySeries.push({
      month: key,
      label: monthLabel(date),
      total: round(totalsByMonth.get(key) ?? 0),
    })
  }

  return {
    currentMonthTotal: round(currentMonthTotal),
    previousMonthTotal: round(previousMonthTotal),
    percentChange: percentChange != null ? round(percentChange) : null,
    averageLastPurchases: round(averageLastPurchases),
    monthlyAverage: round(monthlyAverage),
    purchaseCount: purchases.length,
    largestPurchase: round(largestPurchase),
    largestPurchaseStoreName,
    monthlySeries,
    categoryBreakdown: await getCategoryBreakdown(householdId),
    storeBreakdown,
  }
}

async function getCategoryBreakdown(householdId: string): Promise<CategoryExpenseDTO[]> {
  const items = await prisma.purchaseItem.findMany({
    where: { purchase: { householdId, kind: ListKind.GROCERY }, totalPrice: { not: null } },
    select: {
      totalPrice: true,
      product: { select: { category: { select: { name: true } } } },
    },
  })

  if (items.length === 0) {
    return []
  }

  const totals = new Map<string, number>()
  for (const item of items) {
    const category = item.product?.category?.name ?? "Outros"
    totals.set(category, (totals.get(category) ?? 0) + Number(item.totalPrice ?? 0))
  }

  return [...totals.entries()]
    .map(([category, total]) => ({ category, total: round(total) }))
    .sort((a, b) => b.total - a.total)
}

/**
 * Estimativa da próxima compra combinando média das últimas compras com os
 * últimos preços conhecidos dos produtos da lista ativa (quando informada).
 */
export async function getExpenseEstimate(
  householdId: string,
  activeListId?: string | null,
): Promise<ExpenseEstimateDTO | null> {
  const recentTotals = await getRecentPurchaseTotals(householdId)

  let itemBasedTotal: number | null = null
  if (activeListId) {
    const items = await prisma.shoppingListItem.findMany({
      where: { shoppingListId: activeListId },
      select: { productId: true, quantity: true, price: true, priceMode: true },
    })

    if (items.length > 0) {
      const prices = await getLastPaidPrices(
        householdId,
        items.map((item) => item.productId),
      )
      const estimate = estimateItemsTotal(
        items.map((item) => ({
          productId: item.productId,
          quantity: Number(item.quantity),
          price: item.price != null ? Number(item.price) : null,
          priceMode: item.priceMode,
        })),
        (productId) => prices.get(productId)?.unitPrice,
      )
      itemBasedTotal = estimate.total > 0 ? estimate.total : null
    }
  }

  return buildExpenseEstimate({ recentTotals, itemBasedTotal })
}

function round(value: number): number {
  return Math.round(value * 100) / 100
}
