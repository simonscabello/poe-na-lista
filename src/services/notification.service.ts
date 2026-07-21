import { after } from "next/server"
import { Prisma } from "@/generated/prisma/client"
import type { NotificationType } from "@/generated/prisma/enums"
import { formatCurrency } from "@/lib/format-currency"
import { getNotificationMessage } from "@/lib/notification-text"
import { prisma } from "@/lib/prisma"
import { sendPushToUsers } from "@/lib/push"
import { getBudgetStatus } from "@/services/budget.service"
import { getHouseholdMembers } from "@/services/household.service"
import { getExpiringPantryItems } from "@/services/pantry.service"
import type { NotificationDTO, NotificationTypeDTO } from "@/types/domain"

/**
 * Tenta reservar um alerta coletivo para o período. Retorna `true` só para quem
 * de fato inseriu a linha — o unique (household, type, periodKey) resolve o
 * empate entre polls concorrentes, garantindo um único envio por período.
 */
async function claimAlert(
  householdId: string,
  type: NotificationType,
  periodKey: string,
): Promise<boolean> {
  try {
    await prisma.sentAlert.create({ data: { householdId, type, periodKey } })
    return true
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return false
    }
    throw error
  }
}

/** Retorna quantos membros foram notificados (0 quando o autor está sozinho). */
export async function notifyHousehold(input: {
  householdId: string
  excludeUserId: string
  type: NotificationTypeDTO
  actorName: string
  entityLabel?: string | null
  amount?: number | null
  link?: string | null
}): Promise<number> {
  const members = await getHouseholdMembers(input.householdId)
  const recipients = members.filter((member) => member.userId !== input.excludeUserId)

  if (recipients.length === 0) {
    return 0
  }

  await prisma.notification.createMany({
    data: recipients.map((member) => ({
      householdId: input.householdId,
      userId: member.userId,
      type: input.type,
      actorName: input.actorName,
      actorUserId: input.excludeUserId,
      entityLabel: input.entityLabel ?? null,
      amount: input.amount ?? null,
      link: input.link ?? null,
    })),
  })

  const recipientIds = recipients.map((member) => member.userId)
  const body = getNotificationMessage({
    id: "push",
    type: input.type,
    actorName: input.actorName,
    entityLabel: input.entityLabel ?? null,
    amount: input.amount ?? null,
    link: input.link ?? null,
    read: false,
    createdAt: new Date().toISOString(),
  })

  // O push sai depois da resposta da action para não segurar o usuário.
  after(() =>
    sendPushToUsers(recipientIds, {
      title: "Põe na Lista",
      body,
      link: input.link ?? null,
    }),
  )

  return recipients.length
}

const LIST_NUDGE_COOLDOWN_MS = 30 * 60 * 1000

export type ListNudgeResult = "sent" | "alone" | "cooldown" | "not-found"

/**
 * Aviso manual "estou montando a lista, dá uma olhada" — disparado pelo autor,
 * não por mutação automática (adição de item não notifica; era ruidoso).
 * Cooldown de 30 minutos por lista evita spam de toques repetidos.
 */
export async function notifyListNudge(input: {
  listId: string
  actorUserId: string
  actorName: string
}): Promise<ListNudgeResult> {
  const list = await prisma.shoppingList.findUnique({
    where: { id: input.listId },
    select: { name: true, householdId: true, status: true },
  })
  if (list?.status !== "ACTIVE") return "not-found"

  const link = `/dashboard/lists/${input.listId}`
  const windowStart = new Date(Date.now() - LIST_NUDGE_COOLDOWN_MS)
  const recentNudge = await prisma.notification.findFirst({
    where: {
      householdId: list.householdId,
      type: "LIST_NUDGE",
      link,
      createdAt: { gte: windowStart },
    },
    select: { id: true },
  })
  if (recentNudge) return "cooldown"

  const recipients = await notifyHousehold({
    householdId: list.householdId,
    excludeUserId: input.actorUserId,
    type: "LIST_NUDGE",
    actorName: input.actorName,
    entityLabel: list.name,
    link,
  })

  return recipients === 0 ? "alone" : "sent"
}

/**
 * Alerta quando a projeção de fechamento do mês cruza o orçamento. Dispara no
 * máximo uma vez por mês por household (guard atômico via SentAlert) e vai para
 * TODOS os membros — orçamento é assunto coletivo, inclusive de quem fez a
 * compra.
 */
export async function notifyBudgetProjectionAlert(householdId: string): Promise<void> {
  const status = await getBudgetStatus(householdId)
  if (!status || status.projectedTotal == null || status.projectedTotal <= status.budget) {
    return
  }

  const members = await getHouseholdMembers(householdId)
  if (members.length === 0) {
    return
  }

  // Guard atômico: 1 alerta por household por mês (period "YYYY-MM").
  const now = new Date()
  const periodKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
  if (!(await claimAlert(householdId, "BUDGET_ALERT", periodKey))) {
    return
  }

  const entityLabel = formatCurrency(status.budget)
  const link = "/dashboard/expenses"

  await prisma.notification.createMany({
    data: members.map((member) => ({
      householdId,
      userId: member.userId,
      type: "BUDGET_ALERT" as const,
      actorName: "Orçamento",
      entityLabel,
      amount: status.projectedTotal,
      link,
    })),
  })

  const body = getNotificationMessage({
    id: "push",
    type: "BUDGET_ALERT",
    actorName: "Orçamento",
    entityLabel,
    amount: status.projectedTotal,
    link,
    read: false,
    createdAt: now.toISOString(),
  })

  after(() =>
    sendPushToUsers(
      members.map((member) => member.userId),
      { title: "Põe na Lista", body, link },
    ),
  )
}

/**
 * Alerta quando o gasto realizado de um projeto passa do teto. Dispara no
 * máximo uma vez por projeto (guard atômico via SentAlert com periodKey
 * "project:<listId>") e vai para TODOS os membros — o teto é coletivo.
 */
export async function notifyProjectBudgetAlert(listId: string): Promise<void> {
  const list = await prisma.shoppingList.findUnique({
    where: { id: listId },
    select: { name: true, householdId: true, kind: true, budgetCap: true },
  })
  if (list?.kind !== "PROJECT" || list.budgetCap == null) {
    return
  }

  const cap = Number(list.budgetCap)
  const spentAgg = await prisma.purchase.aggregate({
    where: { shoppingListId: listId },
    _sum: { totalAmount: true },
  })
  const realizedSpent = Math.round(Number(spentAgg._sum.totalAmount ?? 0) * 100) / 100
  if (realizedSpent <= cap) {
    return
  }

  const members = await getHouseholdMembers(list.householdId)
  if (members.length === 0) {
    return
  }

  // Guard atômico: 1 alerta por projeto (periodKey "project:<listId>").
  if (!(await claimAlert(list.householdId, "PROJECT_BUDGET_ALERT", `project:${listId}`))) {
    return
  }

  const entityLabel = list.name
  const link = `/dashboard/lists/${listId}`

  await prisma.notification.createMany({
    data: members.map((member) => ({
      householdId: list.householdId,
      userId: member.userId,
      type: "PROJECT_BUDGET_ALERT" as const,
      actorName: "Projeto",
      entityLabel,
      amount: realizedSpent,
      link,
    })),
  })

  const body = getNotificationMessage({
    id: "push",
    type: "PROJECT_BUDGET_ALERT",
    actorName: "Projeto",
    entityLabel,
    amount: realizedSpent,
    link,
    read: false,
    createdAt: new Date().toISOString(),
  })

  after(() =>
    sendPushToUsers(
      members.map((member) => member.userId),
      { title: "Põe na Lista", body, link },
    ),
  )
}

/**
 * Alerta de validade da despensa. Sem infraestrutura de cron, o gatilho é o
 * polling do sino (a cada 30s por aba aberta): esta função roda com guard de
 * no máximo 1 alerta por dia por household, então o custo por poll é uma
 * query pequena. Vai para todos os membros.
 */
export async function notifyPantryExpiryAlert(householdId: string): Promise<void> {
  const expiring = await getExpiringPantryItems(householdId)
  if (expiring.length === 0) {
    return
  }

  const members = await getHouseholdMembers(householdId)
  if (members.length === 0) {
    return
  }

  // Guard atômico: 1 alerta por household por dia (period "YYYY-MM-DD"). Só
  // reservamos depois de confirmar que há itens vencendo, para não "gastar" o
  // alerta do dia à toa.
  const now = new Date()
  const periodKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
    now.getDate(),
  ).padStart(2, "0")}`
  if (!(await claimAlert(householdId, "PANTRY_EXPIRING", periodKey))) {
    return
  }

  // Prévia dos nomes no entityLabel; amount carrega o total.
  const names = expiring.map((item) => item.productName)
  const preview = names.slice(0, 3).join(", ")
  const entityLabel = names.length > 3 ? `${preview} +${names.length - 3}` : preview
  const link = "/dashboard/pantry"

  await prisma.notification.createMany({
    data: members.map((member) => ({
      householdId,
      userId: member.userId,
      type: "PANTRY_EXPIRING" as const,
      actorName: "Despensa",
      entityLabel,
      amount: expiring.length,
      link,
    })),
  })

  const body = getNotificationMessage({
    id: "push",
    type: "PANTRY_EXPIRING",
    actorName: "Despensa",
    entityLabel,
    amount: expiring.length,
    link,
    read: false,
    createdAt: now.toISOString(),
  })

  after(() =>
    sendPushToUsers(
      members.map((member) => member.userId),
      { title: "Põe na Lista", body, link },
    ),
  )
}

export async function getNotifications(
  userId: string,
  householdId: string,
  limit = 20,
): Promise<NotificationDTO[]> {
  const notifications = await prisma.notification.findMany({
    where: { userId, householdId },
    orderBy: { createdAt: "desc" },
    take: limit,
  })

  return notifications.map((notification) => ({
    id: notification.id,
    type: notification.type,
    actorName: notification.actorName,
    entityLabel: notification.entityLabel,
    amount: notification.amount != null ? Number(notification.amount) : null,
    link: notification.link,
    read: notification.readAt != null,
    createdAt: notification.createdAt.toISOString(),
  }))
}

export async function getUnreadNotificationCount(
  userId: string,
  householdId: string,
): Promise<number> {
  return prisma.notification.count({ where: { userId, householdId, readAt: null } })
}

export async function markNotificationRead(notificationId: string, userId: string): Promise<void> {
  await prisma.notification.updateMany({
    where: { id: notificationId, userId },
    data: { readAt: new Date() },
  })
}

export async function markAllNotificationsRead(userId: string, householdId: string): Promise<void> {
  await prisma.notification.updateMany({
    where: { userId, householdId, readAt: null },
    data: { readAt: new Date() },
  })
}
