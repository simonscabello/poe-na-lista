"use server"

import { revalidatePath } from "next/cache"
import { addItemSchema, itemPriceSchema } from "@/features/shopping-lists/schemas"
import { getActionErrorMessage } from "@/lib/errors"
import { requireHouseholdMember } from "@/lib/permissions"
import { notifyBudgetProjectionAlert } from "@/services/notification.service"
import {
  getLastPaidPrices,
  getPurchaseHouseholdId,
  syncPurchaseItemFromListItem,
} from "@/services/purchase.service"
import { getListHouseholdId } from "@/services/shopping-list.service"
import {
  addShoppingListItem,
  getItemListId,
  getItemToggleContext,
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
      priceMode: values.priceMode,
    })
    // Adição de item não notifica: virava um push por item (ruído). Quem monta
    // a lista avisa o grupo explicitamente pelo "Avisar o grupo".
    revalidatePath(`/dashboard/lists/${listId}`)
    return actionOk(undefined)
  } catch (error) {
    return actionError(getActionErrorMessage(error))
  }
}

export async function toggleItemAction(itemId: string, checked: boolean): Promise<ActionResult> {
  try {
    const item = await getItemToggleContext(itemId)
    if (!item) {
      throw new Error("Item não encontrado")
    }
    await requireHouseholdMember(item.householdId)
    await setItemChecked(itemId, checked)
    // Ao marcar um item sem preço, semeia o último preço unitário pago pelo
    // household — itens TOTAL (pesados) ficam de fora porque o valor digitado
    // ali é o total da pesagem, não um preço por unidade.
    if (checked && item.price == null && item.priceMode === "UNIT") {
      const lastPrices = await getLastPaidPrices(item.householdId, [item.productId])
      const lastPrice = lastPrices.get(item.productId)?.unitPrice
      if (lastPrice != null) {
        await setItemPrice(itemId, lastPrice, "UNIT")
      }
    }
    revalidatePath(`/dashboard/lists/${item.listId}`)
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
    const purchaseId = await syncPurchaseItemFromListItem(itemId)
    // Preço informado depois da finalização pode elevar o total do mês e
    // cruzar o orçamento — mesmo alerta da finalização de compra.
    if (purchaseId) {
      const purchaseHouseholdId = await getPurchaseHouseholdId(purchaseId)
      if (purchaseHouseholdId) {
        await notifyBudgetProjectionAlert(purchaseHouseholdId)
      }
    }
    revalidatePath(`/dashboard/lists/${listId}`)
    revalidatePath("/dashboard/lists")
    revalidatePath("/dashboard")
    if (purchaseId) {
      revalidatePath("/dashboard/expenses")
      revalidatePath(`/dashboard/expenses/${purchaseId}`)
    }
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

async function requireListAccess(listId: string) {
  const householdId = await getListHouseholdId(listId)

  if (!householdId) {
    throw new Error("Lista não encontrada")
  }

  const { user } = await requireHouseholdMember(householdId)
  return user
}

async function requireItemAccess(itemId: string): Promise<string> {
  const listId = await getItemListId(itemId)

  if (!listId) {
    throw new Error("Item não encontrado")
  }

  await requireListAccess(listId)
  return listId
}
