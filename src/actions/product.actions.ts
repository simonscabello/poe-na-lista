"use server"

import { createProductSchema } from "@/features/products/schemas"
import { getActionErrorMessage } from "@/lib/errors"
import { requireHouseholdMember } from "@/lib/permissions"
import { createHouseholdProduct } from "@/services/product.service"
import { type ActionResult, actionError, actionOk } from "@/types/action"
import type { ProductDTO } from "@/types/domain"

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
