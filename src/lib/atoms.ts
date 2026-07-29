import { atomWithStorage } from "jotai/utils"

export const hideCheckedItemsAtom = atomWithStorage("poe_na_lista:hide-checked-items", false)

export type PendingHandlingChoice = "NEW_LIST" | "KEEP_IN_LIST"

export const pendingHandlingAtom = atomWithStorage<PendingHandlingChoice>(
  "poe_na_lista:pending-handling",
  "NEW_LIST",
)
