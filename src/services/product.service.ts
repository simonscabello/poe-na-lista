import type { Prisma } from "@/generated/prisma/client"
import type { MeasureKind } from "@/generated/prisma/enums"
import { prisma } from "@/lib/prisma"
import type { CategoryDTO, ProductDTO } from "@/types/domain"

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

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
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
  if (measureKind === "VOLUME") return "L"
  return null
}
