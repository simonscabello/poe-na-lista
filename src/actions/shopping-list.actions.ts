"use server"

import { revalidatePath } from "next/cache"
import { shoppingListNameSchema } from "@/features/shopping-lists/schemas"
import { getActionErrorMessage } from "@/lib/errors"
import { requireHouseholdMember } from "@/lib/permissions"
import { notifyHousehold } from "@/services/notification.service"
import {
  createShoppingList,
  deleteShoppingList,
  duplicateShoppingList,
  getListHouseholdId,
  renameShoppingList,
} from "@/services/shopping-list.service"
import { type ActionResult, actionError, actionOk } from "@/types/action"

export async function createListAction(
  householdId: string,
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    const { user } = await requireHouseholdMember(householdId)
    const { name } = shoppingListNameSchema.parse(input)
    const id = await createShoppingList(householdId, user.id, name)
    await notifyHousehold({
      householdId,
      excludeUserId: user.id,
      type: "LIST_CREATED",
      actorName: user.name ?? "Alguém",
      entityLabel: name,
      link: `/dashboard/lists/${id}`,
    })
    revalidatePath("/dashboard")
    return actionOk({ id })
  } catch (error) {
    return actionError(getActionErrorMessage(error))
  }
}

export async function renameListAction(listId: string, input: unknown): Promise<ActionResult> {
  try {
    await requireListAccess(listId)
    const { name } = shoppingListNameSchema.parse(input)
    await renameShoppingList(listId, name)
    revalidatePath(`/dashboard/lists/${listId}`)
    revalidatePath("/dashboard")
    return actionOk(undefined)
  } catch (error) {
    return actionError(getActionErrorMessage(error))
  }
}

export async function deleteListAction(listId: string): Promise<ActionResult> {
  try {
    await requireListAccess(listId)
    await deleteShoppingList(listId)
    revalidatePath("/dashboard")
    return actionOk(undefined)
  } catch (error) {
    return actionError(getActionErrorMessage(error))
  }
}

export async function duplicateListAction(listId: string): Promise<ActionResult<{ id: string }>> {
  try {
    const householdId = await getListHouseholdId(listId)
    if (!householdId) {
      throw new Error("Lista não encontrada")
    }
    const { user } = await requireHouseholdMember(householdId)
    const id = await duplicateShoppingList(listId, user.id)
    revalidatePath("/dashboard")
    return actionOk({ id })
  } catch (error) {
    return actionError(getActionErrorMessage(error))
  }
}

async function requireListAccess(listId: string): Promise<void> {
  const householdId = await getListHouseholdId(listId)

  if (!householdId) {
    throw new Error("Lista não encontrada")
  }

  await requireHouseholdMember(householdId)
}
