"use server"

import { revalidatePath } from "next/cache"
import { createShareSchema } from "@/features/list-sharing/schemas"
import { getActionErrorMessage } from "@/lib/errors"
import { requireHouseholdMember } from "@/lib/permissions"
import {
  createShareLink,
  getShareHouseholdId,
  revokeShareLink,
} from "@/services/list-share.service"
import { type ActionResult, actionError, actionOk } from "@/types/action"
import type { ShoppingListShareDTO } from "@/types/domain"

export async function createShareLinkAction(
  listId: string,
  input: unknown,
): Promise<ActionResult<ShoppingListShareDTO>> {
  try {
    const { user } = await requireListAccess(listId)
    const { expiresInDays } = createShareSchema.parse(input)
    const share = await createShareLink({
      shoppingListId: listId,
      createdById: user.id,
      expiresInDays: expiresInDays ?? null,
    })
    revalidatePath(`/dashboard/lists/${listId}`)
    return actionOk(share)
  } catch (error) {
    return actionError(getActionErrorMessage(error))
  }
}

export async function revokeShareLinkAction(listId: string): Promise<ActionResult> {
  try {
    await requireListAccess(listId)
    await revokeShareLink(listId)
    revalidatePath(`/dashboard/lists/${listId}`)
    return actionOk(undefined)
  } catch (error) {
    return actionError(getActionErrorMessage(error))
  }
}

async function requireListAccess(listId: string) {
  const householdId = await getShareHouseholdId(listId)

  if (!householdId) {
    throw new Error("Lista não encontrada")
  }

  return requireHouseholdMember(householdId)
}
