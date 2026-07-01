"use server"

import { revalidatePath } from "next/cache"
import { addItemSchema, itemPriceSchema } from "@/features/shopping-lists/schemas"
import { getActionErrorMessage } from "@/lib/errors"
import { requireHouseholdMember } from "@/lib/permissions"
import { getListHouseholdId } from "@/services/shopping-list.service"
import {
  addShoppingListItem,
  getItemListId,
  removeShoppingListItem,
  setItemChecked,
  setItemPrice,
  updateItemQuantity,
} from "@/services/shopping-list-item.service"
import { type ActionResult, actionError, actionOk } from "@/types/action"

export async function addItemAction(listId: string, input: unknown): Promise<ActionResult> {
  try {
    await requireListAccess(listId)
    const values = addItemSchema.parse(input)
    await addShoppingListItem({
      shoppingListId: listId,
      productId: values.productId,
      quantity: values.quantity,
      unit: values.unit || null,
      notes: values.notes || null,
    })
    revalidatePath(`/dashboard/lists/${listId}`)
    return actionOk(undefined)
  } catch (error) {
    return actionError(getActionErrorMessage(error))
  }
}

export async function toggleItemAction(itemId: string, checked: boolean): Promise<ActionResult> {
  try {
    const listId = await requireItemAccess(itemId)
    await setItemChecked(itemId, checked)
    revalidatePath(`/dashboard/lists/${listId}`)
    return actionOk(undefined)
  } catch (error) {
    return actionError(getActionErrorMessage(error))
  }
}

export async function updateItemQuantityAction(
  itemId: string,
  quantity: number,
  unit?: string | null,
): Promise<ActionResult> {
  try {
    const listId = await requireItemAccess(itemId)
    await updateItemQuantity(itemId, quantity, unit ?? null)
    revalidatePath(`/dashboard/lists/${listId}`)
    return actionOk(undefined)
  } catch (error) {
    return actionError(getActionErrorMessage(error))
  }
}

export async function updateItemPriceAction(itemId: string, input: unknown): Promise<ActionResult> {
  try {
    const listId = await requireItemAccess(itemId)
    const { price, priceMode } = itemPriceSchema.parse(input)
    await setItemPrice(itemId, price, priceMode)
    revalidatePath(`/dashboard/lists/${listId}`)
    return actionOk(undefined)
  } catch (error) {
    return actionError(getActionErrorMessage(error))
  }
}

export async function removeItemAction(itemId: string): Promise<ActionResult> {
  try {
    const listId = await requireItemAccess(itemId)
    await removeShoppingListItem(itemId)
    revalidatePath(`/dashboard/lists/${listId}`)
    return actionOk(undefined)
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

async function requireItemAccess(itemId: string): Promise<string> {
  const listId = await getItemListId(itemId)

  if (!listId) {
    throw new Error("Item não encontrado")
  }

  await requireListAccess(listId)
  return listId
}
