import { normalizeStoreName } from "@/lib/normalize-store-name"
import { prisma } from "@/lib/prisma"
import type { AdminHouseholdStoreDTO, AdminHouseholdStoresPageDTO } from "@/types/domain"

const DEFAULT_PAGE_SIZE = 20

export async function getAdminHouseholdStores({
  search,
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE,
  householdId,
}: {
  search?: string
  page?: number
  pageSize?: number
  householdId?: string
} = {}): Promise<AdminHouseholdStoresPageDTO> {
  const trimmedSearch = search?.trim()

  const where = {
    ...(trimmedSearch ? { name: { contains: trimmedSearch } } : {}),
    ...(householdId ? { householdId } : {}),
  }

  const skip = (page - 1) * pageSize

  const [stores, total, activeGlobalNames] = await Promise.all([
    prisma.store.findMany({
      where,
      orderBy: { name: "asc" },
      skip,
      take: pageSize,
      select: {
        id: true,
        name: true,
        normalizedName: true,
        householdId: true,
        household: { select: { name: true } },
        _count: { select: { purchases: true } },
      },
    }),
    prisma.store.count({ where }),
    prisma.globalStore.findMany({
      where: { active: true },
      select: { normalizedName: true },
    }),
  ])

  const globalNameSet = new Set(activeGlobalNames.map((store) => store.normalizedName))

  return {
    stores: stores.map(
      (store): AdminHouseholdStoreDTO => ({
        id: store.id,
        name: store.name,
        normalizedName: store.normalizedName,
        householdId: store.householdId,
        householdName: store.household.name,
        purchaseCount: store._count.purchases,
        matchesGlobalStore: globalNameSet.has(store.normalizedName),
      }),
    ),
    total,
    page,
    pageSize,
  }
}

export async function renameHouseholdStore(
  id: string,
  name: string,
): Promise<AdminHouseholdStoreDTO> {
  const trimmed = name.trim()
  const normalizedName = normalizeStoreName(trimmed)

  const current = await prisma.store.findUnique({
    where: { id },
    select: { householdId: true },
  })

  if (!current) {
    throw new Error("Loja não encontrada")
  }

  const duplicate = await prisma.store.findUnique({
    where: {
      householdId_normalizedName: { householdId: current.householdId, normalizedName },
    },
    select: { id: true },
  })

  if (duplicate && duplicate.id !== id) {
    throw new Error("Já existe uma loja com esse nome neste grupo")
  }

  const globalMatch = await prisma.globalStore.findFirst({
    where: { normalizedName, active: true },
    select: { name: true },
  })

  const canonicalName = globalMatch?.name ?? trimmed

  const store = await prisma.store.update({
    where: { id },
    data: { name: canonicalName, normalizedName },
    select: {
      id: true,
      name: true,
      normalizedName: true,
      householdId: true,
      household: { select: { name: true } },
      _count: { select: { purchases: true } },
    },
  })

  return {
    id: store.id,
    name: store.name,
    normalizedName: store.normalizedName,
    householdId: store.householdId,
    householdName: store.household.name,
    purchaseCount: store._count.purchases,
    matchesGlobalStore: Boolean(globalMatch),
  }
}

export async function deleteHouseholdStore(id: string): Promise<void> {
  const store = await prisma.store.findUnique({
    where: { id },
    select: { _count: { select: { purchases: true } } },
  })

  if (!store) {
    throw new Error("Loja não encontrada")
  }

  if (store._count.purchases > 0) {
    throw new Error("Não é possível excluir uma loja com compras registradas")
  }

  await prisma.store.delete({ where: { id } })
}
