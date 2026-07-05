"use client"

import { useAtom } from "jotai"
import { Check, ChevronDown, ListChecks } from "lucide-react"
import { EmptyState } from "@/components/common/empty-state"
import { ItemPriceFields } from "@/features/shopping-lists/components/item-price-fields"
import { SwipeableItemRow } from "@/features/shopping-lists/components/swipeable-item-row"
import { hideCheckedItemsAtom } from "@/lib/atoms"
import { formatCurrency } from "@/lib/format-currency"
import { formatQuantity, getMeasureConfigForItem } from "@/lib/measure"
import { computeLineTotal } from "@/lib/pricing"
import { cn } from "@/lib/utils"
import type { PriceModeDTO, ProductDTO, ShoppingListItemDTO } from "@/types/domain"

type ListItemsProps = {
  items: ShoppingListItemDTO[]
  productsById: Map<string, ProductDTO>
  onToggle: (item: ShoppingListItemDTO) => void
  onRemove: (itemId: string) => void
  onChangeQuantity: (item: ShoppingListItemDTO, nextQuantity: number) => void
  onChangePrice: (item: ShoppingListItemDTO, nextPrice: number | null) => void
  onChangePriceMode: (item: ShoppingListItemDTO, nextPriceMode: PriceModeDTO) => void
  readOnly?: boolean
  priceOnly?: boolean
}

export function ListItems({
  items,
  productsById,
  onToggle,
  onRemove,
  onChangeQuantity,
  onChangePrice,
  onChangePriceMode,
  readOnly = false,
  priceOnly = false,
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
          readOnly || priceOnly
            ? "Esta lista não tem itens."
            : "Adicione produtos usando a barra abaixo."
        }
      />
    )
  }

  if (priceOnly) {
    return (
      <ul className="overflow-hidden rounded-2xl bg-card ring-1 ring-border/70">
        {[...pending, ...checked].map((item) => (
          <PriceOnlyItemRow
            key={item.id}
            item={item}
            product={productsById.get(item.productId)}
            onChangePrice={onChangePrice}
            onChangePriceMode={onChangePriceMode}
          />
        ))}
      </ul>
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
              onChangePriceMode={onChangePriceMode}
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
                  onChangePriceMode={onChangePriceMode}
                />
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

type PriceOnlyItemRowProps = {
  item: ShoppingListItemDTO
  product?: ProductDTO
  onChangePrice: (item: ShoppingListItemDTO, nextPrice: number | null) => void
  onChangePriceMode: (item: ShoppingListItemDTO, nextPriceMode: PriceModeDTO) => void
}

function PriceOnlyItemRow({
  item,
  product,
  onChangePrice,
  onChangePriceMode,
}: PriceOnlyItemRowProps) {
  const measure = getMeasureConfigForItem(product, item.unit)
  const unitLabel = item.unit || "un"
  const priceLabel = item.priceMode === "TOTAL" ? "preço total" : measure.pricePlaceholder
  const lineTotal = computeLineTotal(item.price, item.quantity, item.priceMode)
  const missingPrice = item.checked && item.price == null

  return (
    <li
      className={cn(
        "flex flex-col gap-2 border-b px-4 py-3 last:border-b-0",
        missingPrice && "border-l-2 border-l-amber-500 bg-amber-500/5",
      )}
    >
      <div className="flex items-center gap-3">
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
          {lineTotal != null && lineTotal > 0 && (
            <span className="block text-xs">{formatCurrency(lineTotal)}</span>
          )}
        </span>
      </div>

      {missingPrice && (
        <p className="pl-8 text-xs font-medium text-amber-700 dark:text-amber-400">Sem preço</p>
      )}

      <ItemPriceFields
        item={item}
        unitLabel={unitLabel}
        priceLabel={priceLabel}
        onChangePrice={onChangePrice}
        onChangePriceMode={onChangePriceMode}
        className="pl-8"
      />
    </li>
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
          <span className="block text-xs">
            {formatCurrency(computeLineTotal(item.price, item.quantity, item.priceMode) ?? 0)}
          </span>
        )}
      </span>
    </li>
  )
}
