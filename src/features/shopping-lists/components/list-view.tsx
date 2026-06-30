"use client"

import { useRouter } from "next/navigation"
import { useOptimistic, useTransition } from "react"
import { toast } from "sonner"
import {
  addItemAction,
  removeItemAction,
  toggleItemAction,
  updateItemQuantityAction,
} from "@/actions/shopping-list-item.actions"
import { Container } from "@/components/layout/container"
import { AddProductsBar } from "@/features/shopping-lists/components/add-products-bar"
import { ListHeader } from "@/features/shopping-lists/components/list-header"
import { ListItems } from "@/features/shopping-lists/components/list-items"
import { haptic } from "@/lib/haptics"
import type {
  CategoryDTO,
  ProductDTO,
  ShoppingListDetail,
  ShoppingListItemDTO,
} from "@/types/domain"

type OptimisticAction =
  | { type: "toggle"; id: string; checked: boolean }
  | { type: "remove"; id: string }
  | { type: "setQty"; id: string; quantity: number }
  | { type: "add"; product: ProductDTO; quantity: number }

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
    case "add": {
      // Mirror the server merge rule: same product + no unit increments the existing row.
      const index = state.findIndex(
        (item) => item.productId === action.product.id && (item.unit ?? null) === null,
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
          unit: null,
          checked: false,
          notes: null,
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
}

export function ListView({ list, catalog, frequent, categories }: ListViewProps) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [items, applyOptimistic] = useOptimistic(list.items, reducer)

  // productId → quantity currently in the list, so the catalog sheet can show
  // live "in list" badges and the running counter.
  const inList = new Map<string, number>()
  for (const item of items) {
    inList.set(item.productId, (inList.get(item.productId) ?? 0) + item.quantity)
  }

  function toggle(item: ShoppingListItemDTO) {
    startTransition(async () => {
      haptic("tap")
      applyOptimistic({ type: "toggle", id: item.id, checked: !item.checked })
      const result = await toggleItemAction(item.id, !item.checked)
      if (!result.success) {
        toast.error(result.error)
        return
      }
      router.refresh()
    })
  }

  function remove(itemId: string) {
    startTransition(async () => {
      haptic("remove")
      applyOptimistic({ type: "remove", id: itemId })
      const result = await removeItemAction(itemId)
      if (!result.success) {
        toast.error(result.error)
        return
      }
      router.refresh()
    })
  }

  function add(product: ProductDTO) {
    startTransition(async () => {
      applyOptimistic({ type: "add", product, quantity: 1 })
      const result = await addItemAction(list.id, {
        productId: product.id,
        quantity: 1,
        unit: "",
        notes: "",
      })
      if (!result.success) {
        toast.error(result.error)
        return
      }
      router.refresh()
    })
  }

  // Decrement (or remove) the row matching a product, so the catalog sheet can
  // undo an accidental tap without leaving the screen.
  function removeOne(product: ProductDTO) {
    const item = items.find((i) => i.productId === product.id && (i.unit ?? null) === null)
    if (!item) return
    changeQuantity(item, item.quantity - 1)
  }

  function changeQuantity(item: ShoppingListItemDTO, nextQuantity: number) {
    // Stepping below 1 removes the item — keeps the row's [-] doubling as delete.
    if (nextQuantity < 1) {
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
        <ListHeader listId={list.id} name={list.name} />
        <ListItems
          items={items}
          onToggle={toggle}
          onRemove={remove}
          onChangeQuantity={changeQuantity}
        />
      </Container>
      <AddProductsBar
        householdId={list.householdId}
        catalog={catalog}
        frequent={frequent}
        categories={categories}
        inList={inList}
        onAdd={add}
        onRemoveOne={removeOne}
      />
    </div>
  )
}
