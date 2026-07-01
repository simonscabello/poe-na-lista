import { prisma } from "@/lib/prisma"
import type { AdminUserSummaryDTO, AdminUsersPageDTO } from "@/types/domain"

const DEFAULT_PAGE_SIZE = 20

type GetAdminUsersParams = {
  search?: string
  page?: number
  pageSize?: number
}

export async function getAdminUsers({
  search,
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE,
}: GetAdminUsersParams = {}): Promise<AdminUsersPageDTO> {
  const trimmedSearch = search?.trim()
  const where = trimmedSearch
    ? {
        OR: [{ name: { contains: trimmedSearch } }, { email: { contains: trimmedSearch } }],
      }
    : undefined

  const skip = (page - 1) * pageSize

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        createdAt: true,
        _count: {
          select: {
            householdMembers: true,
            createdLists: true,
          },
        },
      },
    }),
    prisma.user.count({ where }),
  ])

  return {
    users: users.map(mapUserToSummary),
    total,
    page,
    pageSize,
  }
}

function mapUserToSummary(user: {
  id: string
  name: string | null
  email: string | null
  image: string | null
  createdAt: Date
  _count: { householdMembers: number; createdLists: number }
}): AdminUserSummaryDTO {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    image: user.image,
    createdAt: user.createdAt.toISOString(),
    householdCount: user._count.householdMembers,
    listsCreatedCount: user._count.createdLists,
  }
}
