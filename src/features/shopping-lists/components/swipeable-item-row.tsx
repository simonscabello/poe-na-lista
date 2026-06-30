"use client"

import { Check, RotateCcw, Trash2 } from "lucide-react"
import { type PointerEvent as ReactPointerEvent, useRef, useState } from "react"
import { QuantityStepper } from "@/components/common/quantity-stepper"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { haptic } from "@/lib/haptics"
import { cn } from "@/lib/utils"
import type { ShoppingListItemDTO } from "@/types/domain"

const THRESHOLD = 72 // distance (px) needed to commit a swipe action
const MAX_TRAVEL = 100 // visual clamp so the row never slides fully off

type SwipeableItemRowProps = {
  item: ShoppingListItemDTO
  onToggle: (item: ShoppingListItemDTO) => void
  onRemove: (itemId: string) => void
  onChangeQuantity: (item: ShoppingListItemDTO, nextQuantity: number) => void
}

export function SwipeableItemRow({
  item,
  onToggle,
  onRemove,
  onChangeQuantity,
}: SwipeableItemRowProps) {
  const [dx, setDx] = useState(0)
  const [dragging, setDragging] = useState(false)
  const gesture = useRef<{ x: number; y: number; axis: "x" | "y" | null } | null>(null)
  const crossed = useRef(false)

  function onPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    // Swipe is a touch/pen enhancement; mouse users rely on the visible buttons.
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

  return (
    <li className="relative overflow-hidden border-b last:border-b-0">
      {/* Action hints revealed beneath the row as it slides */}
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

      {/* Foreground: opaque so it hides the action hints at rest */}
      <div
        className={cn(
          "relative flex touch-pan-y items-center gap-3 bg-card px-3 py-3",
          !dragging && "transition-transform duration-200 ease-out",
        )}
        style={{ transform: `translate3d(${dx}px, 0, 0)` }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerEnd}
      >
        <Checkbox
          checked={item.checked}
          onCheckedChange={() => onToggle(item)}
          className="size-6 rounded-full"
          aria-label={item.checked ? `Desmarcar ${item.productName}` : `Marcar ${item.productName}`}
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
              {formatQuantity(item.quantity)}
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
            onAdd={() => onChangeQuantity(item, item.quantity + 1)}
            onRemove={() => onChangeQuantity(item, item.quantity - 1)}
          />
        )}
      </div>
    </li>
  )
}

function formatQuantity(quantity: number): string {
  return Number.isInteger(quantity) ? String(quantity) : quantity.toFixed(2)
}
