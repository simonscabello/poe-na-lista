import { calendarMonthKey, currentCalendarMonthKey } from "@/lib/calendar-date"
import { buildExpenseEstimate } from "@/lib/expense-estimate"
import { prisma } from "@/lib/prisma"
import { getLastKnownUnitPrices, getRecentPurchaseTotals } from "@/services/purchase.service"
import type {
  CategoryExpenseDTO,
  ExpenseEstimateDTO,
  ExpenseMetricsDTO,
  MonthlyExpensePointDTO,
} from "@/types/domain"

const MONTHS_IN_SERIES = 6

function monthLabel(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR", { month: "short", year: "2-digit" })
    .format(date)
    .replace(".", "")
}

export async function getExpenseMetrics(householdId: string): Promise<ExpenseMetricsDTO> {
  const purchases = await prisma.purchase.findMany({
    where: { householdId },
    orderBy: { purchasedAt: "desc" },
    select: { totalAmount: true, purchasedAt: true },
  })

  const now = new Date()
  const currentKey = currentCalendarMonthKey(now)
  const previousDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const previousKey = currentCalendarMonthKey(previousDate)

  const totalsByMonth = new Map<string, number>()
  let currentMonthTotal = 0
  let previousMonthTotal = 0
  let largestPurchase = 0

  for (const purchase of purchases) {
    const amount = Number(purchase.totalAmount)
    const key = calendarMonthKey(purchase.purchasedAt)
    totalsByMonth.set(key, (totalsByMonth.get(key) ?? 0) + amount)

    if (key === currentKey) currentMonthTotal += amount
    if (key === previousKey) previousMonthTotal += amount
    if (amount > largestPurchase) largestPurchase = amount
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
    monthlySeries,
    categoryBreakdown: await getCategoryBreakdown(householdId),
  }
}

async function getCategoryBreakdown(householdId: string): Promise<CategoryExpenseDTO[]> {
  const items = await prisma.purchaseItem.findMany({
    where: { purchase: { householdId }, totalPrice: { not: null } },
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
      select: { productId: true, quantity: true },
    })

    if (items.length > 0) {
      const prices = await getLastKnownUnitPrices(
        householdId,
        items.map((item) => item.productId),
      )
      let sum = 0
      for (const item of items) {
        const price = prices.get(item.productId)
        if (price != null) {
          sum += price * Number(item.quantity)
        }
      }
      itemBasedTotal = sum > 0 ? sum : null
    }
  }

  return buildExpenseEstimate({ recentTotals, itemBasedTotal })
}

function round(value: number): number {
  return Math.round(value * 100) / 100
}
