import { normalizeStoreName } from "@/lib/normalize-store-name"
import { prisma } from "@/lib/prisma"
import type { AdminGlobalStoreDTO, AdminGlobalStoresPageDTO } from "@/types/domain"

const DEFAULT_PAGE_SIZE = 20

type GlobalStoreRow = {
  id: string
  name: string
  normalizedName: string
  active: boolean
}

async function countHouseholdsUsingName(normalizedName: string): Promise<number> {
  const groups = await prisma.store.groupBy({
    by: ["householdId"],
    where: { normalizedName },
  })
  return groups.length
}

function toAdminGlobalStoreDTO(
  store: GlobalStoreRow,
  householdUsageCount: number,
): AdminGlobalStoreDTO {
  return {
    id: store.id,
    name: store.name,
    normalizedName: store.normalizedName,
    active: store.active,
    householdUsageCount,
  }
}

async function assertUniqueGlobalStoreName(
  normalizedName: string,
  ignoreId?: string,
): Promise<void> {
  const existing = await prisma.globalStore.findFirst({
    where: {
      normalizedName,
      ...(ignoreId ? { NOT: { id: ignoreId } } : {}),
    },
    select: { id: true },
  })

  if (existing) {
    throw new Error("Já existe uma loja global com esse nome")
  }
}

export async function getAdminGlobalStores({
  search,
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE,
}: {
  search?: string
  page?: number
  pageSize?: number
} = {}): Promise<AdminGlobalStoresPageDTO> {
  const trimmedSearch = search?.trim()
  const where = trimmedSearch ? { name: { contains: trimmedSearch } } : undefined
  const skip = (page - 1) * pageSize

  const [stores, total] = await Promise.all([
    prisma.globalStore.findMany({
      where,
      orderBy: { name: "asc" },
      skip,
      take: pageSize,
      select: { id: true, name: true, normalizedName: true, active: true },
    }),
    prisma.globalStore.count({ where }),
  ])

  const storesWithUsage = await Promise.all(
    stores.map(async (store) => {
      const householdUsageCount = await countHouseholdsUsingName(store.normalizedName)
      return toAdminGlobalStoreDTO(store, householdUsageCount)
    }),
  )

  return { stores: storesWithUsage, total, page, pageSize }
}

export async function createGlobalStore(input: {
  name: string
  active?: boolean
}): Promise<AdminGlobalStoreDTO> {
  const name = input.name.trim()
  const normalizedName = normalizeStoreName(name)
  await assertUniqueGlobalStoreName(normalizedName)

  const store = await prisma.globalStore.create({
    data: { name, normalizedName, active: input.active ?? true },
    select: { id: true, name: true, normalizedName: true, active: true },
  })

  return toAdminGlobalStoreDTO(store, 0)
}

export async function updateGlobalStore(
  id: string,
  input: { name: string; active?: boolean },
): Promise<AdminGlobalStoreDTO> {
  const name = input.name.trim()
  const normalizedName = normalizeStoreName(name)
  await assertUniqueGlobalStoreName(normalizedName, id)

  const store = await prisma.globalStore.update({
    where: { id },
    data: { name, normalizedName, active: input.active ?? true },
    select: { id: true, name: true, normalizedName: true, active: true },
  })

  const householdUsageCount = await countHouseholdsUsingName(store.normalizedName)
  return toAdminGlobalStoreDTO(store, householdUsageCount)
}

export async function deleteGlobalStore(id: string): Promise<{ softDeleted: boolean }> {
  const store = await prisma.globalStore.findUnique({
    where: { id },
    select: { normalizedName: true },
  })

  if (!store) {
    throw new Error("Loja global não encontrada")
  }

  const householdUsageCount = await countHouseholdsUsingName(store.normalizedName)

  if (householdUsageCount > 0) {
    await prisma.globalStore.update({ where: { id }, data: { active: false } })
    return { softDeleted: true }
  }

  await prisma.globalStore.delete({ where: { id } })
  return { softDeleted: false }
}

export async function getActiveGlobalStoreByNormalizedName(
  normalizedName: string,
): Promise<{ name: string } | null> {
  const store = await prisma.globalStore.findFirst({
    where: { normalizedName, active: true },
    select: { name: true },
  })
  return store
}
