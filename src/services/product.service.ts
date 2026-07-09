import type { Prisma } from "@/generated/prisma/client"
import type { MeasureKind } from "@/generated/prisma/enums"
import { ACOUGUE_CATEGORY_SLUG } from "@/lib/measure"
import { prisma } from "@/lib/prisma"
import { slugify } from "@/lib/slugify"
import type { AdminProductDTO, AdminProductsPageDTO, CategoryDTO, ProductDTO } from "@/types/domain"

const withCategory = { include: { category: true } } satisfies Prisma.ProductDefaultArgs

type ProductWithCategory = Prisma.ProductGetPayload<typeof withCategory>

function toProductDTO(product: ProductWithCategory): ProductDTO {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    isGlobal: product.isGlobal,
    categoryId: product.categoryId,
    categoryName: product.category?.name ?? null,
    categoryIcon: product.category?.icon ?? null,
    categorySortOrder: product.category?.sortOrder ?? null,
    measureKind: product.measureKind as ProductDTO["measureKind"],
    defaultUnit: product.defaultUnit,
    pricedByWeight: product.pricedByWeight,
  }
}

/** Categorias ativas na ordem oficial de exibição. */
export async function getCategories(): Promise<CategoryDTO[]> {
  const categories = await prisma.category.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
  })

  return categories.map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    icon: category.icon,
    sortOrder: category.sortOrder,
  }))
}

/**
 * Full product catalog for a household (global + household-owned), sorted by name.
 * Read-only: powers client-side browsing/search in the catalog sheet so the UI
 * never round-trips to the server while the user taps through products.
 */
export async function getProductCatalog(householdId: string): Promise<ProductDTO[]> {
  const products = await prisma.product.findMany({
    where: { active: true, OR: [{ isGlobal: true }, { householdId }] },
    orderBy: { name: "asc" },
    include: { category: true },
  })

  return products.map(toProductDTO)
}

/**
 * Products most frequently added across the household's lists, most-used first.
 * Read-only aggregation over existing shopping-list items — derives the
 * "Comprados recentemente" section without any schema change.
 */
export async function getFrequentProducts(householdId: string, limit = 12): Promise<ProductDTO[]> {
  const grouped = await prisma.shoppingListItem.groupBy({
    by: ["productId"],
    where: { shoppingList: { householdId } },
    _count: { productId: true },
    _max: { createdAt: true },
    orderBy: [{ _count: { productId: "desc" } }, { _max: { createdAt: "desc" } }],
    take: limit,
  })

  if (grouped.length === 0) {
    return []
  }

  const products = await prisma.product.findMany({
    where: { id: { in: grouped.map((row) => row.productId) }, active: true },
    include: { category: true },
  })

  const byId = new Map(products.map((product) => [product.id, product]))

  return grouped
    .map((row) => byId.get(row.productId))
    .filter((product): product is NonNullable<typeof product> => product != null)
    .map(toProductDTO)
}

export async function createHouseholdProduct(input: {
  householdId: string
  createdById: string
  name: string
  categoryId?: string | null
  measureKind?: MeasureKind
  defaultUnit?: string | null
  pricedByWeight?: boolean
}): Promise<ProductDTO> {
  const measureKind = input.measureKind ?? "UNIT"
  const defaultUnit =
    measureKind === "UNIT" ? null : input.defaultUnit?.trim() || defaultUnitFor(measureKind)
  const pricedByWeight = measureKind === "UNIT" && (input.pricedByWeight ?? false)

  await assertWeightAllowed(measureKind, input.categoryId ?? null)

  const product = await prisma.product.create({
    data: {
      householdId: input.householdId,
      createdById: input.createdById,
      name: input.name,
      slug: slugify(input.name),
      categoryId: input.categoryId ?? null,
      isGlobal: false,
      measureKind,
      defaultUnit,
      pricedByWeight,
    },
    include: { category: true },
  })

  return toProductDTO(product)
}

function defaultUnitFor(measureKind: MeasureKind): string | null {
  if (measureKind === "WEIGHT") return "kg"
  return null
}

async function assertWeightAllowed(
  measureKind: MeasureKind,
  categoryId: string | null,
): Promise<void> {
  if (measureKind !== "WEIGHT") return

  const category = categoryId
    ? await prisma.category.findUnique({ where: { id: categoryId } })
    : null

  if (category?.slug !== ACOUGUE_CATEGORY_SLUG) {
    throw new Error("Peso (kg) só é permitido para produtos da categoria Açougue")
  }
}

const adminProductSelect = {
  id: true,
  name: true,
  slug: true,
  isGlobal: true,
  active: true,
  categoryId: true,
  measureKind: true,
  defaultUnit: true,
  pricedByWeight: true,
  category: { select: { name: true, icon: true } },
  household: { select: { name: true } },
  _count: { select: { items: true, pantryItems: true, purchaseItems: true } },
} satisfies Prisma.ProductSelect

type AdminProductRow = Prisma.ProductGetPayload<{ select: typeof adminProductSelect }>

function toAdminProductDTO(product: AdminProductRow): AdminProductDTO {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    isGlobal: product.isGlobal,
    active: product.active,
    categoryId: product.categoryId,
    categoryName: product.category?.name ?? null,
    categoryIcon: product.category?.icon ?? null,
    measureKind: product.measureKind as AdminProductDTO["measureKind"],
    defaultUnit: product.defaultUnit,
    pricedByWeight: product.pricedByWeight,
    householdName: product.household?.name ?? null,
    inUse: product._count.items + product._count.pantryItems + product._count.purchaseItems > 0,
  }
}

const ADMIN_PRODUCTS_PAGE_SIZE = 20

export type AdminProductScope = "all" | "global" | "household"

export async function getAdminProducts({
  search,
  page = 1,
  pageSize = ADMIN_PRODUCTS_PAGE_SIZE,
  categoryId,
  scope = "all",
}: {
  search?: string
  page?: number
  pageSize?: number
  categoryId?: string
  scope?: AdminProductScope
} = {}): Promise<AdminProductsPageDTO> {
  const trimmedSearch = search?.trim()

  const where: Prisma.ProductWhereInput = {
    ...(trimmedSearch ? { name: { contains: trimmedSearch } } : {}),
    ...(categoryId ? { categoryId } : {}),
    ...(scope === "global" ? { isGlobal: true } : {}),
    ...(scope === "household" ? { isGlobal: false } : {}),
  }

  const skip = (page - 1) * pageSize

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { name: "asc" },
      skip,
      take: pageSize,
      select: adminProductSelect,
    }),
    prisma.product.count({ where }),
  ])

  return {
    products: products.map(toAdminProductDTO),
    total,
    page,
    pageSize,
  }
}

export async function createAdminProduct(input: {
  name: string
  categoryId?: string | null
  measureKind?: MeasureKind
  defaultUnit?: string | null
  pricedByWeight?: boolean
  isGlobal?: boolean
  active?: boolean
}): Promise<AdminProductDTO> {
  const measureKind = input.measureKind ?? "UNIT"
  const defaultUnit =
    measureKind === "UNIT" ? null : input.defaultUnit?.trim() || defaultUnitFor(measureKind)
  const pricedByWeight = measureKind === "UNIT" && (input.pricedByWeight ?? false)
  const isGlobal = input.isGlobal ?? true

  await assertWeightAllowed(measureKind, input.categoryId ?? null)

  const product = await prisma.product.create({
    data: {
      name: input.name,
      slug: slugify(input.name),
      categoryId: input.categoryId ?? null,
      isGlobal,
      householdId: null,
      active: input.active ?? true,
      measureKind,
      defaultUnit,
      pricedByWeight,
    },
    select: adminProductSelect,
  })

  return toAdminProductDTO(product)
}

export async function updateProduct(
  id: string,
  input: {
    name: string
    categoryId?: string | null
    measureKind?: MeasureKind
    defaultUnit?: string | null
    pricedByWeight?: boolean
    isGlobal?: boolean
    active?: boolean
  },
): Promise<AdminProductDTO> {
  const current = await prisma.product.findUnique({
    where: { id },
    select: { householdId: true },
  })

  if (!current) {
    throw new Error("Produto não encontrado")
  }

  const measureKind = input.measureKind ?? "UNIT"
  const defaultUnit =
    measureKind === "UNIT" ? null : input.defaultUnit?.trim() || defaultUnitFor(measureKind)
  const pricedByWeight = measureKind === "UNIT" && (input.pricedByWeight ?? false)

  await assertWeightAllowed(measureKind, input.categoryId ?? null)

  const product = await prisma.product.update({
    where: { id },
    data: {
      name: input.name,
      slug: slugify(input.name),
      categoryId: input.categoryId ?? null,
      isGlobal: input.isGlobal ?? undefined,
      active: input.active ?? undefined,
      measureKind,
      defaultUnit,
      pricedByWeight,
    },
    select: adminProductSelect,
  })

  return toAdminProductDTO(product)
}

export async function toggleProductActive(id: string, active: boolean): Promise<AdminProductDTO> {
  const product = await prisma.product.update({
    where: { id },
    data: { active },
    select: adminProductSelect,
  })

  return toAdminProductDTO(product)
}

export async function deleteProduct(id: string): Promise<{ softDeleted: boolean }> {
  const product = await prisma.product.findUnique({
    where: { id },
    select: { _count: { select: { items: true, pantryItems: true, purchaseItems: true } } },
  })

  if (!product) {
    throw new Error("Produto não encontrado")
  }

  const inUse = product._count.items + product._count.pantryItems + product._count.purchaseItems > 0

  if (inUse) {
    await prisma.product.update({ where: { id }, data: { active: false } })
    return { softDeleted: true }
  }

  await prisma.product.delete({ where: { id } })
  return { softDeleted: false }
}
