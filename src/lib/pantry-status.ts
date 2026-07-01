import type { PantryItemStatus } from "@/types/domain"

/** Dias de antecedência para considerar a validade "próxima". */
export const EXPIRING_SOON_DAYS = 7

/**
 * Deriva o estado de um item da despensa a partir da quantidade atual, do mínimo
 * e da validade — evitando duplicar o estado no banco.
 *
 * Regras (em ordem de prioridade):
 * - `out`: não há quantidade em casa (<= 0);
 * - `expiring_soon`: validade dentro dos próximos {@link EXPIRING_SOON_DAYS} dias;
 * - `low_stock`: quantidade atual menor ou igual ao mínimo definido;
 * - `available`: caso contrário.
 */
export function computePantryStatus(
  quantity: number,
  minimumQuantity: number,
  expirationDate?: Date | string | null,
  now: Date = new Date(),
): PantryItemStatus {
  if (quantity <= 0) {
    return "out"
  }

  if (expirationDate) {
    const expires = typeof expirationDate === "string" ? new Date(expirationDate) : expirationDate
    const limit = new Date(now)
    limit.setDate(limit.getDate() + EXPIRING_SOON_DAYS)
    if (expires <= limit) {
      return "expiring_soon"
    }
  }

  if (quantity <= minimumQuantity) {
    return "low_stock"
  }

  return "available"
}

export const PANTRY_STATUS_LABEL: Record<PantryItemStatus, string> = {
  available: "Disponível",
  low_stock: "Estoque baixo",
  out: "Acabou",
  expiring_soon: "Validade próxima",
}
