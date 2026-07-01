"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { formatQuantity, getMeasureConfig } from "@/lib/measure"
import { cn } from "@/lib/utils"
import type { ProductDTO } from "@/types/domain"

type AddMeasurableProductSheetProps = {
  product: ProductDTO | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (product: ProductDTO, quantity: number) => void
}

export function AddMeasurableProductSheet({
  product,
  open,
  onOpenChange,
  onConfirm,
}: AddMeasurableProductSheetProps) {
  const [quantityInput, setQuantityInput] = useState("")

  useEffect(() => {
    if (open && product) {
      const config = getMeasureConfig(product)
      setQuantityInput(String(config.defaultQuantity))
    }
  }, [open, product])

  if (!product) return null

  const config = getMeasureConfig(product)
  const unit = product.defaultUnit ?? ""
  const parsed = Number.parseFloat(quantityInput.replace(",", "."))
  const isValid = Number.isFinite(parsed) && parsed >= config.minQuantity

  function selectPreset(value: number) {
    setQuantityInput(String(value))
  }

  function confirm() {
    if (!product || !isValid) return
    onConfirm(product, parsed)
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-3xl">
        <SheetHeader>
          <SheetTitle>{product.name}</SheetTitle>
          <SheetDescription>Informe quantos {unit} deseja comprar.</SheetDescription>
        </SheetHeader>

        <div className="space-y-4 px-4 pb-4">
          <div className="flex flex-wrap gap-2">
            {config.quantityPresets.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => selectPreset(preset)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                  parsed === preset
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-card hover:bg-muted/50",
                )}
              >
                {formatQuantity(preset, unit)}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <Label htmlFor="measurable-quantity">Quantidade ({unit})</Label>
            <Input
              id="measurable-quantity"
              type="number"
              inputMode="decimal"
              min={config.minQuantity}
              step={config.step}
              value={quantityInput}
              onChange={(event) => setQuantityInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") confirm()
              }}
            />
          </div>

          <Button type="button" className="w-full" disabled={!isValid} onClick={confirm}>
            Adicionar à lista
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
