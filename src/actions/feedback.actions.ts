"use server"

import { revalidatePath } from "next/cache"
import { feedbackSchema } from "@/features/profile/schemas"
import { getActionErrorMessage } from "@/lib/errors"
import { requireAuth } from "@/lib/permissions"
import { upsertFeedback } from "@/services/feedback.service"
import { type ActionResult, actionError, actionOk } from "@/types/action"
import type { FeedbackDTO } from "@/types/domain"

/** Registra ou atualiza a avaliação do app pelo usuário autenticado. */
export async function submitFeedbackAction(input: unknown): Promise<ActionResult<FeedbackDTO>> {
  try {
    const user = await requireAuth()
    const { rating, comment } = feedbackSchema.parse(input)
    const feedback = await upsertFeedback(user.id, { rating, comment })
    revalidatePath("/dashboard/profile")
    return actionOk(feedback)
  } catch (error) {
    return actionError(getActionErrorMessage(error))
  }
}
