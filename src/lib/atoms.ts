import { atomWithStorage } from "jotai/utils"

export type ListItemsSortMode = "alphabetical" | "category"

export const hideCheckedItemsAtom = atomWithStorage("poe_na_lista:hide-checked-items", false)

export const listItemsSortModeAtom = atomWithStorage<ListItemsSortMode>(
  "poe_na_lista:list-items-sort",
  "category",
)

export const marketModeAtom = atomWithStorage("poe_na_lista:market-mode", false)

export type PendingHandlingChoice = "NEW_LIST" | "KEEP_IN_LIST"

export const pendingHandlingAtom = atomWithStorage<PendingHandlingChoice>(
  "poe_na_lista:pending-handling",
  "NEW_LIST",
)
