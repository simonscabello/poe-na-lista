import type { Prisma } from "@/generated/prisma/client"
import { prisma } from "@/lib/prisma"
import type { StoreDTO } from "@/types/domain"

/** Normaliza o nome para deduplicar mercados ("Carrefour " e "carrefour" viram o mesmo). */
export function normalizeStoreName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, " ")
}

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

  const created = await tx.store.create({
    data: { householdId, name: trimmed, normalizedName },
    select: { id: true, name: true },
  })
  return { id: created.id, name: created.name }
}
