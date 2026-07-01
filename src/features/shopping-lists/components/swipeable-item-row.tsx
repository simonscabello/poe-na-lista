"use client"

import { Check, RotateCcw, Trash2 } from "lucide-react"
import { type PointerEvent as ReactPointerEvent, useEffect, useRef, useState } from "react"
import { QuantityStepper } from "@/components/common/quantity-stepper"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { formatCurrency } from "@/lib/format-currency"
import { haptic } from "@/lib/haptics"
import {
  formatQuantity,
  getMeasureConfigForItem,
  nextQuantityDown,
  nextQuantityUp,
} from "@/lib/measure"
import { computeLineTotal } from "@/lib/pricing"
import { cn } from "@/lib/utils"
import type { PriceModeDTO, ProductDTO, ShoppingListItemDTO } from "@/types/domain"

const THRESHOLD = 72
const MAX_TRAVEL = 100

type SwipeableItemRowProps = {
  item: ShoppingListItemDTO
  product?: ProductDTO
  onToggle: (item: ShoppingListItemDTO) => void
  onRemove: (itemId: string) => void
  onChangeQuantity: (item: ShoppingListItemDTO, nextQuantity: number) => void
  onChangePrice: (item: ShoppingListItemDTO, nextPrice: number | null) => void
  onChangePriceMode: (item: ShoppingListItemDTO, nextPriceMode: PriceModeDTO) => void
}

export function SwipeableItemRow({
  item,
  product,
  onToggle,
  onRemove,
  onChangeQuantity,
  onChangePrice,
  onChangePriceMode,
}: SwipeableItemRowProps) {
  const [dx, setDx] = useState(0)
  const [dragging, setDragging] = useState(false)
  const gesture = useRef<{ x: number; y: number; axis: "x" | "y" | null } | null>(null)
  const crossed = useRef(false)

  const [priceInput, setPriceInput] = useState(item.price != null ? String(item.price) : "")
  const priceRef = useRef<HTMLInputElement>(null)
  const wasChecked = useRef(item.checked)

  const measure = getMeasureConfigForItem(product, item.unit)
  const unitLabel = item.unit || "un"
  const priceLabel = item.priceMode === "TOTAL" ? "preço total" : measure.pricePlaceholder
  const lineTotal = computeLineTotal(item.price, item.quantity, item.priceMode)

  useEffect(() => {
    setPriceInput(item.price != null ? String(item.price) : "")
  }, [item.price])

  useEffect(() => {
    if (item.checked && !wasChecked.current) {
      priceRef.current?.focus()
    }
    wasChecked.current = item.checked
  }, [item.checked])

  function commitPrice() {
    const trimmed = priceInput.trim().replace(",", ".")
    const next = trimmed === "" ? null : Number(trimmed)
    if (next != null && (Number.isNaN(next) || next < 0)) {
      setPriceInput(item.price != null ? String(item.price) : "")
      return
    }
    if (next === item.price) return
    onChangePrice(item, next)
  }

  function onPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.pointerType === "mouse") return
    gesture.current = { x: event.clientX, y: event.clientY, axis: null }
    setDragging(true)
  }

  function onPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    const g = gesture.current
    if (!g) return
    const moveX = event.clientX - g.x
    const moveY = event.clientY - g.y

    if (g.axis === null) {
      if (Math.abs(moveX) < 6 && Math.abs(moveY) < 6) return
      g.axis = Math.abs(moveX) > Math.abs(moveY) ? "x" : "y"
      if (g.axis === "x") {
        try {
          event.currentTarget.setPointerCapture(event.pointerId)
        } catch {
          // capture is best-effort
        }
      }
    }
    if (g.axis !== "x") return

    const clamped = Math.max(-MAX_TRAVEL, Math.min(MAX_TRAVEL, moveX))
    setDx(clamped)

    const isCrossed = Math.abs(clamped) >= THRESHOLD
    if (isCrossed && !crossed.current) {
      crossed.current = true
      haptic("tap")
    } else if (!isCrossed) {
      crossed.current = false
    }
  }

  function onPointerEnd() {
    const axis = gesture.current?.axis
    const committed = dx
    gesture.current = null
    crossed.current = false
    setDragging(false)
    setDx(0)

    if (axis !== "x") return
    if (committed <= -THRESHOLD) {
      onRemove(item.id)
    } else if (committed >= THRESHOLD) {
      onToggle(item)
    }
  }

  function decrementQuantity() {
    const next = nextQuantityDown(item.quantity, measure.step, measure.minQuantity)
    if (next == null) {
      onRemove(item.id)
      return
    }
    onChangeQuantity(item, next)
  }

  function incrementQuantity() {
    onChangeQuantity(item, nextQuantityUp(item.quantity, measure.step))
  }

  return (
    <li className="relative overflow-hidden border-b last:border-b-0">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 flex items-center justify-between px-6"
      >
        <span
          className={cn(
            "flex items-center text-primary transition-opacity duration-150",
            dx > 4 ? "opacity-100" : "opacity-0",
          )}
        >
          {item.checked ? <RotateCcw className="size-5" /> : <Check className="size-5" />}
        </span>
        <span
          className={cn(
            "flex items-center text-destructive transition-opacity duration-150",
            dx < -4 ? "opacity-100" : "opacity-0",
          )}
        >
          <Trash2 className="size-5" />
        </span>
      </div>

      <div
        className={cn(
          "relative flex touch-pan-y flex-col gap-2 bg-card px-3 py-3",
          !dragging && "transition-transform duration-200 ease-out",
        )}
        style={{ transform: `translate3d(${dx}px, 0, 0)` }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerEnd}
      >
        <div className="flex items-center gap-3">
          <Checkbox
            checked={item.checked}
            onCheckedChange={() => onToggle(item)}
            className="size-6 rounded-full"
            aria-label={
              item.checked ? `Desmarcar ${item.productName}` : `Marcar ${item.productName}`
            }
          />
          <button
            type="button"
            className="min-w-0 flex-1 py-1 text-left"
            onClick={() => onToggle(item)}
          >
            <span
              className={cn(
                "block truncate text-[0.95rem] transition-colors duration-200",
                item.checked && "text-muted-foreground line-through decoration-muted-foreground/50",
              )}
            >
              {item.productName}
            </span>
            {(item.unit || item.category) && (
              <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                {item.unit ? item.unit : ""}
                {item.unit && item.category ? " · " : ""}
                {item.category ?? ""}
              </span>
            )}
          </button>

          {item.checked ? (
            <>
              <span className="shrink-0 text-sm text-muted-foreground tabular-nums">
                {formatQuantity(item.quantity, item.unit)}
              </span>
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Remover ${item.productName}`}
                onClick={() => onRemove(item.id)}
                className="text-muted-foreground transition-colors hover:text-destructive"
              >
                <Trash2 className="size-4" />
              </Button>
            </>
          ) : (
            <QuantityStepper
              count={item.quantity}
              name={item.productName}
              size="md"
              step={measure.step}
              formatValue={(value) => formatQuantity(value, item.unit)}
              onAdd={incrementQuantity}
              onRemove={decrementQuantity}
            />
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 pl-9">
          <div className="relative">
            <span className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-2.5 text-xs text-muted-foreground">
              R$
            </span>
            <input
              ref={priceRef}
              type="number"
              inputMode="decimal"
              step="0.01"
              min={0}
              placeholder={priceLabel}
              aria-label={`${priceLabel} de ${item.productName}`}
              value={priceInput}
              onChange={(event) => setPriceInput(event.target.value)}
              onBlur={commitPrice}
              onKeyDown={(event) => {
                if (event.key === "Enter") event.currentTarget.blur()
              }}
              onPointerDown={(event) => event.stopPropagation()}
              className="h-8 w-28 rounded-lg border border-input bg-background pr-2 pl-8 text-sm tabular-nums outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            />
          </div>

          <div
            className="flex shrink-0 items-center gap-0.5 rounded-full bg-muted p-0.5 text-[0.7rem] font-medium"
            onPointerDown={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => onChangePriceMode(item, "UNIT")}
              aria-pressed={item.priceMode === "UNIT"}
              className={cn(
                "rounded-full px-2 py-1 transition-colors",
                item.priceMode === "UNIT"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground",
              )}
            >
              /{unitLabel}
            </button>
            <button
              type="button"
              onClick={() => onChangePriceMode(item, "TOTAL")}
              aria-pressed={item.priceMode === "TOTAL"}
              className={cn(
                "rounded-full px-2 py-1 transition-colors",
                item.priceMode === "TOTAL"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground",
              )}
            >
              total
            </button>
          </div>

          {item.priceMode === "UNIT" && lineTotal != null && lineTotal > 0 && (
            <span className="text-xs text-muted-foreground tabular-nums">
              = {formatCurrency(lineTotal)}
            </span>
          )}
        </div>
      </div>
    </li>
  )
}
