import { after } from "next/server"
import { getNotificationMessage } from "@/lib/notification-text"
import { prisma } from "@/lib/prisma"
import { sendPushToUsers } from "@/lib/push"
import { getHouseholdMembers } from "@/services/household.service"
import type { NotificationDTO, NotificationTypeDTO } from "@/types/domain"

export async function notifyHousehold(input: {
  householdId: string
  excludeUserId: string
  type: NotificationTypeDTO
  actorName: string
  entityLabel?: string | null
  amount?: number | null
  link?: string | null
}): Promise<void> {
  const members = await getHouseholdMembers(input.householdId)
  const recipients = members.filter((member) => member.userId !== input.excludeUserId)

  if (recipients.length === 0) {
    return
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
}

const ITEM_ADDED_GROUP_WINDOW_MS = 5 * 60 * 1000

/**
 * Notifica adição de item agrupando por janela: adições do mesmo autor na
 * mesma lista dentro de 5 minutos incrementam a notificação não lida existente
 * em vez de criar uma nova (amount é o contador de itens).
 */
export async function notifyItemAdded(input: {
  listId: string
  actorUserId: string
  actorName: string
}): Promise<void> {
  const list = await prisma.shoppingList.findUnique({
    where: { id: input.listId },
    select: { name: true, householdId: true },
  })
  if (!list) return

  const members = await getHouseholdMembers(list.householdId)
  const recipients = members.filter((member) => member.userId !== input.actorUserId)
  if (recipients.length === 0) return

  const link = `/dashboard/lists/${input.listId}`
  const windowStart = new Date(Date.now() - ITEM_ADDED_GROUP_WINDOW_MS)
  const pushTargets: Array<{ userId: string; count: number }> = []

  for (const member of recipients) {
    const existing = await prisma.notification.findFirst({
      where: {
        userId: member.userId,
        householdId: list.householdId,
        type: "ITEM_ADDED",
        actorUserId: input.actorUserId,
        link,
        readAt: null,
        createdAt: { gte: windowStart },
      },
      orderBy: { createdAt: "desc" },
      select: { id: true },
    })

    if (existing) {
      const updated = await prisma.notification.update({
        where: { id: existing.id },
        data: { amount: { increment: 1 } },
        select: { amount: true },
      })
      pushTargets.push({ userId: member.userId, count: Number(updated.amount ?? 1) })
    } else {
      await prisma.notification.create({
        data: {
          householdId: list.householdId,
          userId: member.userId,
          type: "ITEM_ADDED",
          actorName: input.actorName,
          actorUserId: input.actorUserId,
          entityLabel: list.name,
          amount: 1,
          link,
        },
      })
      pushTargets.push({ userId: member.userId, count: 1 })
    }
  }

  after(() =>
    Promise.allSettled(
      pushTargets.map((target) =>
        sendPushToUsers([target.userId], {
          title: "Põe na Lista",
          body: getNotificationMessage({
            id: "push",
            type: "ITEM_ADDED",
            actorName: input.actorName,
            entityLabel: list.name,
            amount: target.count,
            link,
            read: false,
            createdAt: new Date().toISOString(),
          }),
          link,
        }),
      ),
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
