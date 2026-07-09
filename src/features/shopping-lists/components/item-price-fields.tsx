"use client"

import type { PointerEvent, RefObject } from "react"
import { CurrencyInput } from "@/components/common/currency-input"
import { formatCurrency } from "@/lib/format-currency"
import { computeLineTotal } from "@/lib/pricing"
import { cn } from "@/lib/utils"
import type { PriceModeDTO, ShoppingListItemDTO } from "@/types/domain"

type ItemPriceFieldsProps = {
  item: ShoppingListItemDTO
  unitLabel: string
  priceLabel: string
  onChangePrice: (item: ShoppingListItemDTO, nextPrice: number | null) => void
  onChangePriceMode: (item: ShoppingListItemDTO, nextPriceMode: PriceModeDTO) => void
  priceInputRef?: RefObject<HTMLInputElement | null>
  onPointerDown?: (event: PointerEvent) => void
  className?: string
}

export function ItemPriceFields({
  item,
  unitLabel,
  priceLabel,
  onChangePrice,
  onChangePriceMode,
  priceInputRef,
  onPointerDown,
  className,
}: ItemPriceFieldsProps) {
  const lineTotal = computeLineTotal(item.price, item.quantity, item.priceMode)

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <CurrencyInput
        value={item.price}
        onCommit={(nextPrice) => onChangePrice(item, nextPrice)}
        placeholder={priceLabel}
        aria-label={`${priceLabel} de ${item.productName}`}
        inputRef={priceInputRef}
        onPointerDown={onPointerDown}
      />

      <div
        className="flex shrink-0 items-center gap-0.5 rounded-full bg-muted p-0.5 text-[0.7rem] font-medium"
        onPointerDown={onPointerDown}
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
          valor total
        </button>
      </div>

      {item.priceMode === "UNIT" && lineTotal != null && lineTotal > 0 && (
        <span className="text-xs text-muted-foreground tabular-nums">
          = {formatCurrency(lineTotal)}
        </span>
      )}
    </div>
  )
}
