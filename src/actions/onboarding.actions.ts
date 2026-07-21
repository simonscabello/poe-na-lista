"use server"

import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { getActionErrorMessage } from "@/lib/errors"
import { ONBOARDING_CHECKLIST_DISMISS_COOKIE } from "@/lib/onboarding"
import { requireAuth } from "@/lib/permissions"
import { markOnboardingCompleted } from "@/services/user.service"
import { type ActionResult, actionError, actionOk } from "@/types/action"

/** Marca o onboarding guiado como concluído para o usuário autenticado. */
export async function completeOnboardingAction(): Promise<ActionResult> {
  try {
    const user = await requireAuth()
    await markOnboardingCompleted(user.id)
    revalidatePath("/dashboard")
    revalidatePath("/dashboard/lists")
    return actionOk(undefined)
  } catch (error) {
    return actionError(getActionErrorMessage(error))
  }
}

/** Dispensa o card "Primeiros passos". */
export async function dismissOnboardingChecklistAction(): Promise<void> {
  const store = await cookies()
  store.set(ONBOARDING_CHECKLIST_DISMISS_COOKIE, "1", {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  })
  revalidatePath("/dashboard/lists")
}
