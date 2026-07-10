"use client"

import { useAtom } from "jotai"
import { Check, ChevronDown, ListChecks } from "lucide-react"
import { type ReactNode, useMemo } from "react"
import { EmptyState } from "@/components/common/empty-state"
import { ItemPriceFields } from "@/features/shopping-lists/components/item-price-fields"
import { ListItemsSortBar } from "@/features/shopping-lists/components/list-items-sort-bar"
import { SwipeableItemRow } from "@/features/shopping-lists/components/swipeable-item-row"
import {
  type CategoryGroup,
  groupByCategory,
  sortAlphabetically,
} from "@/features/shopping-lists/lib/sort-list-items"
import { hideCheckedItemsAtom, listItemsSortModeAtom, marketModeAtom } from "@/lib/atoms"
import { categoryEmoji } from "@/lib/categories"
import { formatCurrency } from "@/lib/format-currency"
import { formatQuantity, getMeasureConfigForItem } from "@/lib/measure"
import { computeLineTotal } from "@/lib/pricing"
import { cn } from "@/lib/utils"
import type { PriceModeDTO, ProductDTO, ShoppingListItemDTO } from "@/types/domain"

type ListItemsProps = {
  items: ShoppingListItemDTO[]
  productsById: Map<string, ProductDTO>
  autoFilledIds?: Set<string>
  onToggle: (item: ShoppingListItemDTO) => void
  onRemove: (itemId: string) => void
  onChangeQuantity: (item: ShoppingListItemDTO, nextQuantity: number) => void
  onChangePrice: (item: ShoppingListItemDTO, nextPrice: number | null) => void
  onChangePriceMode: (item: ShoppingListItemDTO, nextPriceMode: PriceModeDTO) => void
  readOnly?: boolean
  priceOnly?: boolean
}

const EMPTY_AUTO_FILLED = new Set<string>()

export function ListItems({
  items,
  productsById,
  autoFilledIds = EMPTY_AUTO_FILLED,
  onToggle,
  onRemove,
  onChangeQuantity,
  onChangePrice,
  onChangePriceMode,
  readOnly = false,
  priceOnly = false,
}: ListItemsProps) {
  const [hideChecked, setHideChecked] = useAtom(hideCheckedItemsAtom)
  const [storedSortMode] = useAtom(listItemsSortModeAtom)
  const [marketMode] = useAtom(marketModeAtom)

  // Modo mercado só vale na lista interativa e força o agrupamento por categoria.
  const marketActive = marketMode && !readOnly && !priceOnly
  const sortMode = marketActive ? "category" : storedSortMode

  const pending = useMemo(() => items.filter((item) => !item.checked), [items])
  const checked = useMemo(() => items.filter((item) => item.checked), [items])

  const sortedPending = useMemo(() => {
    if (sortMode === "alphabetical") return sortAlphabetically(pending)
    return groupByCategory(pending, productsById)
  }, [pending, sortMode, productsById])

  const sortedChecked = useMemo(() => {
    if (sortMode === "alphabetical") return sortAlphabetically(checked)
    return groupByCategory(checked, productsById)
  }, [checked, sortMode, productsById])

  const sortedAll = useMemo(() => {
    const all = [...pending, ...checked]
    if (sortMode === "alphabetical") return sortAlphabetically(all)
    return groupByCategory(all, productsById)
  }, [pending, checked, sortMode, productsById])

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
      <div className="space-y-4">
        <ListItemsSortBar itemCount={items.length} />
        <SortedPriceOnlyList
          sorted={sortedAll}
          sortMode={sortMode}
          productsById={productsById}
          onChangePrice={onChangePrice}
          onChangePriceMode={onChangePriceMode}
        />
      </div>
    )
  }

  if (readOnly) {
    return <SortedReadOnlyList sorted={sortedAll} sortMode={sortMode} />
  }

  return (
    <div className="space-y-4">
      <ListItemsSortBar itemCount={items.length} showMarketToggle />

      <div className="space-y-6">
        <PendingItemsList
          sorted={sortedPending}
          sortMode={sortMode}
          productsById={productsById}
          autoFilledIds={autoFilledIds}
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
                sorted={sortedChecked}
                sortMode={sortMode}
                productsById={productsById}
                autoFilledIds={autoFilledIds}
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
    </div>
  )
}

type ItemHandlers = {
  productsById: Map<string, ProductDTO>
  autoFilledIds: Set<string>
  onToggle: (item: ShoppingListItemDTO) => void
  onRemove: (itemId: string) => void
  onChangeQuantity: (item: ShoppingListItemDTO, nextQuantity: number) => void
  onChangePrice: (item: ShoppingListItemDTO, nextPrice: number | null) => void
  onChangePriceMode: (item: ShoppingListItemDTO, nextPriceMode: PriceModeDTO) => void
}

type SortedProps<T> = {
  sorted: T
  sortMode: "alphabetical" | "category"
}

function PendingItemsList({
  sorted,
  sortMode,
  productsById,
  autoFilledIds,
  onToggle,
  onRemove,
  onChangeQuantity,
  onChangePrice,
  onChangePriceMode,
}: SortedProps<ShoppingListItemDTO[] | CategoryGroup[]> & ItemHandlers) {
  if (sortMode === "alphabetical") {
    const items = sorted as ShoppingListItemDTO[]
    if (items.length === 0) {
      return (
        <ul className="overflow-hidden rounded-2xl bg-card ring-1 ring-border/70">
          <li className="px-4 py-8 text-center text-sm text-muted-foreground">Tudo comprado! 🎉</li>
        </ul>
      )
    }
    return (
      <ItemRowList
        items={items}
        productsById={productsById}
        autoFilledIds={autoFilledIds}
        onToggle={onToggle}
        onRemove={onRemove}
        onChangeQuantity={onChangeQuantity}
        onChangePrice={onChangePrice}
        onChangePriceMode={onChangePriceMode}
      />
    )
  }

  const groups = sorted as CategoryGroup[]
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
            autoFilledIds={autoFilledIds}
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
  sorted,
  sortMode,
  productsById,
  autoFilledIds,
  onToggle,
  onRemove,
  onChangeQuantity,
  onChangePrice,
  onChangePriceMode,
}: SortedProps<ShoppingListItemDTO[] | CategoryGroup[]> & ItemHandlers) {
  if (sortMode === "alphabetical") {
    return (
      <ItemRowList
        items={sorted as ShoppingListItemDTO[]}
        productsById={productsById}
        autoFilledIds={autoFilledIds}
        onToggle={onToggle}
        onRemove={onRemove}
        onChangeQuantity={onChangeQuantity}
        onChangePrice={onChangePrice}
        onChangePriceMode={onChangePriceMode}
      />
    )
  }

  const groups = sorted as CategoryGroup[]
  if (groups.length === 1) {
    return (
      <ItemRowList
        items={groups[0].items}
        productsById={productsById}
        autoFilledIds={autoFilledIds}
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
            autoFilledIds={autoFilledIds}
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

function SortedPriceOnlyList({
  sorted,
  sortMode,
  productsById,
  onChangePrice,
  onChangePriceMode,
}: SortedProps<ShoppingListItemDTO[] | CategoryGroup[]> & {
  productsById: Map<string, ProductDTO>
  onChangePrice: (item: ShoppingListItemDTO, nextPrice: number | null) => void
  onChangePriceMode: (item: ShoppingListItemDTO, nextPriceMode: PriceModeDTO) => void
}) {
  if (sortMode === "alphabetical") {
    return (
      <ul className="overflow-hidden rounded-2xl bg-card ring-1 ring-border/70">
        {(sorted as ShoppingListItemDTO[]).map((item) => (
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

  const groups = sorted as CategoryGroup[]
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

function SortedReadOnlyList({
  sorted,
  sortMode,
}: SortedProps<ShoppingListItemDTO[] | CategoryGroup[]>) {
  if (sortMode === "alphabetical") {
    return (
      <ul className="overflow-hidden rounded-2xl bg-card ring-1 ring-border/70">
        {(sorted as ShoppingListItemDTO[]).map((item) => (
          <ReadOnlyItemRow key={item.id} item={item} />
        ))}
      </ul>
    )
  }

  const groups = sorted as CategoryGroup[]
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
  autoFilledIds,
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
          autoFilledPrice={autoFilledIds.has(item.id)}
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
