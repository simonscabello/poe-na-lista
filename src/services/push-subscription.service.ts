import { prisma } from "@/lib/prisma"

export type PushSubscriptionKeys = {
  endpoint: string
  p256dh: string
  auth: string
}

export async function savePushSubscription(input: {
  userId: string
  endpoint: string
  p256dh: string
  auth: string
  userAgent?: string | null
}): Promise<void> {
  // Upsert por endpoint: se o navegador re-registrar (ou trocar de dono após
  // logout/login), a subscription passa a apontar para o usuário atual.
  await prisma.pushSubscription.upsert({
    where: { endpoint: input.endpoint },
    update: {
      userId: input.userId,
      p256dh: input.p256dh,
      auth: input.auth,
      userAgent: input.userAgent ?? null,
    },
    create: {
      userId: input.userId,
      endpoint: input.endpoint,
      p256dh: input.p256dh,
      auth: input.auth,
      userAgent: input.userAgent ?? null,
    },
  })
}

export async function deletePushSubscription(userId: string, endpoint: string): Promise<void> {
  await prisma.pushSubscription.deleteMany({ where: { userId, endpoint } })
}

export async function getPushSubscriptionsForUsers(
  userIds: string[],
): Promise<PushSubscriptionKeys[]> {
  if (userIds.length === 0) return []

  return prisma.pushSubscription.findMany({
    where: { userId: { in: userIds } },
    select: { endpoint: true, p256dh: true, auth: true },
  })
}

export async function deletePushSubscriptionsByEndpoints(endpoints: string[]): Promise<void> {
  if (endpoints.length === 0) return
  await prisma.pushSubscription.deleteMany({ where: { endpoint: { in: endpoints } } })
}
