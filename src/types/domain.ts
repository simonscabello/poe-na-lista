import type { HouseholdRole, InvitationStatus } from "@/generated/prisma/enums"

export type HouseholdSummary = {
  id: string
  name: string
  role: HouseholdRole
  memberCount: number
  listCount: number
}

export type HouseholdMemberDTO = {
  id: string
  role: HouseholdRole
  userId: string
  name: string | null
  email: string | null
  image: string | null
}

export type InvitationDTO = {
  id: string
  email: string | null
  token: string
  status: InvitationStatus
  expiresAt: string
  createdAt: string
}

export type ShoppingListSummary = {
  id: string
  name: string
  totalItems: number
  checkedItems: number
  updatedAt: string
}

export type CategoryDTO = {
  id: string
  name: string
  slug: string
  icon: string | null
  sortOrder: number
}

export type ProductDTO = {
  id: string
  name: string
  slug: string
  isGlobal: boolean
  categoryId: string | null
  categoryName: string | null
  categoryIcon: string | null
  categorySortOrder: number | null
}

export type ShoppingListItemDTO = {
  id: string
  productId: string
  productName: string
  category: string | null
  quantity: number
  unit: string | null
  checked: boolean
  notes: string | null
}

export type ShoppingListDetail = {
  id: string
  name: string
  householdId: string
  items: ShoppingListItemDTO[]
}
