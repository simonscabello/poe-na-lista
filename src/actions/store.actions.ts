"use server"

import { revalidatePath } from "next/cache"
import { globalStoreSchema, renameHouseholdStoreSchema } from "@/features/backoffice/schemas"
import { getActionErrorMessage } from "@/lib/errors"
import { requireAdmin } from "@/lib/permissions"
import { deleteHouseholdStore, renameHouseholdStore } from "@/services/admin-store.service"
import {
  createGlobalStore,
  deleteGlobalStore,
  updateGlobalStore,
} from "@/services/global-store.service"
import { type ActionResult, actionError, actionOk } from "@/types/action"
import type { AdminGlobalStoreDTO, AdminHouseholdStoreDTO } from "@/types/domain"

function revalidateStoresPath() {
  revalidatePath("/backoffice/stores")
}

export async function createGlobalStoreAction(
  input: unknown,
): Promise<ActionResult<AdminGlobalStoreDTO>> {
  try {
    await requireAdmin()
    const values = globalStoreSchema.parse(input)
    const store = await createGlobalStore(values)
    revalidateStoresPath()
    return actionOk(store)
  } catch (error) {
    return actionError(getActionErrorMessage(error))
  }
}

export async function updateGlobalStoreAction(
  id: string,
  input: unknown,
): Promise<ActionResult<AdminGlobalStoreDTO>> {
  try {
    await requireAdmin()
    const values = globalStoreSchema.parse(input)
    const store = await updateGlobalStore(id, values)
    revalidateStoresPath()
    return actionOk(store)
  } catch (error) {
    return actionError(getActionErrorMessage(error))
  }
}

export async function deleteGlobalStoreAction(
  id: string,
): Promise<ActionResult<{ softDeleted: boolean }>> {
  try {
    await requireAdmin()
    const result = await deleteGlobalStore(id)
    revalidateStoresPath()
    return actionOk(result)
  } catch (error) {
    return actionError(getActionErrorMessage(error))
  }
}

export async function renameHouseholdStoreAction(
  id: string,
  input: unknown,
): Promise<ActionResult<AdminHouseholdStoreDTO>> {
  try {
    await requireAdmin()
    const { name } = renameHouseholdStoreSchema.parse(input)
    const store = await renameHouseholdStore(id, name)
    revalidateStoresPath()
    return actionOk(store)
  } catch (error) {
    return actionError(getActionErrorMessage(error))
  }
}

export async function deleteHouseholdStoreAction(id: string): Promise<ActionResult> {
  try {
    await requireAdmin()
    await deleteHouseholdStore(id)
    revalidateStoresPath()
    return actionOk(undefined)
  } catch (error) {
    return actionError(getActionErrorMessage(error))
  }
}
