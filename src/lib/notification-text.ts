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
  }
}
