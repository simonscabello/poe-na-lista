import { prisma } from "@/lib/prisma"

/**
 * Data em que o usuário concluiu o onboarding guiado, ou null se ainda não viu.
 * Controla a exibição única do wizard de boas-vindas.
 */
export async function getOnboardingCompletedAt(userId: string): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { onboardingCompletedAt: true },
  })

  return user?.onboardingCompletedAt?.toISOString() ?? null
}

/** Marca o onboarding como concluído (idempotente: não sobrescreve a 1ª conclusão). */
export async function markOnboardingCompleted(userId: string): Promise<void> {
  await prisma.user.updateMany({
    where: { id: userId, onboardingCompletedAt: null },
    data: { onboardingCompletedAt: new Date() },
  })
}
