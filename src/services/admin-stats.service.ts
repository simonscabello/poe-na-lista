import { ShoppingListStatus } from "@/generated/prisma/enums"
import { currentCalendarMonthKey } from "@/lib/calendar-date"
import { prisma } from "@/lib/prisma"
import type {
  AdminActivityPointDTO,
  AdminOverviewDTO,
  AdminUserGrowthPointDTO,
} from "@/types/domain"

const MONTHS_IN_SERIES = 6
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000

function monthLabel(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR", { month: "short", year: "2-digit" })
    .format(date)
    .replace(".", "")
}

export async function getAdminOverview(): Promise<AdminOverviewDTO> {
  const [
    totalUsers,
    totalHouseholds,
    totalActiveLists,
    totalCompletedLists,
    totalListItems,
    totalPantryItems,
    users,
    lists,
    purchases,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.household.count(),
    prisma.shoppingList.count({ where: { status: ShoppingListStatus.ACTIVE } }),
    prisma.shoppingList.count({ where: { status: ShoppingListStatus.COMPLETED } }),
    prisma.shoppingListItem.count(),
    prisma.pantryItem.count(),
    prisma.user.findMany({ select: { createdAt: true }, orderBy: { createdAt: "asc" } }),
    prisma.shoppingList.findMany({ select: { createdAt: true } }),
    prisma.purchase.findMany({ select: { createdAt: true, totalAmount: true } }),
  ])

  const now = new Date()
  const totalPurchaseAmount = purchases.reduce(
    (sum, purchase) => sum + Number(purchase.totalAmount),
    0,
  )
  const thirtyDaysAgo = new Date(now.getTime() - THIRTY_DAYS_MS)
  const newUsersLast30Days = users.filter((user) => user.createdAt >= thirtyDaysAgo).length

  return {
    totalUsers,
    newUsersLast30Days,
    totalHouseholds,
    totalActiveLists,
    totalCompletedLists,
    totalListItems,
    totalPantryItems,
    totalPurchases: purchases.length,
    totalPurchaseAmount: round(totalPurchaseAmount),
    userGrowthSeries: buildUserGrowthSeries(users, now),
    activitySeries: buildActivitySeries(lists, purchases, now),
  }
}

function buildUserGrowthSeries(
  usersAsc: { createdAt: Date }[],
  now: Date,
): AdminUserGrowthPointDTO[] {
  const perMonth = new Map<string, number>()
  for (const user of usersAsc) {
    const key = currentCalendarMonthKey(user.createdAt)
    perMonth.set(key, (perMonth.get(key) ?? 0) + 1)
  }

  const windowStart = new Date(now.getFullYear(), now.getMonth() - (MONTHS_IN_SERIES - 1), 1)
  let cumulative = usersAsc.filter((user) => user.createdAt < windowStart).length

  const series: AdminUserGrowthPointDTO[] = []
  for (let offset = MONTHS_IN_SERIES - 1; offset >= 0; offset--) {
    const date = new Date(now.getFullYear(), now.getMonth() - offset, 1)
    const key = currentCalendarMonthKey(date)
    const newUsers = perMonth.get(key) ?? 0
    cumulative += newUsers
    series.push({ month: key, label: monthLabel(date), newUsers, cumulativeUsers: cumulative })
  }

  return series
}

function buildActivitySeries(
  lists: { createdAt: Date }[],
  purchases: { createdAt: Date }[],
  now: Date,
): AdminActivityPointDTO[] {
  const listsPerMonth = new Map<string, number>()
  for (const list of lists) {
    const key = currentCalendarMonthKey(list.createdAt)
    listsPerMonth.set(key, (listsPerMonth.get(key) ?? 0) + 1)
  }

  const purchasesPerMonth = new Map<string, number>()
  for (const purchase of purchases) {
    const key = currentCalendarMonthKey(purchase.createdAt)
    purchasesPerMonth.set(key, (purchasesPerMonth.get(key) ?? 0) + 1)
  }

  const series: AdminActivityPointDTO[] = []
  for (let offset = MONTHS_IN_SERIES - 1; offset >= 0; offset--) {
    const date = new Date(now.getFullYear(), now.getMonth() - offset, 1)
    const key = currentCalendarMonthKey(date)
    series.push({
      month: key,
      label: monthLabel(date),
      listsCreated: listsPerMonth.get(key) ?? 0,
      purchasesFinalized: purchasesPerMonth.get(key) ?? 0,
    })
  }

  return series
}

function round(value: number): number {
  return Math.round(value * 100) / 100
}
