"use client"

import { Minus, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

type QuantityStepperProps = {
  count: number
  name: string
  onAdd: () => void
  onRemove: () => void
  size?: "sm" | "md"
  step?: number
  formatValue?: (value: number) => string
  removeLabel?: string
  addLabel?: string
}

const buttonSize = {
  sm: "size-7",
  md: "size-8",
} as const

const valueSize = {
  sm: "min-w-5 text-xs",
  md: "min-w-6 text-sm",
} as const

export function QuantityStepper({
  count,
  name,
  onAdd,
  onRemove,
  size = "sm",
  step = 1,
  formatValue,
  removeLabel,
  addLabel,
}: QuantityStepperProps) {
  const display = formatValue ? formatValue(count) : String(count)
  const stepLabel = step < 1 ? String(step).replace(".", ",") : String(step)

  return (
    <div className="flex shrink-0 items-center gap-0.5 rounded-full bg-muted/60 p-0.5">
      <button
        type="button"
        onClick={onRemove}
        aria-label={removeLabel ?? `Remover ${stepLabel} ${name}`}
        className={cn(
          "flex items-center justify-center rounded-full text-muted-foreground transition-colors duration-[var(--duration-fast)] hover:bg-background hover:text-foreground active:translate-y-px",
          buttonSize[size],
        )}
      >
        <Minus className="size-3.5" />
      </button>
      <span className={cn("text-center font-semibold tabular-nums", valueSize[size])}>
        {display}
      </span>
      <button
        type="button"
        onClick={onAdd}
        aria-label={addLabel ?? `Adicionar ${stepLabel} ${name}`}
        className={cn(
          "flex items-center justify-center rounded-full text-muted-foreground transition-colors duration-[var(--duration-fast)] hover:bg-background hover:text-foreground active:translate-y-px",
          buttonSize[size],
        )}
      >
        <Plus className="size-3.5" />
      </button>
    </div>
  )
}
