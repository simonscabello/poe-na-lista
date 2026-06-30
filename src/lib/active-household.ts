import { cookies } from "next/headers"
import type { HouseholdSummary } from "@/types/domain"

export const ACTIVE_HOUSEHOLD_COOKIE = "poe_na_lista:active-household-id"

export async function resolveActiveHousehold(
  households: HouseholdSummary[],
): Promise<HouseholdSummary | null> {
  if (households.length === 0) {
    return null
  }

  const store = await cookies()
  const saved = store.get(ACTIVE_HOUSEHOLD_COOKIE)?.value

  return households.find((household) => household.id === saved) ?? households[0]
}
