"use client"

import { useAtomValue } from "jotai"
import { Calculator, CheckCircle2, ShoppingBag } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCallback, useMemo, useOptimistic, useState, useTransition } from "react"
import { toast } from "sonner"
import { duplicateListAction, getListVersionAction } from "@/actions/shopping-list.actions"
import {
  addItemAction,
  removeItemAction,
  toggleItemAction,
  updateItemPriceAction,
  updateItemQuantityAction,
} from "@/actions/shopping-list-item.actions"
import { Container } from "@/components/layout/container"
import { Button } from "@/components/ui/button"
import { FinalizePurchaseSheet } from "@/features/expenses/components/finalize-purchase-sheet"
import { ShareListSheet } from "@/features/list-sharing/components/share-list-sheet"
import { AddMeasurableProductSheet } from "@/features/shopping-lists/components/add-measurable-product-sheet"
import { AddProductsBar } from "@/features/shopping-lists/components/add-products-bar"
import { ListHeader } from "@/features/shopping-lists/components/list-header"
import { ListItems } from "@/features/shopping-lists/components/list-items"
import { MarketModeFooter } from "@/features/shopping-lists/components/market-mode-footer"
import { useListSync } from "@/hooks/use-list-sync"
import { marketModeAtom } from "@/lib/atoms"
import { formatCalendarDate } from "@/lib/calendar-date"
import { formatCurrency } from "@/lib/format-currency"
import { haptic } from "@/lib/haptics"
import {
  getMeasureConfig,
  getMeasureConfigForItem,
  isMeasurableProduct,
  itemsMatchForMerge,
  nextQuantityDown,
  nextQuantityUp,
} from "@/lib/measure"
import { computeLineTotal, estimateItemsTotal } from "@/lib/pricing"
import type {
  CategoryDTO,
  LastPriceDTO,
  PriceModeDTO,
  ProductDTO,
  ShoppingListDetail,
  ShoppingListItemDTO,
  ShoppingListShareDTO,
  StoreDTO,
} from "@/types/domain"

type OptimisticAction =
  | { type: "toggle"; id: string; checked: boolean }
  | { type: "remove"; id: string }
  | { type: "setQty"; id: string; quantity: number }
  | { type: "setPrice"; id: string; price: number | null }
  | { type: "setPriceMode"; id: string; priceMode: PriceModeDTO }
  | {
      type: "add"
      product: ProductDTO
      quantity: number
      unit: string | null
      priceMode: PriceModeDTO
    }

function reducer(state: ShoppingListItemDTO[], action: OptimisticAction): ShoppingListItemDTO[] {
  switch (action.type) {
    case "toggle":
      return state.map((item) =>
        item.id === action.id ? { ...item, checked: action.checked } : item,
      )
    case "remove":
      return state.filter((item) => item.id !== action.id)
    case "setQty":
      return state.map((item) =>
        item.id === action.id ? { ...item, quantity: action.quantity } : item,
      )
    case "setPrice":
      return state.map((item) => (item.id === action.id ? { ...item, price: action.price } : item))
    case "setPriceMode":
      return state.map((item) =>
        item.id === action.id ? { ...item, priceMode: action.priceMode } : item,
      )
    case "add": {
      const index = state.findIndex((item) =>
        itemsMatchForMerge(item.productId, item.unit, action.product.id, action.unit),
      )
      if (index >= 0) {
        return state.map((item, i) =>
          i === index
            ? { ...item, quantity: item.quantity + action.quantity, checked: false }
            : item,
        )
      }
      return [
        ...state,
        {
          id: `temp-${action.product.id}-${Date.now()}`,
          productId: action.product.id,
          productName: action.product.name,
          category: action.product.categoryName,
          quantity: action.quantity,
          unit: action.unit,
          checked: false,
          notes: null,
          price: null,
          priceMode: action.priceMode,
        },
      ]
    }
  }
}

type ListViewProps = {
  list: ShoppingListDetail
  catalog: ProductDTO[]
  frequent: ProductDTO[]
  categories: CategoryDTO[]
  initialShare: ShoppingListShareDTO | null
  stores: StoreDTO[]
  lastPrices: Record<string, LastPriceDTO>
  lastStoreName: string | null
}

export function ListView({
  list,
  catalog,
  frequent,
  categories,
  initialShare,
  stores,
  lastPrices,
  lastStoreName,
}: ListViewProps) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [isBuyingAgain, startBuyAgainTransition] = useTransition()
  const [items, applyOptimistic] = useOptimistic(list.items, reducer)
  const [shareOpen, setShareOpen] = useState(false)
  const [finalizeOpen, setFinalizeOpen] = useState(false)
  const [measurableProduct, setMeasurableProduct] = useState<ProductDTO | null>(null)
  const [autoFilledIds, setAutoFilledIds] = useState<Set<string>>(new Set())

  const productsById = useMemo(
    () => new Map(catalog.map((product) => [product.id, product])),
    [catalog],
  )

  // Mudanças de outros membros (ou do link público) aparecem sem recarregar.
  useListSync(
    useCallback(async () => {
      const result = await getListVersionAction(list.id)
      return result.success ? result.data.version : null
    }, [list.id]),
  )

  const isCompleted = list.status === "COMPLETED"
  const checkedCount = items.filter((item) => item.checked).length
  const unpricedCheckedCount = items.filter((item) => item.checked && item.price == null).length
  const allChecked = items.length > 0 && checkedCount === items.length
  const checkedItemsTotal = items
    .filter((item) => item.checked)
    .reduce(
      (sum, item) => sum + (computeLineTotal(item.price, item.quantity, item.priceMode) ?? 0),
      0,
    )

  const marketMode = useAtomValue(marketModeAtom)
  const lastUnitPriceOf = useCallback(
    (productId: string) => lastPrices[productId]?.unitPrice,
    [lastPrices],
  )
  // Estimativas pelos preços informados + últimos preços pagos: da lista toda
  // (planejamento antes do mercado) e do que ainda falta (modo mercado).
  const listEstimate = estimateItemsTotal(items, lastUnitPriceOf)
  const remaining = estimateItemsTotal(
    items.filter((item) => !item.checked),
    lastUnitPriceOf,
  )

  const inList = new Map<string, number>()
  for (const item of items) {
    inList.set(item.productId, (inList.get(item.productId) ?? 0) + item.quantity)
  }

  function toggle(item: ShoppingListItemDTO) {
    const willCheck = !item.checked
    // Espelha o prefill do último preço feito pelo servidor no toggleItemAction.
    const prefillPrice =
      willCheck && item.price == null && item.priceMode === "UNIT"
        ? (lastPrices[item.productId]?.unitPrice ?? null)
        : null
    startTransition(async () => {
      haptic("tap")
      applyOptimistic({ type: "toggle", id: item.id, checked: willCheck })
      if (prefillPrice != null) {
        applyOptimistic({ type: "setPrice", id: item.id, price: prefillPrice })
        setAutoFilledIds((prev) => new Set(prev).add(item.id))
      }
      const result = await toggleItemAction(item.id, willCheck)
      if (!result.success) {
        toast.error(result.error)
        return
      }
      router.refresh()
    })
  }

  function remove(itemId: string) {
    const removed = items.find((item) => item.id === itemId)
    startTransition(async () => {
      haptic("remove")
      applyOptimistic({ type: "remove", id: itemId })
      const result = await removeItemAction(itemId)
      if (!result.success) {
        toast.error(result.error)
        return
      }
      if (removed) {
        toast(`${removed.productName} removido`, {
          action: { label: "Desfazer", onClick: () => restoreItem(removed) },
        })
      }
      router.refresh()
    })
  }

  /** Desfaz uma remoção re-adicionando o item (volta desmarcado e sem preço). */
  function restoreItem(item: ShoppingListItemDTO) {
    const product = productsById.get(item.productId)
    startTransition(async () => {
      if (product) {
        applyOptimistic({
          type: "add",
          product,
          quantity: item.quantity,
          unit: item.unit,
          priceMode: item.priceMode,
        })
      }
      const result = await addItemAction(list.id, {
        productId: item.productId,
        quantity: item.quantity,
        unit: item.unit ?? "",
        notes: item.notes ?? "",
        priceMode: item.priceMode,
      })
      if (!result.success) {
        toast.error(result.error)
        return
      }
      router.refresh()
    })
  }

  function addItem(product: ProductDTO, quantity: number) {
    const unit = isMeasurableProduct(product) ? product.defaultUnit : null
    const priceMode: PriceModeDTO = product.pricedByWeight ? "TOTAL" : "UNIT"
    startTransition(async () => {
      applyOptimistic({ type: "add", product, quantity, unit, priceMode })
      const result = await addItemAction(list.id, {
        productId: product.id,
        quantity,
        unit: unit ?? "",
        notes: "",
        priceMode,
      })
      if (!result.success) {
        toast.error(result.error)
        return
      }
      router.refresh()
    })
  }

  /** Recomeça a mesma compra: duplica a lista finalizada com tudo desmarcado. */
  function buyAgain() {
    startBuyAgainTransition(async () => {
      const result = await duplicateListAction(list.id)
      if (!result.success) {
        toast.error(result.error)
        return
      }
      toast.success("Nova lista criada com os mesmos itens")
      router.push(`/dashboard/lists/${result.data.id}`)
    })
  }

  function requestAdd(product: ProductDTO) {
    if (isMeasurableProduct(product)) {
      setMeasurableProduct(product)
      return
    }
    addItem(product, 1)
  }

  function confirmMeasurable(product: ProductDTO, quantity: number) {
    addItem(product, quantity)
  }

  function findListItem(product: ProductDTO): ShoppingListItemDTO | undefined {
    const unit = isMeasurableProduct(product) ? product.defaultUnit : null
    return items.find((item) => itemsMatchForMerge(item.productId, item.unit, product.id, unit))
  }

  function removeOne(product: ProductDTO) {
    const item = findListItem(product)
    if (!item) return

    const productMeta = productsById.get(product.id) ?? product
    const config = getMeasureConfig(productMeta)
    const next = isMeasurableProduct(productMeta)
      ? nextQuantityDown(item.quantity, config.step, config.minQuantity)
      : item.quantity - 1

    if (next == null || next < config.minQuantity) {
      remove(item.id)
      return
    }
    changeQuantity(item, next)
  }

  function addOne(product: ProductDTO) {
    if (isMeasurableProduct(product)) {
      const item = findListItem(product)
      const config = getMeasureConfig(product)
      if (item) {
        changeQuantity(item, nextQuantityUp(item.quantity, config.step))
        return
      }
      setMeasurableProduct(product)
      return
    }
    addItem(product, 1)
  }

  function changePrice(item: ShoppingListItemDTO, nextPrice: number | null) {
    setAutoFilledIds((prev) => {
      if (!prev.has(item.id)) return prev
      const next = new Set(prev)
      next.delete(item.id)
      return next
    })
    startTransition(async () => {
      applyOptimistic({ type: "setPrice", id: item.id, price: nextPrice })
      const result = await updateItemPriceAction(item.id, {
        price: nextPrice,
        priceMode: item.priceMode,
      })
      if (!result.success) {
        toast.error(result.error)
        return
      }
      router.refresh()
    })
  }

  function changePriceMode(item: ShoppingListItemDTO, nextPriceMode: PriceModeDTO) {
    startTransition(async () => {
      applyOptimistic({ type: "setPriceMode", id: item.id, priceMode: nextPriceMode })
      const result = await updateItemPriceAction(item.id, {
        price: item.price,
        priceMode: nextPriceMode,
      })
      if (!result.success) {
        toast.error(result.error)
        return
      }
      router.refresh()
    })
  }

  function changeQuantity(item: ShoppingListItemDTO, nextQuantity: number) {
    const product = productsById.get(item.productId)
    const config = getMeasureConfigForItem(product, item.unit)
    if (nextQuantity < config.minQuantity) {
      remove(item.id)
      return
    }
    startTransition(async () => {
      haptic("tap")
      applyOptimistic({ type: "setQty", id: item.id, quantity: nextQuantity })
      const result = await updateItemQuantityAction(item.id, nextQuantity, item.unit)
      if (!result.success) {
        toast.error(result.error)
        return
      }
      router.refresh()
    })
  }

  return (
    <div className="flex min-h-[calc(100dvh-3.5rem)] flex-col">
      <Container size="wide" className="flex-1 space-y-4 py-4">
        <ListHeader
          listId={list.id}
          name={list.name}
          canNudge={!isCompleted}
          onShare={() => setShareOpen(true)}
        />

        {isCompleted && (
          <div className="space-y-1.5 rounded-xl bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-400">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-4 shrink-0" />
              <span className="min-w-0 font-medium">
                {list.latestPurchase?.storeName
                  ? `Comprada no ${list.latestPurchase.storeName}`
                  : "Compra finalizada"}
                {list.latestPurchase &&
                  ` · ${formatCalendarDate(list.latestPurchase.purchasedAt)} · ${formatCurrency(list.latestPurchase.totalAmount)}`}
              </span>
            </div>
            {unpricedCheckedCount > 0 && (
              <p className="pl-6 text-xs">
                Informe os preços dos produtos pesados no caixa.{" "}
                {`${unpricedCheckedCount} ${unpricedCheckedCount === 1 ? "produto ainda" : "produtos ainda"} sem preço.`}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-4 pl-6">
              {list.latestPurchase && (
                <Link
                  href={`/dashboard/expenses/${list.latestPurchase.id}`}
                  className="text-xs font-medium underline underline-offset-2"
                >
                  Ver em Gastos
                </Link>
              )}
              <button
                type="button"
                onClick={buyAgain}
                disabled={isBuyingAgain}
                className="text-xs font-medium underline underline-offset-2 disabled:opacity-50"
              >
                Comprar de novo
              </button>
            </div>
          </div>
        )}

        {!isCompleted && items.length > 0 && !marketMode && listEstimate.total > 0 && (
          <div className="flex items-center justify-between gap-3 rounded-2xl bg-card px-4 py-3 ring-1 ring-border/70">
            <span className="flex items-center gap-2.5 text-sm text-muted-foreground">
              <Calculator className="size-4 shrink-0 text-primary" />
              <span>
                Estimativa da compra
                <span className="block text-xs">pelos últimos preços que você pagou</span>
              </span>
            </span>
            <span className="shrink-0 text-right">
              <span className="font-heading text-base font-semibold tabular-nums">
                ~{formatCurrency(listEstimate.total)}
              </span>
              {listEstimate.unknownCount > 0 && (
                <span className="block text-xs text-muted-foreground tabular-nums">
                  {listEstimate.unknownCount}{" "}
                  {listEstimate.unknownCount === 1 ? "item sem referência" : "itens sem referência"}
                </span>
              )}
            </span>
          </div>
        )}

        <ListItems
          items={items}
          productsById={productsById}
          autoFilledIds={autoFilledIds}
          lastPrices={lastPrices}
          onToggle={toggle}
          onRemove={remove}
          onChangeQuantity={changeQuantity}
          onChangePrice={changePrice}
          onChangePriceMode={changePriceMode}
          priceOnly={isCompleted}
        />

        {!isCompleted && items.length > 0 && (
          <Button
            variant={allChecked ? "default" : "outline"}
            className="w-full"
            disabled={checkedCount === 0}
            onClick={() => setFinalizeOpen(true)}
          >
            <ShoppingBag className="size-4" />
            Finalizar compra
            {checkedItemsTotal > 0 && (
              <span className="tabular-nums">
                {" · "}
                {formatCurrency(checkedItemsTotal)}
              </span>
            )}
          </Button>
        )}
      </Container>

      {!isCompleted && (
        <AddProductsBar
          householdId={list.householdId}
          catalog={catalog}
          frequent={frequent}
          categories={categories}
          inList={inList}
          inlineSlot={
            marketMode && items.length > 0 ? (
              <MarketModeFooter
                checkedCount={checkedCount}
                totalCount={items.length}
                checkedTotal={checkedItemsTotal}
                remainingEstimate={remaining.total}
                remainingUnknownCount={remaining.unknownCount}
              />
            ) : null
          }
          onAdd={requestAdd}
          onAddOne={addOne}
          onRemoveOne={removeOne}
        />
      )}

      <AddMeasurableProductSheet
        product={measurableProduct}
        open={measurableProduct != null}
        onOpenChange={(open) => {
          if (!open) setMeasurableProduct(null)
        }}
        onConfirm={confirmMeasurable}
      />

      <ShareListSheet
        listId={list.id}
        listName={list.name}
        items={items}
        initialShare={initialShare}
        open={shareOpen}
        onOpenChange={setShareOpen}
      />
      <FinalizePurchaseSheet
        listId={list.id}
        listName={list.name}
        items={items}
        stores={stores}
        lastStoreName={lastStoreName}
        open={finalizeOpen}
        onOpenChange={setFinalizeOpen}
      />
    </div>
  )
}
