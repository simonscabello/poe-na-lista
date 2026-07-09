import { atomWithStorage } from "jotai/utils"

export type ListItemsSortMode = "alphabetical" | "category"

export const hideCheckedItemsAtom = atomWithStorage("poe_na_lista:hide-checked-items", false)

export const listItemsSortModeAtom = atomWithStorage<ListItemsSortMode>(
  "poe_na_lista:list-items-sort",
  "category",
)
