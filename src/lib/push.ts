import webpush, { WebPushError } from "web-push"
import {
  deletePushSubscriptionsByEndpoints,
  getPushSubscriptionsForUsers,
} from "@/services/push-subscription.service"

export type PushPayload = {
  title: string
  body: string
  link?: string | null
}

const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
const privateKey = process.env.VAPID_PRIVATE_KEY
const subject = process.env.VAPID_SUBJECT ?? "mailto:no-reply@poenalista.app"

let configured = false

/** Sem chaves VAPID o envio vira no-op — o app funciona normalmente sem push. */
function ensureConfigured(): boolean {
  if (!publicKey || !privateKey) return false
  if (!configured) {
    webpush.setVapidDetails(subject, publicKey, privateKey)
    configured = true
  }
  return true
}

export async function sendPushToUsers(userIds: string[], payload: PushPayload): Promise<void> {
  if (!ensureConfigured() || userIds.length === 0) return

  const subscriptions = await getPushSubscriptionsForUsers(userIds)
  if (subscriptions.length === 0) return

  const body = JSON.stringify(payload)
  const staleEndpoints: string[] = []

  await Promise.allSettled(
    subscriptions.map(async (subscription) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: { p256dh: subscription.p256dh, auth: subscription.auth },
          },
          body,
          { TTL: 3600 },
        )
      } catch (error) {
        // 404/410 = subscription morta (navegador desinscreveu) — remover do banco.
        if (
          error instanceof WebPushError &&
          (error.statusCode === 404 || error.statusCode === 410)
        ) {
          staleEndpoints.push(subscription.endpoint)
        }
      }
    }),
  )

  await deletePushSubscriptionsByEndpoints(staleEndpoints)
}
