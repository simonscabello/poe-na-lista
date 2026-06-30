"use client"

import { useAtom } from "jotai"
import { ChevronDown, ListChecks } from "lucide-react"
import { EmptyState } from "@/components/common/empty-state"
import { SwipeableItemRow } from "@/features/shopping-lists/components/swipeable-item-row"
import { hideCheckedItemsAtom } from "@/lib/atoms"
import { cn } from "@/lib/utils"
import type { ShoppingListItemDTO } from "@/types/domain"

type ListItemsProps = {
  items: ShoppingListItemDTO[]
  onToggle: (item: ShoppingListItemDTO) => void
  onRemove: (itemId: string) => void
  onChangeQuantity: (item: ShoppingListItemDTO, nextQuantity: number) => void
}

export function ListItems({ items, onToggle, onRemove, onChangeQuantity }: ListItemsProps) {
  const [hideChecked, setHideChecked] = useAtom(hideCheckedItemsAtom)

  const pending = items.filter((item) => !item.checked)
  const checked = items.filter((item) => item.checked)

  if (items.length === 0) {
    return (
      <EmptyState
        icon={ListChecks}
        title="Lista vazia"
        description="Adicione produtos usando a barra abaixo."
      />
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
              onToggle={onToggle}
              onRemove={onRemove}
              onChangeQuantity={onChangeQuantity}
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
                  onToggle={onToggle}
                  onRemove={onRemove}
                  onChangeQuantity={onChangeQuantity}
                />
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
