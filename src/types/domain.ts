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
  status: ShoppingListStatusDTO
  updatedAt: string
}

export type CategoryDTO = {
  id: string
  name: string
  slug: string
  icon: string | null
  sortOrder: number
}

export type MeasureKindDTO = "UNIT" | "WEIGHT" | "VOLUME"

export type ProductDTO = {
  id: string
  name: string
  slug: string
  isGlobal: boolean
  categoryId: string | null
  categoryName: string | null
  categoryIcon: string | null
  categorySortOrder: number | null
  measureKind: MeasureKindDTO
  defaultUnit: string | null
}

export type PriceModeDTO = "UNIT" | "TOTAL"

export type ShoppingListItemDTO = {
  id: string
  productId: string
  productName: string
  category: string | null
  quantity: number
  unit: string | null
  checked: boolean
  notes: string | null
  price: number | null
  priceMode: PriceModeDTO
}

export type ShoppingListStatusDTO = "ACTIVE" | "COMPLETED"

export type ShoppingListDetail = {
  id: string
  name: string
  householdId: string
  status: ShoppingListStatusDTO
  completedAt: string | null
  items: ShoppingListItemDTO[]
}

export type PantryItemStatus = "available" | "low_stock" | "out" | "expiring_soon"

export type PantryItemDTO = {
  id: string
  productId: string
  productName: string
  categoryId: string | null
  categoryName: string | null
  quantity: number
  minimumQuantity: number
  unit: string | null
  expirationDate: string | null
  status: PantryItemStatus
  updatedByName: string | null
  updatedAt: string
}

export type ShoppingListShareDTO = {
  id: string
  token: string
  expiresAt: string | null
  createdAt: string
}

export type PublicListItemDTO = {
  productName: string
  category: string | null
  quantity: number
  unit: string | null
  checked: boolean
}

export type PublicListDTO = {
  name: string
  items: PublicListItemDTO[]
}

export type PurchaseSummaryDTO = {
  id: string
  listName: string | null
  purchasedAt: string
  totalAmount: number
  itemCount: number
  storeName: string | null
}

export type PurchaseLineDTO = {
  id: string
  productName: string
  quantity: number
  unit: string | null
  unitPrice: number | null
  totalPrice: number | null
}

export type PurchaseDetailDTO = {
  id: string
  listName: string | null
  purchasedAt: string
  totalAmount: number
  storeName: string | null
  notes: string | null
  items: PurchaseLineDTO[]
}

export type MonthlyExpensePointDTO = {
  month: string
  label: string
  total: number
}

export type CategoryExpenseDTO = {
  category: string
  total: number
}

export type ExpenseMetricsDTO = {
  currentMonthTotal: number
  previousMonthTotal: number
  percentChange: number | null
  averageLastPurchases: number
  monthlyAverage: number
  purchaseCount: number
  largestPurchase: number
  monthlySeries: MonthlyExpensePointDTO[]
  categoryBreakdown: CategoryExpenseDTO[]
}

export type ExpenseEstimateDTO = {
  min: number
  max: number
  basedOnPurchases: number
  hasItemPricing: boolean
  method: string
}
