import { redirect } from "next/navigation"
import { getOnboardingCompletedAt } from "@/services/user.service"

/** Cookie que indica que o usuário dispensou o card "Primeiros passos". */
export const ONBOARDING_CHECKLIST_DISMISS_COOKIE = "onboarding-checklist-dismissed"

/**
 * Garante que o usuário concluiu o tour de boas-vindas.
 * Caso contrário, redireciona para /dashboard/lists (onde o wizard aparece).
 */
export async function requireOnboardingCompleted(userId: string): Promise<void> {
  const completedAt = await getOnboardingCompletedAt(userId)
  if (completedAt) {
    return
  }
  redirect("/dashboard/lists")
}
