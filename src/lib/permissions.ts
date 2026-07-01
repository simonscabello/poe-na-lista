import { HouseholdRole } from "@/generated/prisma/enums"
import { isAdminEmail } from "@/lib/admin"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export class AuthError extends Error {
  constructor(message = "Não autenticado") {
    super(message)
    this.name = "AuthError"
  }
}

export class ForbiddenError extends Error {
  constructor(message = "Acesso negado") {
    super(message)
    this.name = "ForbiddenError"
  }
}

const roleRank: Record<HouseholdRole, number> = {
  [HouseholdRole.MEMBER]: 0,
  [HouseholdRole.ADMIN]: 1,
  [HouseholdRole.OWNER]: 2,
}

export async function requireAuth() {
  const session = await auth()

  if (!session?.user?.id) {
    throw new AuthError()
  }

  return session.user
}

export async function requireAdmin() {
  const user = await requireAuth()

  if (!isAdminEmail(user.email)) {
    throw new ForbiddenError("Acesso restrito ao administrador")
  }

  return user
}

export async function requireHouseholdMember(
  householdId: string,
  minRole: HouseholdRole = HouseholdRole.MEMBER,
) {
  const user = await requireAuth()

  const member = await prisma.householdMember.findUnique({
    where: { userId_householdId: { userId: user.id, householdId } },
  })

  if (!member) {
    throw new ForbiddenError("Você não pertence a este grupo")
  }

  if (roleRank[member.role] < roleRank[minRole]) {
    throw new ForbiddenError("Permissão insuficiente para esta ação")
  }

  return { user, member }
}
