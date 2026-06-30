"use server"

import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { ACTIVE_HOUSEHOLD_COOKIE } from "@/lib/active-household"

const ONE_YEAR = 60 * 60 * 24 * 365

export async function setActiveHouseholdAction(householdId: string): Promise<void> {
  const store = await cookies()
  store.set(ACTIVE_HOUSEHOLD_COOKIE, householdId, {
    path: "/",
    maxAge: ONE_YEAR,
    sameSite: "lax",
  })
  revalidatePath("/dashboard")
}
