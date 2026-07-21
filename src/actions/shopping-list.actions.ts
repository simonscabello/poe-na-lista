"use server"

import { revalidatePath } from "next/cache"
import {
  createListSchema,
  listBudgetSchema,
  shoppingListNameSchema,
} from "@/features/shopping-lists/schemas"
import { getActionErrorMessage } from "@/lib/errors"
import { requireHouseholdMember } from "@/lib/permissions"
import { notifyHousehold, notifyListNudge } from "@/services/notification.service"
import { getPurchaseHouseholdId } from "@/services/purchase.service"
import {
  createListFromPurchase,
  createShoppingList,
  createShoppingListWithItems,
  deleteShoppingList,
  duplicateShoppingList,
  getListHouseholdId,
  getListVersion,
  renameShoppingList,
  setListBudgetCap,
} from "@/services/shopping-list.service"
import { getFrequentlyPurchasedProducts } from "@/services/suggestion.service"
import { type ActionResult, actionError, actionOk } from "@/types/action"

const SUGGESTED_LIST_NAME = "Lista da semana"

export async function createListAction(
  householdId: string,
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    const { user } = await requireHouseholdMember(householdId)
    const { name, kind, budgetCap } = createListSchema.parse(input)
    const id = await createShoppingList(householdId, user.id, name, {
      kind,
      budgetCap: budgetCap ?? null,
    })
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

/** Define ou remove o teto de gasto de uma lista-projeto. */
export async function setListBudgetAction(listId: string, input: unknown): Promise<ActionResult> {
  try {
    await requireListAccess(listId)
    const { budgetCap } = listBudgetSchema.parse(input)
    // Zero ou vazio remove o teto.
    await setListBudgetCap(listId, budgetCap != null && budgetCap > 0 ? budgetCap : null)
    revalidatePath(`/dashboard/lists/${listId}`)
    revalidatePath("/dashboard")
    revalidatePath("/dashboard/expenses")
    return actionOk(undefined)
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

export async function createSuggestedListAction(
  householdId: string,
): Promise<ActionResult<{ id: string }>> {
  try {
    const { user } = await requireHouseholdMember(householdId)
    // Recomputa no servidor: não confia em produtos vindos do cliente e evita
    // apontar para produtos removidos entre o preview e o clique.
    const suggestions = await getFrequentlyPurchasedProducts(householdId)
    if (suggestions.length === 0) {
      return actionError("Ainda não há histórico suficiente para sugerir uma lista")
    }
    const id = await createShoppingListWithItems(
      householdId,
      user.id,
      SUGGESTED_LIST_NAME,
      suggestions.map((suggestion) => ({
        productId: suggestion.productId,
        quantity: suggestion.quantity,
        unit: suggestion.unit,
      })),
    )
    await notifyHousehold({
      householdId,
      excludeUserId: user.id,
      type: "LIST_CREATED",
      actorName: user.name ?? "Alguém",
      entityLabel: SUGGESTED_LIST_NAME,
      link: `/dashboard/lists/${id}`,
    })
    revalidatePath("/dashboard")
    return actionOk({ id })
  } catch (error) {
    return actionError(getActionErrorMessage(error))
  }
}

/** "Comprar de novo": cria uma lista nova com os itens de uma compra passada. */
export async function createListFromPurchaseAction(
  purchaseId: string,
): Promise<ActionResult<{ id: string; skippedCount: number }>> {
  try {
    const householdId = await getPurchaseHouseholdId(purchaseId)
    if (!householdId) {
      throw new Error("Compra não encontrada")
    }
    const { user } = await requireHouseholdMember(householdId)
    const created = await createListFromPurchase(purchaseId, user.id)
    if (!created) {
      throw new Error("Compra não encontrada")
    }
    revalidatePath("/dashboard")
    return actionOk(created)
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

/** "Estou montando a lista, dá uma olhada" — aviso manual para o grupo. */
export async function nudgeListAction(listId: string): Promise<ActionResult> {
  try {
    const householdId = await getListHouseholdId(listId)
    if (!householdId) {
      throw new Error("Lista não encontrada")
    }
    const { user } = await requireHouseholdMember(householdId)

    const result = await notifyListNudge({
      listId,
      actorUserId: user.id,
      actorName: user.name ?? "Alguém",
    })

    switch (result) {
      case "sent":
        return actionOk(undefined)
      case "alone":
        return actionError("Você ainda está sozinho no grupo — convide alguém primeiro")
      case "cooldown":
        return actionError("O grupo já foi avisado há pouco — aguarde um momento")
      case "not-found":
        return actionError("Lista não encontrada ou já finalizada")
    }
  } catch (error) {
    return actionError(getActionErrorMessage(error))
  }
}

/** Leitura leve para o polling de sincronização — sem revalidatePath. */
export async function getListVersionAction(
  listId: string,
): Promise<ActionResult<{ version: string }>> {
  try {
    await requireListAccess(listId)
    const version = await getListVersion(listId)
    if (version == null) {
      return actionError("Lista não encontrada")
    }
    return actionOk({ version })
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
