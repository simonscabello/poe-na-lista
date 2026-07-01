import { prisma } from "@/lib/prisma"
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
      entityLabel: input.entityLabel ?? null,
      amount: input.amount ?? null,
      link: input.link ?? null,
    })),
  })
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
