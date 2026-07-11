"use client"

import { type PointerEvent, type RefObject, useEffect, useState } from "react"
import { CurrencyInput } from "@/components/common/currency-input"
import { CurrencyText } from "@/components/common/currency-text"
import { computeLineTotal } from "@/lib/pricing"
import { cn } from "@/lib/utils"
import type { PriceModeDTO, ShoppingListItemDTO } from "@/types/domain"

type ItemPriceFieldsProps = {
  item: ShoppingListItemDTO
  unitLabel: string
  priceLabel: string
  autoFilled?: boolean
  /** Último preço pago, mostrado como sugestão editável quando o item ainda não tem preço. */
  suggestedPrice?: number | null
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
  autoFilled = false,
  suggestedPrice = null,
  onChangePrice,
  onChangePriceMode,
  priceInputRef,
  onPointerDown,
  className,
}: ItemPriceFieldsProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Sem preço próprio, exibe o último preço pago como sugestão (só persiste
  // quando o usuário edita ou marca o item).
  const showingSuggestion = item.price == null && suggestedPrice != null
  const displayValue = item.price ?? suggestedPrice ?? null
  const lineTotal = computeLineTotal(displayValue, item.quantity, item.priceMode)
  const showLastPriceHint = (autoFilled || showingSuggestion) && displayValue != null
  const showLineTotal =
    item.priceMode === "UNIT" &&
    lineTotal != null &&
    lineTotal > 0 &&
    (item.price != null || mounted)

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <CurrencyInput
        value={displayValue}
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

      {showLineTotal && (
        <span className="text-xs text-muted-foreground">
          = <CurrencyText value={lineTotal} />
        </span>
      )}

      {showLastPriceHint && (
        <span className="text-xs text-muted-foreground italic">último preço</span>
      )}
    </div>
  )
}
