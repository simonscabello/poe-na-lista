import { prisma } from "@/lib/prisma"
import type {
  AdminFeedbackDistributionDTO,
  AdminFeedbackPageDTO,
  AdminFeedbackSummaryDTO,
} from "@/types/domain"

const DEFAULT_PAGE_SIZE = 20

type GetAdminFeedbackParams = {
  page?: number
  pageSize?: number
}

export async function getAdminFeedback({
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE,
}: GetAdminFeedbackParams = {}): Promise<AdminFeedbackPageDTO> {
  const skip = (page - 1) * pageSize

  const [rows, total, aggregate, grouped] = await Promise.all([
    prisma.feedback.findMany({
      orderBy: { updatedAt: "desc" },
      skip,
      take: pageSize,
      select: {
        id: true,
        rating: true,
        comment: true,
        updatedAt: true,
        user: { select: { name: true, email: true, image: true } },
      },
    }),
    prisma.feedback.count(),
    prisma.feedback.aggregate({ _avg: { rating: true } }),
    prisma.feedback.groupBy({ by: ["rating"], _count: { rating: true } }),
  ])

  const countByRating = new Map(grouped.map((row) => [row.rating, row._count.rating]))
  const distribution: AdminFeedbackDistributionDTO[] = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: countByRating.get(rating) ?? 0,
  }))

  return {
    feedback: rows.map(mapFeedbackToSummary),
    total,
    page,
    pageSize,
    averageRating: aggregate._avg.rating ?? 0,
    distribution,
  }
}

function mapFeedbackToSummary(row: {
  id: string
  rating: number
  comment: string | null
  updatedAt: Date
  user: { name: string | null; email: string | null; image: string | null }
}): AdminFeedbackSummaryDTO {
  return {
    id: row.id,
    rating: row.rating,
    comment: row.comment,
    updatedAt: row.updatedAt.toISOString(),
    userName: row.user.name,
    userEmail: row.user.email,
    userImage: row.user.image,
  }
}
