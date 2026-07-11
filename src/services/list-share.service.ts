import { randomBytes } from "node:crypto"
import { prisma } from "@/lib/prisma"
import type { PublicListDTO, ShoppingListShareDTO } from "@/types/domain"

function generateShareToken(): string {
  return randomBytes(32).toString("base64url")
}

function mapShare(share: {
  id: string
  token: string
  expiresAt: Date | null
  createdAt: Date
}): ShoppingListShareDTO {
  return {
    id: share.id,
    token: share.token,
    expiresAt: share.expiresAt?.toISOString() ?? null,
    createdAt: share.createdAt.toISOString(),
  }
}

/** Link ativo (não revogado e não expirado) mais recente de uma lista. */
export async function getActiveShareForList(
  shoppingListId: string,
): Promise<ShoppingListShareDTO | null> {
  const share = await prisma.shoppingListShare.findFirst({
    where: {
      shoppingListId,
      revokedAt: null,
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    },
    orderBy: { createdAt: "desc" },
  })

  return share ? mapShare(share) : null
}

/** Cria um novo link público, revogando qualquer link ativo anterior da lista. */
export async function createShareLink(input: {
  shoppingListId: string
  createdById: string
  expiresInDays?: number | null
}): Promise<ShoppingListShareDTO> {
  const expiresAt =
    input.expiresInDays && input.expiresInDays > 0
      ? new Date(Date.now() + input.expiresInDays * 24 * 60 * 60 * 1000)
      : null

  const share = await prisma.$transaction(async (tx) => {
    await tx.shoppingListShare.updateMany({
      where: { shoppingListId: input.shoppingListId, revokedAt: null },
      data: { revokedAt: new Date() },
    })

    return tx.shoppingListShare.create({
      data: {
        shoppingListId: input.shoppingListId,
        createdById: input.createdById,
        token: generateShareToken(),
        expiresAt,
      },
    })
  })

  return mapShare(share)
}

export async function revokeShareLink(shoppingListId: string): Promise<void> {
  await prisma.shoppingListShare.updateMany({
    where: { shoppingListId, revokedAt: null },
    data: { revokedAt: new Date() },
  })
}

export async function getShareHouseholdId(shoppingListId: string): Promise<string | null> {
  const list = await prisma.shoppingList.findUnique({
    where: { id: shoppingListId },
    select: { householdId: true },
  })

  return list?.householdId ?? null
}

/**
 * Dados públicos e seguros de uma lista a partir do token.
 * Não expõe IDs internos, membros nem valores financeiros. Retorna `null` quando
 * o token é inválido, revogado ou expirado.
 */
export async function getPublicListByToken(token: string): Promise<PublicListDTO | null> {
  const share = await prisma.shoppingListShare.findUnique({
    where: { token },
    include: {
      shoppingList: {
        include: {
          items: {
            orderBy: [{ checked: "asc" }, { createdAt: "asc" }],
            include: { product: { include: { category: true } } },
          },
        },
      },
    },
  })

  if (!share || share.revokedAt) {
    return null
  }

  if (share.expiresAt && share.expiresAt <= new Date()) {
    return null
  }

  return {
    name: share.shoppingList.name,
    canCheck: share.shoppingList.status === "ACTIVE",
    items: share.shoppingList.items.map((item) => ({
      id: item.id,
      productName: item.product.name,
      category: item.product.category?.name ?? null,
      quantity: Number(item.quantity),
      unit: item.unit,
      checked: item.checked,
    })),
  }
}

/**
 * Versão da lista para o polling da página pública. Mesma assinatura de
 * getListVersion, mas com o token como credencial.
 */
export async function getPublicListVersion(token: string): Promise<string | null> {
  const share = await prisma.shoppingListShare.findUnique({
    where: { token },
    select: {
      revokedAt: true,
      expiresAt: true,
      shoppingList: { select: { status: true, updatedAt: true, id: true } },
    },
  })

  if (!share || share.revokedAt) return null
  if (share.expiresAt && share.expiresAt <= new Date()) return null

  const items = await prisma.shoppingListItem.aggregate({
    where: { shoppingListId: share.shoppingList.id },
    _count: { _all: true },
    _max: { updatedAt: true },
  })

  return [
    share.shoppingList.status,
    share.shoppingList.updatedAt.getTime(),
    items._count._all,
    items._max.updatedAt?.getTime() ?? 0,
  ].join(":")
}

/**
 * Marca/desmarca um item via link público. O token é a credencial: precisa
 * estar ativo (não revogado/expirado), a lista precisa estar ACTIVE e o item
 * precisa pertencer à lista do próprio token. Retorna o id da lista para
 * revalidação, ou `null` quando qualquer condição falha.
 */
export async function togglePublicItem(
  token: string,
  itemId: string,
  checked: boolean,
): Promise<{ listId: string } | null> {
  const share = await prisma.shoppingListShare.findUnique({
    where: { token },
    select: {
      revokedAt: true,
      expiresAt: true,
      shoppingListId: true,
      shoppingList: { select: { status: true } },
    },
  })

  if (!share || share.revokedAt) return null
  if (share.expiresAt && share.expiresAt <= new Date()) return null
  if (share.shoppingList.status !== "ACTIVE") return null

  const result = await prisma.shoppingListItem.updateMany({
    where: { id: itemId, shoppingListId: share.shoppingListId },
    data: { checked },
  })

  return result.count > 0 ? { listId: share.shoppingListId } : null
}
