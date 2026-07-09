import { prisma } from "@/lib/prisma"
import { slugify } from "@/lib/slugify"
import type { AdminCategoryDTO } from "@/types/domain"

type CategoryWithCount = {
  id: string
  name: string
  slug: string
  icon: string | null
  sortOrder: number
  active: boolean
  _count: { products: number }
}

function toAdminCategoryDTO(category: CategoryWithCount): AdminCategoryDTO {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    icon: category.icon,
    sortOrder: category.sortOrder,
    active: category.active,
    productCount: category._count.products,
  }
}

async function assertUniqueName(name: string, slug: string, ignoreId?: string): Promise<void> {
  const existing = await prisma.category.findFirst({
    where: {
      OR: [{ name }, { slug }],
      ...(ignoreId ? { NOT: { id: ignoreId } } : {}),
    },
    select: { id: true },
  })

  if (existing) {
    throw new Error("Já existe uma categoria com esse nome")
  }
}

export async function getAdminCategories(): Promise<AdminCategoryDTO[]> {
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      icon: true,
      sortOrder: true,
      active: true,
      _count: { select: { products: true } },
    },
  })

  return categories.map(toAdminCategoryDTO)
}

export async function createCategory(input: {
  name: string
  icon?: string | null
  sortOrder?: number
  active?: boolean
}): Promise<AdminCategoryDTO> {
  const slug = slugify(input.name)
  await assertUniqueName(input.name, slug)

  const category = await prisma.category.create({
    data: {
      name: input.name,
      slug,
      icon: input.icon || null,
      sortOrder: input.sortOrder ?? 0,
      active: input.active ?? true,
    },
    select: {
      id: true,
      name: true,
      slug: true,
      icon: true,
      sortOrder: true,
      active: true,
      _count: { select: { products: true } },
    },
  })

  return toAdminCategoryDTO(category)
}

export async function updateCategory(
  id: string,
  input: {
    name: string
    icon?: string | null
    sortOrder?: number
    active?: boolean
  },
): Promise<AdminCategoryDTO> {
  const slug = slugify(input.name)
  await assertUniqueName(input.name, slug, id)

  const category = await prisma.category.update({
    where: { id },
    data: {
      name: input.name,
      slug,
      icon: input.icon || null,
      sortOrder: input.sortOrder ?? 0,
      active: input.active ?? true,
    },
    select: {
      id: true,
      name: true,
      slug: true,
      icon: true,
      sortOrder: true,
      active: true,
      _count: { select: { products: true } },
    },
  })

  return toAdminCategoryDTO(category)
}

export async function deleteCategory(id: string): Promise<{ softDeleted: boolean }> {
  const category = await prisma.category.findUnique({
    where: { id },
    select: { _count: { select: { products: true } } },
  })

  if (!category) {
    throw new Error("Categoria não encontrada")
  }

  if (category._count.products > 0) {
    await prisma.category.update({ where: { id }, data: { active: false } })
    return { softDeleted: true }
  }

  await prisma.category.delete({ where: { id } })
  return { softDeleted: false }
}
