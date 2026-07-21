import { prisma } from "@/lib/prisma"
import type { FeedbackDTO } from "@/types/domain"

/** Avaliação atual do usuário, ou null se ainda não avaliou. */
export async function getFeedbackForUser(userId: string): Promise<FeedbackDTO | null> {
  const feedback = await prisma.feedback.findUnique({
    where: { userId },
    select: { rating: true, comment: true, updatedAt: true },
  })

  if (!feedback) {
    return null
  }

  return {
    rating: feedback.rating,
    comment: feedback.comment,
    updatedAt: feedback.updatedAt.toISOString(),
  }
}

/** Cria ou atualiza a avaliação do usuário (1 registro por usuário). */
export async function upsertFeedback(
  userId: string,
  data: { rating: number; comment?: string },
): Promise<FeedbackDTO> {
  const comment = data.comment ?? null
  const feedback = await prisma.feedback.upsert({
    where: { userId },
    create: { userId, rating: data.rating, comment },
    update: { rating: data.rating, comment },
    select: { rating: true, comment: true, updatedAt: true },
  })

  return {
    rating: feedback.rating,
    comment: feedback.comment,
    updatedAt: feedback.updatedAt.toISOString(),
  }
}
