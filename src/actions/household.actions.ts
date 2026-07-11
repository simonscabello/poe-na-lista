"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { householdNameSchema } from "@/features/households/schemas"
import { HouseholdRole } from "@/generated/prisma/enums"
import { getActionErrorMessage } from "@/lib/errors"
import { ForbiddenError, requireAuth, requireHouseholdMember } from "@/lib/permissions"
import { setMonthlyBudget } from "@/services/budget.service"
import {
  createHousehold,
  removeHouseholdMember,
  updateHouseholdName,
} from "@/services/household.service"
import { type ActionResult, actionError, actionOk } from "@/types/action"
import type { HouseholdSummary } from "@/types/domain"

const monthlyBudgetSchema = z.object({
  budget: z.coerce.number().min(0, "Valor inválido").max(9999999).nullable(),
})

export async function createHouseholdAction(
  input: unknown,
): Promise<ActionResult<HouseholdSummary>> {
  try {
    const user = await requireAuth()
    const { name } = householdNameSchema.parse(input)
    const household = await createHousehold(user.id, name)
    revalidatePath("/dashboard")
    return actionOk(household)
  } catch (error) {
    return actionError(getActionErrorMessage(error))
  }
}

export async function renameHouseholdAction(
  householdId: string,
  input: unknown,
): Promise<ActionResult> {
  try {
    await requireHouseholdMember(householdId, HouseholdRole.ADMIN)
    const { name } = householdNameSchema.parse(input)
    await updateHouseholdName(householdId, name)
    revalidatePath("/dashboard/household")
    return actionOk(undefined)
  } catch (error) {
    return actionError(getActionErrorMessage(error))
  }
}

export async function setMonthlyBudgetAction(
  householdId: string,
  input: unknown,
): Promise<ActionResult> {
  try {
    await requireHouseholdMember(householdId, HouseholdRole.ADMIN)
    const { budget } = monthlyBudgetSchema.parse(input)
    // Zero ou vazio remove o orçamento.
    await setMonthlyBudget(householdId, budget != null && budget > 0 ? budget : null)
    revalidatePath("/dashboard/expenses")
    revalidatePath("/dashboard/lists")
    revalidatePath("/dashboard")
    return actionOk(undefined)
  } catch (error) {
    return actionError(getActionErrorMessage(error))
  }
}

export async function removeMemberAction(
  householdId: string,
  memberId: string,
): Promise<ActionResult> {
  try {
    const { member } = await requireHouseholdMember(householdId, HouseholdRole.OWNER)

    if (member.id === memberId) {
      throw new ForbiddenError("O dono não pode se remover")
    }

    await removeHouseholdMember(memberId)
    revalidatePath("/dashboard/household")
    return actionOk(undefined)
  } catch (error) {
    return actionError(getActionErrorMessage(error))
  }
}
