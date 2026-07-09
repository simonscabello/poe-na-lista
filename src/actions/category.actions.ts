"use server"

import { revalidatePath } from "next/cache"
import { categorySchema } from "@/features/backoffice/schemas"
import { getActionErrorMessage } from "@/lib/errors"
import { requireAdmin } from "@/lib/permissions"
import { createCategory, deleteCategory, updateCategory } from "@/services/category.service"
import { type ActionResult, actionError, actionOk } from "@/types/action"
import type { AdminCategoryDTO } from "@/types/domain"

function revalidateBackoffice() {
  revalidatePath("/backoffice/categories")
  revalidatePath("/backoffice/products")
}

export async function createCategoryAction(
  input: unknown,
): Promise<ActionResult<AdminCategoryDTO>> {
  try {
    await requireAdmin()
    const values = categorySchema.parse(input)
    const category = await createCategory({
      name: values.name,
      icon: values.icon || null,
      sortOrder: values.sortOrder,
      active: values.active,
    })
    revalidateBackoffice()
    return actionOk(category)
  } catch (error) {
    return actionError(getActionErrorMessage(error))
  }
}

export async function updateCategoryAction(
  id: string,
  input: unknown,
): Promise<ActionResult<AdminCategoryDTO>> {
  try {
    await requireAdmin()
    const values = categorySchema.parse(input)
    const category = await updateCategory(id, {
      name: values.name,
      icon: values.icon || null,
      sortOrder: values.sortOrder,
      active: values.active,
    })
    revalidateBackoffice()
    return actionOk(category)
  } catch (error) {
    return actionError(getActionErrorMessage(error))
  }
}

export async function deleteCategoryAction(
  id: string,
): Promise<ActionResult<{ softDeleted: boolean }>> {
  try {
    await requireAdmin()
    const result = await deleteCategory(id)
    revalidateBackoffice()
    return actionOk(result)
  } catch (error) {
    return actionError(getActionErrorMessage(error))
  }
}
