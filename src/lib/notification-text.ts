import { formatCurrency } from "@/lib/format-currency"
import type { NotificationDTO } from "@/types/domain"

export function getNotificationMessage(notification: NotificationDTO): string {
  switch (notification.type) {
    case "LIST_CREATED":
      return `${notification.actorName} criou a lista "${notification.entityLabel}"`
    case "PURCHASE_FINALIZED":
      return `${notification.actorName} finalizou a compra de "${notification.entityLabel}" — ${formatCurrency(notification.amount ?? 0)}`
    case "MEMBER_JOINED":
      return `${notification.actorName} entrou no grupo`
    case "ITEM_ADDED": {
      // Para ITEM_ADDED o amount é um contador de itens, não um valor em reais.
      const count = notification.amount ?? 1
      return `${notification.actorName} adicionou ${count} ${count === 1 ? "item" : "itens"} em "${notification.entityLabel}"`
    }
    case "BUDGET_ALERT":
      // amount = fechamento projetado; entityLabel = orçamento já formatado.
      return `No ritmo atual, o mês fecha em ~${formatCurrency(notification.amount ?? 0)} — acima do orçamento de ${notification.entityLabel}`
    case "PANTRY_EXPIRING": {
      // amount = contagem de itens; entityLabel = prévia dos nomes.
      const count = notification.amount ?? 1
      return count === 1
        ? `${notification.entityLabel} está vencendo — confira a despensa`
        : `${count} produtos da despensa estão vencendo: ${notification.entityLabel}`
    }
  }
}
