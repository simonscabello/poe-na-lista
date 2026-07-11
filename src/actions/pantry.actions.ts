"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { parseCalendarDate } from "@/lib/calendar-date"
import { getActionErrorMessage } from "@/lib/errors"
import { requireHouseholdMember } from "@/lib/permissions"
import { notifyHousehold } from "@/services/notification.service"
import {
  getLowStockPantryItems,
  getPantryItemHouseholdId,
  removePantryItem,
  updatePantryItem,
} from "@/services/pantry.service"
import {
  createShoppingListWithItems,
  getMostRecentActiveListId,
} from "@/services/shopping-list.service"
import { addShoppingListItem } from "@/services/shopping-list-item.service"
import { type ActionResult, actionError, actionOk } from "@/types/action"

const RESTOCK_LIST_NAME = "Reposição da despensa"

const updatePantrySchema = z.object({
  quantity: z.coerce.number().min(0, "Quantidade inválida").max(99999).optional(),
  minimumQuantity: z.coerce.number().min(0, "Mínimo inválido").max(99999).optional(),
  // "YYYY-MM-DD" define; null limpa; ausente não mexe.
  expirationDate: z.string().nullable().optional(),
})

export async function updatePantryItemAction(
  itemId: string,
  input: unknown,
): Promise<ActionResult> {
  try {
    const { user } = await requirePantryAccess(itemId)
    const values = updatePantrySchema.parse(input)

    const data: { quantity?: number; minimumQuantity?: number; expirationDate?: Date | null } = {}
    if (values.quantity != null) data.quantity = values.quantity
    if (values.minimumQuantity != null) data.minimumQuantity = values.minimumQuantity
    if (values.expirationDate !== undefined) {
      data.expirationDate = values.expirationDate ? parseCalendarDate(values.expirationDate) : null
    }

    await updatePantryItem(itemId, user.id, data)
    revalidatePath("/dashboard/pantry")
    return actionOk(undefined)
  } catch (error) {
    return actionError(getActionErrorMessage(error))
  }
}

export async function removePantryItemAction(itemId: string): Promise<ActionResult> {
  try {
    await requirePantryAccess(itemId)
    await removePantryItem(itemId)
    revalidatePath("/dashboard/pantry")
    return actionOk(undefined)
  } catch (error) {
    return actionError(getActionErrorMessage(error))
  }
}

/**
 * Adiciona tudo que está abaixo do mínimo à lista ativa mais recente; sem
 * lista ativa, cria "Reposição da despensa". A quantidade é recalculada no
 * servidor a partir do estado atual da despensa.
 */
export async function restockPantryAction(
  householdId: string,
): Promise<ActionResult<{ listId: string; added: number }>> {
  try {
    const { user } = await requireHouseholdMember(householdId)
    const lowItems = await getLowStockPantryItems(householdId)
    if (lowItems.length === 0) {
      return actionError("Nada abaixo do mínimo na despensa")
    }

    let listId = await getMostRecentActiveListId(householdId)

    if (listId) {
      for (const item of lowItems) {
        await addShoppingListItem({
          shoppingListId: listId,
          productId: item.productId,
          quantity: item.restockQuantity,
          unit: item.unit,
          priceMode: item.priceMode,
        })
      }
    } else {
      listId = await createShoppingListWithItems(
        householdId,
        user.id,
        RESTOCK_LIST_NAME,
        lowItems.map((item) => ({
          productId: item.productId,
          quantity: item.restockQuantity,
          unit: item.unit,
        })),
      )
      await notifyHousehold({
        householdId,
        excludeUserId: user.id,
        type: "LIST_CREATED",
        actorName: user.name ?? "Alguém",
        entityLabel: RESTOCK_LIST_NAME,
        link: `/dashboard/lists/${listId}`,
      })
    }

    revalidatePath("/dashboard")
    revalidatePath("/dashboard/lists")
    revalidatePath(`/dashboard/lists/${listId}`)
    revalidatePath("/dashboard/pantry")
    return actionOk({ listId, added: lowItems.length })
  } catch (error) {
    return actionError(getActionErrorMessage(error))
  }
}

async function requirePantryAccess(itemId: string) {
  const householdId = await getPantryItemHouseholdId(itemId)

  if (!householdId) {
    throw new Error("Item não encontrado na despensa")
  }

  return requireHouseholdMember(householdId)
}
