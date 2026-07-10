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
  unpricedCheckedItems: number
  purchaseCount: number
  status: ShoppingListStatusDTO
  updatedAt: string
  lastPurchaseStoreName: string | null
  lastPurchaseTotal: number | null
}

export type CategoryDTO = {
  id: string
  name: string
  slug: string
  icon: string | null
  sortOrder: number
}

export type MeasureKindDTO = "UNIT" | "WEIGHT"

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
  pricedByWeight: boolean
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

export type ListPurchaseInfoDTO = {
  id: string
  storeName: string | null
  purchasedAt: string
  totalAmount: number
}

export type ShoppingListDetail = {
  id: string
  name: string
  householdId: string
  status: ShoppingListStatusDTO
  completedAt: string | null
  items: ShoppingListItemDTO[]
  /** Compra mais recente registrada a partir desta lista (contexto da lista finalizada). */
  latestPurchase: ListPurchaseInfoDTO | null
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

export type StoreDTO = {
  id: string
  name: string
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

export type StoreExpenseDTO = {
  store: string
  total: number
  purchaseCount: number
  averagePerPurchase: number
}

export type ExpenseMetricsDTO = {
  currentMonthTotal: number
  previousMonthTotal: number
  percentChange: number | null
  averageLastPurchases: number
  monthlyAverage: number
  purchaseCount: number
  largestPurchase: number
  largestPurchaseStoreName: string | null
  monthlySeries: MonthlyExpensePointDTO[]
  categoryBreakdown: CategoryExpenseDTO[]
  storeBreakdown: StoreExpenseDTO[]
}

export type ExpenseEstimateDTO = {
  min: number
  max: number
  basedOnPurchases: number
  hasItemPricing: boolean
  method: string
}

export type SuggestedProductDTO = {
  productId: string
  productName: string
  quantity: number
  unit: string | null
  purchaseCount: number
}

export type NotificationTypeDTO =
  | "LIST_CREATED"
  | "PURCHASE_FINALIZED"
  | "MEMBER_JOINED"
  | "ITEM_ADDED"

export type NotificationDTO = {
  id: string
  type: NotificationTypeDTO
  actorName: string
  entityLabel: string | null
  amount: number | null
  link: string | null
  read: boolean
  createdAt: string
}

export type AdminUserGrowthPointDTO = {
  month: string
  label: string
  newUsers: number
  cumulativeUsers: number
}

export type AdminActivityPointDTO = {
  month: string
  label: string
  listsCreated: number
  purchasesFinalized: number
}

export type AdminOverviewDTO = {
  totalUsers: number
  newUsersLast30Days: number
  totalHouseholds: number
  totalActiveLists: number
  totalCompletedLists: number
  totalListItems: number
  totalPurchases: number
  totalPurchaseAmount: number
  userGrowthSeries: AdminUserGrowthPointDTO[]
  activitySeries: AdminActivityPointDTO[]
}

export type AdminUserSummaryDTO = {
  id: string
  name: string | null
  email: string | null
  image: string | null
  createdAt: string
  householdCount: number
  listsCreatedCount: number
}

export type AdminUsersPageDTO = {
  users: AdminUserSummaryDTO[]
  total: number
  page: number
  pageSize: number
}

export type AdminCategoryDTO = {
  id: string
  name: string
  slug: string
  icon: string | null
  sortOrder: number
  active: boolean
  productCount: number
}

export type AdminProductDTO = {
  id: string
  name: string
  slug: string
  isGlobal: boolean
  active: boolean
  categoryId: string | null
  categoryName: string | null
  categoryIcon: string | null
  measureKind: MeasureKindDTO
  defaultUnit: string | null
  pricedByWeight: boolean
  householdName: string | null
  inUse: boolean
}

export type AdminProductsPageDTO = {
  products: AdminProductDTO[]
  total: number
  page: number
  pageSize: number
}

export type AdminModerationProductDTO = AdminProductDTO & {
  createdAt: string
  creatorName: string | null
  creatorEmail: string | null
  usageCount: number
}

export type AdminModerationProductsPageDTO = {
  products: AdminModerationProductDTO[]
  total: number
  page: number
  pageSize: number
}

export type AdminGlobalStoreDTO = {
  id: string
  name: string
  normalizedName: string
  active: boolean
  householdUsageCount: number
}

export type AdminGlobalStoresPageDTO = {
  stores: AdminGlobalStoreDTO[]
  total: number
  page: number
  pageSize: number
}

export type AdminHouseholdStoreDTO = {
  id: string
  name: string
  normalizedName: string
  householdId: string
  householdName: string
  purchaseCount: number
  matchesGlobalStore: boolean
}

export type AdminHouseholdStoresPageDTO = {
  stores: AdminHouseholdStoreDTO[]
  total: number
  page: number
  pageSize: number
}
