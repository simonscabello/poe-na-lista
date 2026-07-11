"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { createShareSchema } from "@/features/list-sharing/schemas"
import { getActionErrorMessage } from "@/lib/errors"
import { requireHouseholdMember } from "@/lib/permissions"
import {
  createShareLink,
  getPublicListVersion,
  getShareHouseholdId,
  revokeShareLink,
  togglePublicItem,
} from "@/services/list-share.service"
import { type ActionResult, actionError, actionOk } from "@/types/action"
import type { ShoppingListShareDTO } from "@/types/domain"

const publicToggleSchema = z.object({
  token: z.string().min(1),
  itemId: z.string().min(1),
  checked: z.boolean(),
})

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

/**
 * Ação pública (sem sessão): o token do link é a credencial. Toda a validação
 * — token ativo, lista ACTIVE, item pertencente à lista — acontece no service.
 */
export async function togglePublicItemAction(input: unknown): Promise<ActionResult> {
  try {
    const { token, itemId, checked } = publicToggleSchema.parse(input)
    const result = await togglePublicItem(token, itemId, checked)
    if (!result) {
      return actionError("Este link não está mais disponível")
    }
    revalidatePath(`/share/${token}`)
    revalidatePath(`/dashboard/lists/${result.listId}`)
    return actionOk(undefined)
  } catch (error) {
    return actionError(getActionErrorMessage(error))
  }
}

/** Leitura leve para o polling da página pública — o token é a credencial. */
export async function getPublicListVersionAction(
  token: string,
): Promise<ActionResult<{ version: string }>> {
  try {
    const version = await getPublicListVersion(token)
    if (version == null) {
      return actionError("Este link não está mais disponível")
    }
    return actionOk({ version })
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
