import { randomUUID } from "node:crypto"
import { HouseholdRole, InvitationStatus } from "@/generated/prisma/enums"
import { prisma } from "@/lib/prisma"
import type { InvitationDTO } from "@/types/domain"

const INVITATION_TTL_DAYS = 1

export async function createInvitation(input: {
  householdId: string
  email?: string | null
  invitedById: string
}): Promise<InvitationDTO> {
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + INVITATION_TTL_DAYS)

  const invitation = await prisma.householdInvitation.create({
    data: {
      householdId: input.householdId,
      email: input.email?.toLowerCase() ?? null,
      invitedById: input.invitedById,
      token: randomUUID(),
      expiresAt,
    },
  })

  return mapInvitation(invitation)
}

export async function getPendingInvitations(householdId: string): Promise<InvitationDTO[]> {
  const invitations = await prisma.householdInvitation.findMany({
    where: { householdId, status: InvitationStatus.PENDING },
    orderBy: { createdAt: "desc" },
  })

  return invitations.map(mapInvitation)
}

export async function revokeInvitation(invitationId: string): Promise<void> {
  await prisma.householdInvitation.delete({ where: { id: invitationId } })
}

export async function getInvitationByToken(token: string) {
  return prisma.householdInvitation.findUnique({
    where: { token },
    include: { household: true },
  })
}

export async function acceptInvitation(input: {
  token: string
  userId: string
  userEmail: string | null
}): Promise<{ householdId: string }> {
  const invitation = await prisma.householdInvitation.findUnique({
    where: { token: input.token },
  })

  if (!invitation) {
    throw new Error("Convite não encontrado")
  }

  if (invitation.status !== InvitationStatus.PENDING) {
    throw new Error("Convite já utilizado ou expirado")
  }

  if (invitation.expiresAt < new Date()) {
    await prisma.householdInvitation.update({
      where: { id: invitation.id },
      data: { status: InvitationStatus.EXPIRED },
    })
    throw new Error("Convite expirado")
  }

  const existing = await prisma.householdMember.findUnique({
    where: {
      userId_householdId: { userId: input.userId, householdId: invitation.householdId },
    },
  })

  if (!existing) {
    await prisma.householdMember.create({
      data: {
        userId: input.userId,
        householdId: invitation.householdId,
        role: HouseholdRole.MEMBER,
      },
    })
  }

  await prisma.householdInvitation.update({
    where: { id: invitation.id },
    data: { status: InvitationStatus.ACCEPTED },
  })

  return { householdId: invitation.householdId }
}

function mapInvitation(invitation: {
  id: string
  email: string | null
  token: string
  status: InvitationStatus
  expiresAt: Date
  createdAt: Date
}): InvitationDTO {
  return {
    id: invitation.id,
    email: invitation.email,
    token: invitation.token,
    status: invitation.status,
    expiresAt: invitation.expiresAt.toISOString(),
    createdAt: invitation.createdAt.toISOString(),
  }
}
