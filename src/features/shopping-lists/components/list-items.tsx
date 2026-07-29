"use client"

import { useAtom } from "jotai"
import { Check, ChevronDown, ListChecks } from "lucide-react"
import { type ReactNode, useMemo } from "react"
import { EmptyState } from "@/components/common/empty-state"
import { ItemPriceFields } from "@/features/shopping-lists/components/item-price-fields"
import { SwipeableItemRow } from "@/features/shopping-lists/components/swipeable-item-row"
import { type CategoryGroup, groupByCategory } from "@/features/shopping-lists/lib/sort-list-items"
import { hideCheckedItemsAtom } from "@/lib/atoms"
import { categoryEmoji } from "@/lib/categories"
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

  const pending = useMemo(() => items.filter((item) => !item.checked), [items])
  const checked = useMemo(() => items.filter((item) => item.checked), [items])

  const pendingGroups = useMemo(
    () => groupByCategory(pending, productsById),
    [pending, productsById],
  )
  const checkedGroups = useMemo(
    () => groupByCategory(checked, productsById),
    [checked, productsById],
  )
  const allGroups = useMemo(() => groupByCategory(items, productsById), [items, productsById])

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
      <PriceOnlyGroupedList
        groups={allGroups}
        productsById={productsById}
        onChangePrice={onChangePrice}
        onChangePriceMode={onChangePriceMode}
      />
    )
  }

  if (readOnly) {
    return <ReadOnlyGroupedList groups={allGroups} />
  }

  return (
    <div className="space-y-6">
      <PendingItemsList
        groups={pendingGroups}
        productsById={productsById}
        onToggle={onToggle}
        onRemove={onRemove}
        onChangeQuantity={onChangeQuantity}
        onChangePrice={onChangePrice}
        onChangePriceMode={onChangePriceMode}
      />

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
            <CheckedItemsList
              groups={checkedGroups}
              productsById={productsById}
              onToggle={onToggle}
              onRemove={onRemove}
              onChangeQuantity={onChangeQuantity}
              onChangePrice={onChangePrice}
              onChangePriceMode={onChangePriceMode}
            />
          )}
        </div>
      )}
    </div>
  )
}

type ItemHandlers = {
  productsById: Map<string, ProductDTO>
  onToggle: (item: ShoppingListItemDTO) => void
  onRemove: (itemId: string) => void
  onChangeQuantity: (item: ShoppingListItemDTO, nextQuantity: number) => void
  onChangePrice: (item: ShoppingListItemDTO, nextPrice: number | null) => void
  onChangePriceMode: (item: ShoppingListItemDTO, nextPriceMode: PriceModeDTO) => void
}

function PendingItemsList({
  groups,
  productsById,
  onToggle,
  onRemove,
  onChangeQuantity,
  onChangePrice,
  onChangePriceMode,
}: { groups: CategoryGroup[] } & ItemHandlers) {
  if (groups.length === 0) {
    return (
      <ul className="overflow-hidden rounded-2xl bg-card ring-1 ring-border/70">
        <li className="px-4 py-8 text-center text-sm text-muted-foreground">Tudo comprado! 🎉</li>
      </ul>
    )
  }

  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <CategorySection key={group.category} category={group.category}>
          <ItemRowList
            items={group.items}
            productsById={productsById}
            onToggle={onToggle}
            onRemove={onRemove}
            onChangeQuantity={onChangeQuantity}
            onChangePrice={onChangePrice}
            onChangePriceMode={onChangePriceMode}
          />
        </CategorySection>
      ))}
    </div>
  )
}

function CheckedItemsList({
  groups,
  productsById,
  onToggle,
  onRemove,
  onChangeQuantity,
  onChangePrice,
  onChangePriceMode,
}: { groups: CategoryGroup[] } & ItemHandlers) {
  if (groups.length === 1) {
    return (
      <ItemRowList
        items={groups[0].items}
        productsById={productsById}
        onToggle={onToggle}
        onRemove={onRemove}
        onChangeQuantity={onChangeQuantity}
        onChangePrice={onChangePrice}
        onChangePriceMode={onChangePriceMode}
      />
    )
  }

  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <CategorySection key={group.category} category={group.category}>
          <ItemRowList
            items={group.items}
            productsById={productsById}
            onToggle={onToggle}
            onRemove={onRemove}
            onChangeQuantity={onChangeQuantity}
            onChangePrice={onChangePrice}
            onChangePriceMode={onChangePriceMode}
          />
        </CategorySection>
      ))}
    </div>
  )
}

function PriceOnlyGroupedList({
  groups,
  productsById,
  onChangePrice,
  onChangePriceMode,
}: {
  groups: CategoryGroup[]
  productsById: Map<string, ProductDTO>
  onChangePrice: (item: ShoppingListItemDTO, nextPrice: number | null) => void
  onChangePriceMode: (item: ShoppingListItemDTO, nextPriceMode: PriceModeDTO) => void
}) {
  if (groups.length === 1) {
    return (
      <ul className="overflow-hidden rounded-2xl bg-card ring-1 ring-border/70">
        {groups[0].items.map((item) => (
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

  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <CategorySection key={group.category} category={group.category}>
          <ul className="overflow-hidden rounded-2xl bg-card ring-1 ring-border/70">
            {group.items.map((item) => (
              <PriceOnlyItemRow
                key={item.id}
                item={item}
                product={productsById.get(item.productId)}
                onChangePrice={onChangePrice}
                onChangePriceMode={onChangePriceMode}
              />
            ))}
          </ul>
        </CategorySection>
      ))}
    </div>
  )
}

function ReadOnlyGroupedList({ groups }: { groups: CategoryGroup[] }) {
  if (groups.length === 1) {
    return (
      <ul className="overflow-hidden rounded-2xl bg-card ring-1 ring-border/70">
        {groups[0].items.map((item) => (
          <ReadOnlyItemRow key={item.id} item={item} />
        ))}
      </ul>
    )
  }

  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <CategorySection key={group.category} category={group.category}>
          <ul className="overflow-hidden rounded-2xl bg-card ring-1 ring-border/70">
            {group.items.map((item) => (
              <ReadOnlyItemRow key={item.id} item={item} />
            ))}
          </ul>
        </CategorySection>
      ))}
    </div>
  )
}

function CategorySection({ category, children }: { category: string; children: ReactNode }) {
  return (
    <section className="space-y-2">
      <h2 className="text-section-label flex items-center gap-2 px-1">
        <span aria-hidden>{categoryEmoji(category)}</span>
        {category}
      </h2>
      {children}
    </section>
  )
}

function ItemRowList({
  items,
  productsById,
  onToggle,
  onRemove,
  onChangeQuantity,
  onChangePrice,
  onChangePriceMode,
}: { items: ShoppingListItemDTO[] } & ItemHandlers) {
  return (
    <ul className="overflow-hidden rounded-2xl bg-card ring-1 ring-border/70">
      {items.map((item) => (
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
  const priceLabel = item.priceMode === "TOTAL" ? "valor total" : measure.pricePlaceholder
  const lineTotal = computeLineTotal(item.price, item.quantity, item.priceMode)
  const missingPrice = item.checked && item.price == null

  return (
    <li
      className={cn(
        "flex flex-col gap-2 border-b px-4 py-3 last:border-b-0",
        missingPrice && "border-l-2 border-l-warning bg-warning/5",
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
            "min-w-0 flex-1 break-words text-[0.95rem]",
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

      {missingPrice && <p className="pl-8 text-xs font-medium text-warning">Sem preço</p>}

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
          "min-w-0 flex-1 break-words text-[0.95rem]",
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
