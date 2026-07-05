"use client"

import { type Ref, useEffect, useState } from "react"
import {
  applyCurrencyInputMask,
  formatCurrencyInputFromNumber,
  parseCurrencyInput,
} from "@/lib/currency-input"
import { cn } from "@/lib/utils"

type CurrencyInputProps = {
  value: number | null
  onCommit: (price: number | null) => void
  onValueChange?: (price: number | null) => void
  placeholder?: string
  "aria-label"?: string
  id?: string
  "aria-invalid"?: boolean
  variant?: "compact" | "full"
  className?: string
  inputRef?: Ref<HTMLInputElement>
  onPointerDown?: (event: React.PointerEvent<HTMLInputElement>) => void
}

export function CurrencyInput({
  value,
  onCommit,
  onValueChange,
  placeholder,
  "aria-label": ariaLabel,
  id,
  "aria-invalid": ariaInvalid,
  variant = "compact",
  className,
  inputRef,
  onPointerDown,
}: CurrencyInputProps) {
  const [input, setInput] = useState(value != null ? formatCurrencyInputFromNumber(value) : "")

  useEffect(() => {
    setInput(value != null ? formatCurrencyInputFromNumber(value) : "")
  }, [value])

  function handleChange(raw: string) {
    const masked = applyCurrencyInputMask(raw)
    setInput(masked)
    onValueChange?.(parseCurrencyInput(masked))
  }

  function commit() {
    const next = parseCurrencyInput(input)
    if (next != null && Number.isNaN(next)) {
      setInput(value != null ? formatCurrencyInputFromNumber(value) : "")
      return
    }
    if (next === value) return
    onCommit(next)
  }

  return (
    <div className={cn("relative", className)}>
      <span
        className={cn(
          "-translate-y-1/2 pointer-events-none absolute top-1/2 text-xs text-muted-foreground",
          variant === "full" ? "left-3" : "left-2.5",
        )}
      >
        R$
      </span>
      <input
        ref={inputRef}
        id={id}
        type="text"
        inputMode="decimal"
        placeholder={placeholder}
        aria-label={ariaLabel}
        aria-invalid={ariaInvalid}
        value={input}
        onChange={(event) => handleChange(event.target.value)}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === "Enter") event.currentTarget.blur()
        }}
        onPointerDown={onPointerDown}
        className={cn(
          "rounded-lg border border-input bg-background tabular-nums outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
          variant === "full"
            ? "h-10 w-full pr-3 pl-9 text-base md:text-sm dark:bg-input/30 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40"
            : "h-8 w-28 pr-2 pl-8 text-sm",
        )}
      />
    </div>
  )
}
