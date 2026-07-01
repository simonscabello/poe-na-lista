"use client"

import { useAtom } from "jotai"
import { Check, ChevronDown, ListChecks } from "lucide-react"
import { EmptyState } from "@/components/common/empty-state"
import { SwipeableItemRow } from "@/features/shopping-lists/components/swipeable-item-row"
import { hideCheckedItemsAtom } from "@/lib/atoms"
import { formatCurrency } from "@/lib/format-currency"
import { formatQuantity } from "@/lib/measure"
import { cn } from "@/lib/utils"
import type { ProductDTO, ShoppingListItemDTO } from "@/types/domain"

type ListItemsProps = {
  items: ShoppingListItemDTO[]
  productsById: Map<string, ProductDTO>
  onToggle: (item: ShoppingListItemDTO) => void
  onRemove: (itemId: string) => void
  onChangeQuantity: (item: ShoppingListItemDTO, nextQuantity: number) => void
  onChangePrice: (item: ShoppingListItemDTO, nextPrice: number | null) => void
  readOnly?: boolean
}

export function ListItems({
  items,
  productsById,
  onToggle,
  onRemove,
  onChangeQuantity,
  onChangePrice,
  readOnly = false,
}: ListItemsProps) {
  const [hideChecked, setHideChecked] = useAtom(hideCheckedItemsAtom)

  const pending = items.filter((item) => !item.checked)
  const checked = items.filter((item) => item.checked)

  if (items.length === 0) {
    return (
      <EmptyState
        icon={ListChecks}
        title="Lista vazia"
        description={
          readOnly ? "Esta lista não tem itens." : "Adicione produtos usando a barra abaixo."
        }
      />
    )
  }

  if (readOnly) {
    return (
      <ul className="overflow-hidden rounded-2xl bg-card ring-1 ring-border/70">
        {[...pending, ...checked].map((item) => (
          <ReadOnlyItemRow key={item.id} item={item} />
        ))}
      </ul>
    )
  }

  return (
    <div className="space-y-6">
      <ul className="overflow-hidden rounded-2xl bg-card ring-1 ring-border/70">
        {pending.length === 0 ? (
          <li className="px-4 py-8 text-center text-sm text-muted-foreground">Tudo comprado! 🎉</li>
        ) : (
          pending.map((item) => (
            <SwipeableItemRow
              key={item.id}
              item={item}
              product={productsById.get(item.productId)}
              onToggle={onToggle}
              onRemove={onRemove}
              onChangeQuantity={onChangeQuantity}
              onChangePrice={onChangePrice}
            />
          ))
        )}
      </ul>

      {checked.length > 0 && (
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => setHideChecked((prev) => !prev)}
            className="flex w-full items-center gap-1.5 px-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ChevronDown
              className={cn(
                "size-4 transition-transform duration-[var(--duration-normal)]",
                hideChecked && "-rotate-90",
              )}
            />
            Comprados · {checked.length}
          </button>
          {!hideChecked && (
            <ul className="overflow-hidden rounded-2xl bg-card ring-1 ring-border/70">
              {checked.map((item) => (
                <SwipeableItemRow
                  key={item.id}
                  item={item}
                  product={productsById.get(item.productId)}
                  onToggle={onToggle}
                  onRemove={onRemove}
                  onChangeQuantity={onChangeQuantity}
                  onChangePrice={onChangePrice}
                />
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

function ReadOnlyItemRow({ item }: { item: ShoppingListItemDTO }) {
  return (
    <li className="flex items-center gap-3 border-b px-4 py-3 last:border-b-0">
      <span
        className={cn(
          "flex size-5 shrink-0 items-center justify-center rounded-full ring-1",
          item.checked ? "bg-primary text-primary-foreground ring-primary" : "ring-border",
        )}
      >
        {item.checked && <Check className="size-3.5" />}
      </span>
      <span
        className={cn(
          "min-w-0 flex-1 truncate text-[0.95rem]",
          item.checked && "text-muted-foreground line-through",
        )}
      >
        {item.productName}
      </span>
      <span className="shrink-0 text-right text-sm text-muted-foreground tabular-nums">
        <span className="block">{formatQuantity(item.quantity, item.unit)}</span>
        {item.price != null && (
          <span className="block text-xs">{formatCurrency(item.price * item.quantity)}</span>
        )}
      </span>
    </li>
  )
}
