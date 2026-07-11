import type { Prisma } from "@/generated/prisma/client"
import { normalizeStoreName } from "@/lib/normalize-store-name"
import { prisma } from "@/lib/prisma"
import { getActiveGlobalStoreByNormalizedName } from "@/services/global-store.service"
import type { StoreDTO } from "@/types/domain"

export { normalizeStoreName } from "@/lib/normalize-store-name"

export async function getHouseholdStores(householdId: string): Promise<StoreDTO[]> {
  const stores = await prisma.store.findMany({
    where: { householdId },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  })

  return stores.map((store) => ({ id: store.id, name: store.name }))
}

/**
 * Encontra um mercado do household pelo nome normalizado ou cria um novo.
 * Recebe um client de transação para participar da finalização da compra.
 */
export async function findOrCreateStore(
  tx: Prisma.TransactionClient,
  householdId: string,
  name: string,
): Promise<StoreDTO> {
  const trimmed = name.trim()
  const normalizedName = normalizeStoreName(trimmed)

  const existing = await tx.store.findUnique({
    where: { householdId_normalizedName: { householdId, normalizedName } },
    select: { id: true, name: true },
  })
  if (existing) {
    return { id: existing.id, name: existing.name }
  }

  const globalStore = await getActiveGlobalStoreByNormalizedName(normalizedName)
  const displayName = globalStore?.name ?? trimmed

  // upsert (não create) porque duas finalizações concorrentes com o mesmo
  // mercado novo violariam o unique (household, normalizedName) e derrubariam a
  // transação inteira da compra. O update no-op resolve o empate.
  const created = await tx.store.upsert({
    where: { householdId_normalizedName: { householdId, normalizedName } },
    create: { householdId, name: displayName, normalizedName },
    update: {},
    select: { id: true, name: true },
  })
  return { id: created.id, name: created.name }
}
