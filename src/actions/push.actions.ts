"use server"

import { headers } from "next/headers"
import { z } from "zod"
import { getActionErrorMessage } from "@/lib/errors"
import { requireAuth } from "@/lib/permissions"
import { deletePushSubscription, savePushSubscription } from "@/services/push-subscription.service"
import { type ActionResult, actionError, actionOk } from "@/types/action"

const pushSubscriptionSchema = z.object({
  endpoint: z.url().max(500),
  keys: z.object({
    p256dh: z.string().min(1),
    auth: z.string().min(1),
  }),
})

export async function savePushSubscriptionAction(input: unknown): Promise<ActionResult> {
  try {
    const user = await requireAuth()
    const values = pushSubscriptionSchema.parse(input)
    const userAgent = (await headers()).get("user-agent")
    await savePushSubscription({
      userId: user.id,
      endpoint: values.endpoint,
      p256dh: values.keys.p256dh,
      auth: values.keys.auth,
      userAgent,
    })
    return actionOk(undefined)
  } catch (error) {
    return actionError(getActionErrorMessage(error))
  }
}

export async function deletePushSubscriptionAction(endpoint: string): Promise<ActionResult> {
  try {
    const user = await requireAuth()
    await deletePushSubscription(user.id, endpoint)
    return actionOk(undefined)
  } catch (error) {
    return actionError(getActionErrorMessage(error))
  }
}
