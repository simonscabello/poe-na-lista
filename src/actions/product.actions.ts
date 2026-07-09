"use server"

import { revalidatePath } from "next/cache"
import { adminProductSchema, mergeProductSchema } from "@/features/backoffice/schemas"
import { createProductSchema } from "@/features/products/schemas"
import { getActionErrorMessage } from "@/lib/errors"
import { requireAdmin, requireHouseholdMember } from "@/lib/permissions"
import {
  createAdminProduct,
  createHouseholdProduct,
  deleteProduct,
  mergeProductIntoGlobal,
  promoteProductToGlobal,
  toggleProductActive,
  updateProduct,
} from "@/services/product.service"
import { type ActionResult, actionError, actionOk } from "@/types/action"
import type { AdminProductDTO, ProductDTO } from "@/types/domain"

export async function createProductAction(
  householdId: string,
  input: unknown,
): Promise<ActionResult<ProductDTO>> {
  try {
    const { user } = await requireHouseholdMember(householdId)
    const values = createProductSchema.parse(input)
    const product = await createHouseholdProduct({
      householdId,
      createdById: user.id,
      name: values.name,
      categoryId: values.categoryId || null,
      measureKind: values.measureKind,
      defaultUnit: values.defaultUnit || null,
      pricedByWeight: values.pricedByWeight,
    })
    return actionOk(product)
  } catch (error) {
    return actionError(getActionErrorMessage(error))
  }
}

export async function createAdminProductAction(
  input: unknown,
): Promise<ActionResult<AdminProductDTO>> {
  try {
    await requireAdmin()
    const values = adminProductSchema.parse(input)
    const product = await createAdminProduct({
      name: values.name,
      categoryId: values.categoryId || null,
      measureKind: values.measureKind,
      defaultUnit: values.defaultUnit || null,
      pricedByWeight: values.pricedByWeight,
      isGlobal: values.isGlobal,
      active: values.active,
    })
    revalidatePath("/backoffice/products")
    return actionOk(product)
  } catch (error) {
    return actionError(getActionErrorMessage(error))
  }
}

export async function updateProductAction(
  id: string,
  input: unknown,
): Promise<ActionResult<AdminProductDTO>> {
  try {
    await requireAdmin()
    const values = adminProductSchema.parse(input)
    const product = await updateProduct(id, {
      name: values.name,
      categoryId: values.categoryId || null,
      measureKind: values.measureKind,
      defaultUnit: values.defaultUnit || null,
      pricedByWeight: values.pricedByWeight,
      isGlobal: values.isGlobal,
      active: values.active,
    })
    revalidatePath("/backoffice/products")
    revalidatePath("/backoffice/moderation")
    return actionOk(product)
  } catch (error) {
    return actionError(getActionErrorMessage(error))
  }
}

export async function toggleProductActiveAction(
  id: string,
  active: boolean,
): Promise<ActionResult<AdminProductDTO>> {
  try {
    await requireAdmin()
    const product = await toggleProductActive(id, active)
    revalidatePath("/backoffice/products")
    revalidatePath("/backoffice/moderation")
    return actionOk(product)
  } catch (error) {
    return actionError(getActionErrorMessage(error))
  }
}

export async function deleteProductAction(
  id: string,
): Promise<ActionResult<{ softDeleted: boolean }>> {
  try {
    await requireAdmin()
    const result = await deleteProduct(id)
    revalidatePath("/backoffice/products")
    revalidatePath("/backoffice/moderation")
    return actionOk(result)
  } catch (error) {
    return actionError(getActionErrorMessage(error))
  }
}

export async function promoteProductAction(id: string): Promise<ActionResult<AdminProductDTO>> {
  try {
    await requireAdmin()
    const product = await promoteProductToGlobal(id)
    revalidatePath("/backoffice/products")
    revalidatePath("/backoffice/moderation")
    return actionOk(product)
  } catch (error) {
    return actionError(getActionErrorMessage(error))
  }
}

export async function mergeProductAction(
  sourceId: string,
  input: unknown,
): Promise<ActionResult<{ merged: true; itemsMoved: number }>> {
  try {
    await requireAdmin()
    const { targetId } = mergeProductSchema.parse(input)
    const result = await mergeProductIntoGlobal(sourceId, targetId)
    revalidatePath("/backoffice/products")
    revalidatePath("/backoffice/moderation")
    return actionOk(result)
  } catch (error) {
    return actionError(getActionErrorMessage(error))
  }
}
