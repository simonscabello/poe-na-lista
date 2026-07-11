import { HouseholdRole } from "@/generated/prisma/enums"
import { prisma } from "@/lib/prisma"
import type { HouseholdMemberDTO, HouseholdSummary } from "@/types/domain"

export async function getUserHouseholds(userId: string): Promise<HouseholdSummary[]> {
  const memberships = await prisma.householdMember.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
    include: {
      household: {
        include: {
          _count: { select: { members: true, shoppingLists: true } },
        },
      },
    },
  })

  return memberships.map((membership) => ({
    id: membership.household.id,
    name: membership.household.name,
    role: membership.role,
    memberCount: membership.household._count.members,
    listCount: membership.household._count.shoppingLists,
  }))
}

export async function createHousehold(userId: string, name: string): Promise<HouseholdSummary> {
  const household = await prisma.household.create({
    data: {
      name,
      members: {
        create: { userId, role: HouseholdRole.OWNER },
      },
    },
  })

  return {
    id: household.id,
    name: household.name,
    role: HouseholdRole.OWNER,
    memberCount: 1,
    listCount: 0,
  }
}

export async function getHouseholdMembers(householdId: string): Promise<HouseholdMemberDTO[]> {
  const members = await prisma.householdMember.findMany({
    where: { householdId },
    orderBy: { createdAt: "asc" },
    include: { user: true },
  })

  return members.map((member) => ({
    id: member.id,
    role: member.role,
    userId: member.userId,
    name: member.user.name,
    email: member.user.email,
    image: member.user.image,
  }))
}

export async function updateHouseholdName(householdId: string, name: string): Promise<void> {
  await prisma.household.update({ where: { id: householdId }, data: { name } })
}

/**
 * Remove um membro garantindo que ele pertence ao household informado — o
 * escopo evita que um dono de outro grupo apague membros alheios passando um
 * memberId arbitrário. Retorna `false` quando nada foi removido.
 */
export async function removeHouseholdMember(
  memberId: string,
  householdId: string,
): Promise<boolean> {
  const result = await prisma.householdMember.deleteMany({
    where: { id: memberId, householdId },
  })
  return result.count > 0
}
