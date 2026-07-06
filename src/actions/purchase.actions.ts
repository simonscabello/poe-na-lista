"use server"

import { revalidatePath } from "next/cache"
import { finalizePurchaseSchema, stockPantrySchema } from "@/features/expenses/schemas"
import { parseCalendarDate } from "@/lib/calendar-date"
import { getActionErrorMessage } from "@/lib/errors"
import { formatCurrency } from "@/lib/format-currency"
import { requireHouseholdMember } from "@/lib/permissions"
import { computeLineTotal } from "@/lib/pricing"
import { notifyHousehold } from "@/services/notification.service"
import { stockPantryItems } from "@/services/pantry.service"
import { finalizePurchase, type PendingHandling } from "@/services/purchase.service"
import { getListDetail, getListHouseholdId } from "@/services/shopping-list.service"
import { type ActionResult, actionError, actionOk } from "@/types/action"

export async function finalizePurchaseAction(
  listId: string,
  input: unknown,
): Promise<ActionResult<{ purchaseId: string; pendingListId?: string; pendingListName?: string }>> {
  try {
    const householdId = await getListHouseholdId(listId)
    if (!householdId) {
      throw new Error("Lista não encontrada")
    }
    const { user } = await requireHouseholdMember(householdId)
    const values = finalizePurchaseSchema.parse(input)

    const list = await getListDetail(listId)
    if (!list) {
      throw new Error("Lista não encontrada")
    }

    const checkedListItems = list.items.filter((item) => item.checked)
    const pendingListItems = list.items.filter((item) => !item.checked)

    if (checkedListItems.length === 0) {
      throw new Error("Marque o que você comprou antes de finalizar")
    }

    if (pendingListItems.length > 0 && !values.pendingHandling) {
      throw new Error("Informe o que fazer com os itens pendentes")
    }

    if (values.pendingHandling === "NEW_LIST" && !values.pendingListName?.trim()) {
      throw new Error("Informe o nome da lista de pendências")
    }

    const items = checkedListItems.map((item) => {
      const totalPrice = computeLineTotal(item.price, item.quantity, item.priceMode)
      const unitPrice = item.priceMode === "TOTAL" ? null : item.price
      return {
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        unit: item.unit,
        unitPrice,
        totalPrice,
      }
    })

    const itemsTotal = items.reduce((sum, item) => sum + (item.totalPrice ?? 0), 0)
    const allPriced = items.length > 0 && items.every((item) => item.totalPrice != null)

    let totalAmount: number
    if (allPriced) {
      totalAmount = itemsTotal
    } else {
      if (values.totalAmount == null || values.totalAmount <= 0) {
        throw new Error("Informe o valor total da compra")
      }
      if (values.totalAmount + 0.001 < itemsTotal) {
        throw new Error(
          `O total não pode ser menor que a soma dos itens (${formatCurrency(itemsTotal)})`,
        )
      }
      totalAmount = values.totalAmount
    }

    let pendingHandling: PendingHandling = "NONE"
    if (pendingListItems.length > 0) {
      pendingHandling = values.pendingHandling as PendingHandling
    }

    const pendingListName =
      pendingHandling === "NEW_LIST"
        ? (values.pendingListName?.trim() ?? `${list.name} · pendências`)
        : undefined

    const result = await finalizePurchase({
      householdId,
      shoppingListId: listId,
      createdById: user.id,
      totalAmount,
      purchasedAt: parseCalendarDate(values.purchasedAt),
      storeName: values.storeName || null,
      notes: values.notes || null,
      items,
      listCleanup: {
        checkedItemIds: checkedListItems.map((item) => item.id),
        pendingItemIds: pendingListItems.map((item) => item.id),
        pendingHandling,
        pendingListName,
        listName: list.name,
      },
    })

    await notifyHousehold({
      householdId,
      excludeUserId: user.id,
      type: "PURCHASE_FINALIZED",
      actorName: user.name ?? "Alguém",
      entityLabel: list.name,
      amount: totalAmount,
      link: `/dashboard/expenses/${result.purchaseId}`,
    })

    revalidatePath("/dashboard")
    revalidatePath("/dashboard/lists")
    revalidatePath(`/dashboard/lists/${listId}`)
    revalidatePath("/dashboard/expenses")
    if (result.pendingListId) {
      revalidatePath(`/dashboard/lists/${result.pendingListId}`)
    }

    return actionOk({
      purchaseId: result.purchaseId,
      pendingListId: result.pendingListId,
      pendingListName,
    })
  } catch (error) {
    return actionError(getActionErrorMessage(error))
  }
}

export async function stockPantryFromPurchaseAction(
  householdId: string,
  input: unknown,
): Promise<ActionResult> {
  try {
    const { user } = await requireHouseholdMember(householdId)
    const { items } = stockPantrySchema.parse(input)
    await stockPantryItems(
      householdId,
      user.id,
      items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        unit: item.unit || null,
      })),
    )
    revalidatePath("/dashboard/pantry")
    return actionOk(undefined)
  } catch (error) {
    return actionError(getActionErrorMessage(error))
  }
}
