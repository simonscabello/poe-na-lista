import { calendarMonthKey, currentCalendarMonthKey } from "@/lib/calendar-date"
import { prisma } from "@/lib/prisma"
import type { BudgetStatusDTO } from "@/types/domain"

export async function getMonthlyBudget(householdId: string): Promise<number | null> {
  const household = await prisma.household.findUnique({
    where: { id: householdId },
    select: { monthlyBudget: true },
  })

  return household?.monthlyBudget != null ? Number(household.monthlyBudget) : null
}

export async function setMonthlyBudget(householdId: string, value: number | null): Promise<void> {
  await prisma.household.update({
    where: { id: householdId },
    data: { monthlyBudget: value },
  })
}

export async function getBudgetStatus(householdId: string): Promise<BudgetStatusDTO | null> {
  const budget = await getMonthlyBudget(householdId)
  if (budget == null || budget <= 0) return null

  const now = new Date()
  const currentKey = currentCalendarMonthKey(now)

  // Faixa com folga de 1 dia para cobrir os formatos históricos de
  // armazenamento de purchasedAt (meia-noite UTC ou local); o corte exato do
  // mês é o calendarMonthKey, igual ao usado nas métricas de gastos.
  const dayMs = 24 * 60 * 60 * 1000
  const rangeStart = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1) - dayMs)
  const rangeEnd = new Date(Date.UTC(now.getFullYear(), now.getMonth() + 1, 1) + dayMs)

  const purchases = await prisma.purchase.findMany({
    where: { householdId, purchasedAt: { gte: rangeStart, lt: rangeEnd } },
    select: { totalAmount: true, purchasedAt: true },
  })

  let spent = 0
  for (const purchase of purchases) {
    if (calendarMonthKey(purchase.purchasedAt) === currentKey) {
      spent += Number(purchase.totalAmount)
    }
  }

  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const dayOfMonth = now.getDate()

  // Projeção linear pelo ritmo do mês até aqui; sem compras não há ritmo.
  const projectedTotal = spent > 0 ? round((spent / dayOfMonth) * daysInMonth) : null

  return {
    budget: round(budget),
    spent: round(spent),
    remaining: round(budget - spent),
    percentUsed: round((spent / budget) * 100),
    projectedTotal,
    daysRemaining: daysInMonth - dayOfMonth,
  }
}

function round(value: number): number {
  return Math.round(value * 100) / 100
}
