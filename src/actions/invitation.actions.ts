"use server"

import { revalidatePath } from "next/cache"
import { HouseholdRole } from "@/generated/prisma/enums"
import { getActionErrorMessage } from "@/lib/errors"
import { requireAuth, requireHouseholdMember } from "@/lib/permissions"
import { acceptInvitation, createInvitation, revokeInvitation } from "@/services/invitation.service"
import { type ActionResult, actionError, actionOk } from "@/types/action"
import type { InvitationDTO } from "@/types/domain"

export async function createInviteLinkAction(
  householdId: string,
): Promise<ActionResult<InvitationDTO>> {
  try {
    const { user } = await requireHouseholdMember(householdId, HouseholdRole.ADMIN)
    const invitation = await createInvitation({ householdId, invitedById: user.id })
    revalidatePath("/dashboard/household")
    return actionOk(invitation)
  } catch (error) {
    return actionError(getActionErrorMessage(error))
  }
}

export async function revokeInvitationAction(
  householdId: string,
  invitationId: string,
): Promise<ActionResult> {
  try {
    await requireHouseholdMember(householdId, HouseholdRole.ADMIN)
    await revokeInvitation(invitationId)
    revalidatePath("/dashboard/household")
    return actionOk(undefined)
  } catch (error) {
    return actionError(getActionErrorMessage(error))
  }
}

export async function acceptInvitationAction(
  token: string,
): Promise<ActionResult<{ householdId: string }>> {
  try {
    const user = await requireAuth()
    const result = await acceptInvitation({
      token,
      userId: user.id,
      userEmail: user.email ?? null,
    })
    revalidatePath("/dashboard")
    return actionOk(result)
  } catch (error) {
    return actionError(getActionErrorMessage(error))
  }
}
