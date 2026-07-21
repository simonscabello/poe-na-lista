import { ListKind } from "@/generated/prisma/enums"
import { prisma } from "@/lib/prisma"
import type { SuggestedProductDTO } from "@/types/domain"

/** Janela de análise: as últimas N compras do household. */
const PURCHASE_WINDOW = 10
/** Produto entra na sugestão se apareceu em pelo menos N compras distintas. */
const MIN_PURCHASE_COUNT = 2
const MAX_SUGGESTIONS = 30
/** Menos que isso não vale um card de sugestão. */
const MIN_SUGGESTIONS = 3
/** Se as listas ativas já cobrem esta fração das sugestões, o card some. */
const ACTIVE_COVERAGE_LIMIT = 0.5

export async function getFrequentlyPurchasedProducts(
  householdId: string,
): Promise<SuggestedProductDTO[]> {
  const purchases = await prisma.purchase.findMany({
    where: { householdId, kind: ListKind.GROCERY },
    orderBy: { purchasedAt: "desc" },
    take: PURCHASE_WINDOW,
    select: {
      items: {
        // Só itens ligados a produtos que ainda existem e estão ativos —
        // ShoppingListItem.productId é obrigatório na criação da lista.
        where: { productId: { not: null }, product: { is: { active: true } } },
        select: { productId: true, productName: true, quantity: true, unit: true },
      },
    },
  })

  type ProductAccumulator = {
    productId: string
    productName: string
    purchaseCount: number
    occurrences: Array<{ quantity: number; unit: string | null }>
  }
  const byProduct = new Map<string, ProductAccumulator>()

  for (const purchase of purchases) {
    const seenInPurchase = new Set<string>()
    for (const item of purchase.items) {
      if (!item.productId) continue
      let acc = byProduct.get(item.productId)
      if (!acc) {
        acc = {
          productId: item.productId,
          productName: item.productName,
          purchaseCount: 0,
          occurrences: [],
        }
        byProduct.set(item.productId, acc)
      }
      if (!seenInPurchase.has(item.productId)) {
        acc.purchaseCount += 1
        seenInPurchase.add(item.productId)
      }
      acc.occurrences.push({ quantity: Number(item.quantity), unit: item.unit })
    }
  }

  const suggestions: SuggestedProductDTO[] = []
  for (const acc of byProduct.values()) {
    if (acc.purchaseCount < MIN_PURCHASE_COUNT) continue
    // Compras vêm em ordem decrescente, então a primeira ocorrência é a mais
    // recente — o unit dela é a referência; a quantidade típica é a mediana
    // das ocorrências com esse mesmo unit (não misturar kg com un).
    const referenceUnit = acc.occurrences[0].unit
    const quantities = acc.occurrences
      .filter((occurrence) => occurrence.unit === referenceUnit)
      .map((occurrence) => occurrence.quantity)
      .sort((a, b) => a - b)
    const median = quantities[Math.floor(quantities.length / 2)]

    suggestions.push({
      productId: acc.productId,
      productName: acc.productName,
      quantity: median,
      unit: referenceUnit,
      purchaseCount: acc.purchaseCount,
    })
  }

  suggestions.sort(
    (a, b) => b.purchaseCount - a.purchaseCount || a.productName.localeCompare(b.productName),
  )
  return suggestions.slice(0, MAX_SUGGESTIONS)
}

export async function getSuggestedListPreview(
  householdId: string,
): Promise<{ items: SuggestedProductDTO[] } | null> {
  const items = await getFrequentlyPurchasedProducts(householdId)
  if (items.length < MIN_SUGGESTIONS) return null

  const covered = await prisma.shoppingListItem.findMany({
    where: {
      productId: { in: items.map((item) => item.productId) },
      shoppingList: { householdId, status: "ACTIVE" },
    },
    select: { productId: true },
    distinct: ["productId"],
  })

  if (covered.length / items.length >= ACTIVE_COVERAGE_LIMIT) return null

  return { items }
}
