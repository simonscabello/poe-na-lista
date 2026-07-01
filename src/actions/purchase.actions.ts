"use server"

import { revalidatePath } from "next/cache"
import { finalizePurchaseSchema, stockPantrySchema } from "@/features/expenses/schemas"
import { parseCalendarDate } from "@/lib/calendar-date"
import { getActionErrorMessage } from "@/lib/errors"
import { formatCurrency } from "@/lib/format-currency"
import { requireHouseholdMember } from "@/lib/permissions"
import { stockPantryItems } from "@/services/pantry.service"
import { finalizePurchase } from "@/services/purchase.service"
import { getListDetail, getListHouseholdId } from "@/services/shopping-list.service"
import { type ActionResult, actionError, actionOk } from "@/types/action"

export async function finalizePurchaseAction(
  listId: string,
  input: unknown,
): Promise<ActionResult<{ purchaseId: string }>> {
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

    const items = list.items.map((item) => {
      const unitPrice = item.price
      const totalPrice = unitPrice != null ? unitPrice * item.quantity : null
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
    const allPriced = items.length > 0 && items.every((item) => item.unitPrice != null)

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

    const result = await finalizePurchase({
      householdId,
      shoppingListId: listId,
      createdById: user.id,
      totalAmount,
      purchasedAt: parseCalendarDate(values.purchasedAt),
      storeName: values.storeName || null,
      notes: values.notes || null,
      items,
    })

    revalidatePath("/dashboard")
    revalidatePath("/dashboard/lists")
    revalidatePath(`/dashboard/lists/${listId}`)
    revalidatePath("/dashboard/expenses")
    return actionOk(result)
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
