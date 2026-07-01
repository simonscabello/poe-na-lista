"use server"

import { revalidatePath } from "next/cache"
import { pantryItemSchema, updatePantryItemSchema } from "@/features/pantry/schemas"
import { getActionErrorMessage } from "@/lib/errors"
import { requireHouseholdMember } from "@/lib/permissions"
import {
  addPantryItem,
  getPantryItemHouseholdId,
  removePantryItem,
  setPantryItemQuantity,
  updatePantryItem,
} from "@/services/pantry.service"
import { type ActionResult, actionError, actionOk } from "@/types/action"
import type { PantryItemDTO } from "@/types/domain"

function parseExpiration(value?: string): Date | null {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

export async function addPantryItemAction(
  householdId: string,
  input: unknown,
): Promise<ActionResult<PantryItemDTO>> {
  try {
    const { user } = await requireHouseholdMember(householdId)
    const values = pantryItemSchema.parse(input)
    const item = await addPantryItem({
      householdId,
      productId: values.productId,
      quantity: values.quantity,
      minimumQuantity: values.minimumQuantity,
      unit: values.unit || null,
      expirationDate: parseExpiration(values.expirationDate),
      updatedById: user.id,
    })
    revalidatePath("/dashboard/pantry")
    return actionOk(item)
  } catch (error) {
    return actionError(getActionErrorMessage(error))
  }
}

export async function updatePantryItemAction(
  pantryItemId: string,
  input: unknown,
): Promise<ActionResult<PantryItemDTO>> {
  try {
    const { user } = await requirePantryAccess(pantryItemId)
    const values = updatePantryItemSchema.parse(input)
    const item = await updatePantryItem(
      pantryItemId,
      {
        quantity: values.quantity,
        minimumQuantity: values.minimumQuantity,
        unit: values.unit || null,
        expirationDate: parseExpiration(values.expirationDate),
      },
      user.id,
    )
    revalidatePath("/dashboard/pantry")
    return actionOk(item)
  } catch (error) {
    return actionError(getActionErrorMessage(error))
  }
}

export async function setPantryItemQuantityAction(
  pantryItemId: string,
  quantity: number,
): Promise<ActionResult<PantryItemDTO>> {
  try {
    const { user } = await requirePantryAccess(pantryItemId)
    const item = await setPantryItemQuantity(pantryItemId, quantity, user.id)
    revalidatePath("/dashboard/pantry")
    return actionOk(item)
  } catch (error) {
    return actionError(getActionErrorMessage(error))
  }
}

export async function removePantryItemAction(pantryItemId: string): Promise<ActionResult> {
  try {
    await requirePantryAccess(pantryItemId)
    await removePantryItem(pantryItemId)
    revalidatePath("/dashboard/pantry")
    return actionOk(undefined)
  } catch (error) {
    return actionError(getActionErrorMessage(error))
  }
}

async function requirePantryAccess(pantryItemId: string) {
  const householdId = await getPantryItemHouseholdId(pantryItemId)

  if (!householdId) {
    throw new Error("Item da despensa não encontrado")
  }

  return requireHouseholdMember(householdId)
}
