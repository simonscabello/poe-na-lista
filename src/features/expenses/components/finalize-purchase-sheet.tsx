"use client"

import { Check, Package } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState, useTransition } from "react"
import { toast } from "sonner"
import { finalizePurchaseAction, stockPantryFromPurchaseAction } from "@/actions/purchase.actions"
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
import { Textarea } from "@/components/ui/textarea"
import { localDateString } from "@/lib/calendar-date"
import { formatCurrency } from "@/lib/format-currency"
import { computeLineTotal } from "@/lib/pricing"
import { cn } from "@/lib/utils"
import type { ShoppingListItemDTO } from "@/types/domain"

type Step = "details" | "pantry"

type FinalizePurchaseSheetProps = {
  listId: string
  householdId: string
  items: ShoppingListItemDTO[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function FinalizePurchaseSheet({
  listId,
  householdId,
  items,
  open,
  onOpenChange,
}: FinalizePurchaseSheetProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [step, setStep] = useState<Step>("details")

  const [total, setTotal] = useState("")
  const [purchasedAt, setPurchasedAt] = useState(localDateString)
  const [storeName, setStoreName] = useState("")
  const [notes, setNotes] = useState("")
  const [pantrySelection, setPantrySelection] = useState<Set<string>>(
    () => new Set(items.map((item) => item.productId)),
  )

  const itemsTotal = useMemo(
    () =>
      items.reduce(
        (sum, item) => sum + (computeLineTotal(item.price, item.quantity, item.priceMode) ?? 0),
        0,
      ),
    [items],
  )
  const allPriced = items.length > 0 && items.every((item) => item.price != null)

  // Pré-preenche o total manual com a soma dos itens ao abrir (não sobrescreve edição).
  useEffect(() => {
    if (open && !allPriced && itemsTotal > 0) {
      setTotal((current) => (current === "" ? String(itemsTotal) : current))
    }
  }, [open, allPriced, itemsTotal])

  // Quando todos os itens têm preço, o total é a soma (travado). Senão, total manual.
  const manualTotal = Number.parseFloat(total.replace(",", "."))
  const hasManualTotal = total.trim() !== "" && Number.isFinite(manualTotal)
  const belowItems = hasManualTotal && manualTotal + 0.001 < itemsTotal
  const canRegister = allPriced || (hasManualTotal && !belowItems)

  function finalize() {
    if (!canRegister) return
    startTransition(async () => {
      const result = await finalizePurchaseAction(listId, {
        totalAmount: allPriced ? undefined : total,
        purchasedAt,
        storeName,
        notes,
      })
      if (!result.success) {
        toast.error(result.error)
        return
      }
      toast.success("Compra registrada")
      router.refresh()
      setStep("pantry")
    })
  }

  function updatePantry() {
    const selected = items.filter((item) => pantrySelection.has(item.productId))
    if (selected.length === 0) {
      finishFlow()
      return
    }
    startTransition(async () => {
      const result = await stockPantryFromPurchaseAction(householdId, {
        items: selected.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          unit: item.unit ?? "",
        })),
      })
      if (!result.success) {
        toast.error(result.error)
        return
      }
      toast.success("Despensa atualizada")
      finishFlow()
    })
  }

  function finishFlow() {
    onOpenChange(false)
    router.push("/dashboard/expenses")
  }

  function togglePantryItem(productId: string) {
    setPantrySelection((prev) => {
      const next = new Set(prev)
      if (next.has(productId)) {
        next.delete(productId)
      } else {
        next.add(productId)
      }
      return next
    })
  }

  const allPantrySelected =
    items.length > 0 && items.every((item) => pantrySelection.has(item.productId))

  function toggleSelectAllPantry() {
    if (allPantrySelected) {
      setPantrySelection(new Set())
      return
    }
    setPantrySelection(new Set(items.map((item) => item.productId)))
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[92dvh] overflow-y-auto safe-bottom">
        <SheetHeader>
          <SheetTitle>{step === "details" ? "Finalizar compra" : "Atualizar despensa"}</SheetTitle>
          <SheetDescription>
            {step === "details"
              ? allPriced
                ? "O total foi calculado a partir dos preços dos itens."
                : "Informe o valor total. O resto é opcional."
              : "Adicione o que você comprou ao seu estoque em casa."}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-5 px-4 pb-6">
          {step === "details" && (
            <>
              {allPriced ? (
                <div className="space-y-2">
                  <Label>Valor total</Label>
                  <div className="flex items-center justify-between rounded-xl bg-muted/60 px-4 py-3 ring-1 ring-border/60">
                    <span className="text-sm text-muted-foreground">Calculado dos itens</span>
                    <span className="font-heading text-lg font-semibold tabular-nums">
                      {formatCurrency(itemsTotal)}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="total">Valor total (R$)</Label>
                  <Input
                    id="total"
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    min={0}
                    placeholder="0,00"
                    value={total}
                    onChange={(event) => setTotal(event.target.value)}
                    aria-invalid={belowItems}
                    autoFocus
                  />
                  {itemsTotal > 0 && (
                    <p
                      className={cn(
                        "text-xs",
                        belowItems ? "text-destructive" : "text-muted-foreground",
                      )}
                    >
                      {belowItems
                        ? `O total não pode ser menor que a soma dos itens (${formatCurrency(itemsTotal)})`
                        : `Itens já somam ${formatCurrency(itemsTotal)}`}
                    </p>
                  )}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="date">Data</Label>
                <Input
                  id="date"
                  type="date"
                  value={purchasedAt}
                  onChange={(event) => setPurchasedAt(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="store">Mercado (opcional)</Label>
                <Input
                  id="store"
                  placeholder="Onde você comprou"
                  value={storeName}
                  onChange={(event) => setStoreName(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Observação (opcional)</Label>
                <Textarea
                  id="notes"
                  rows={2}
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                />
              </div>

              <Button onClick={finalize} disabled={isPending || !canRegister} className="w-full">
                Registrar compra
              </Button>
            </>
          )}

          {step === "pantry" && (
            <>
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs text-muted-foreground tabular-nums">
                  {pantrySelection.size} de {items.length} selecionados
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={toggleSelectAllPantry}
                  className="h-8 shrink-0 text-xs"
                >
                  {allPantrySelected ? "Desmarcar todos" : "Selecionar todos"}
                </Button>
              </div>
              <div className="space-y-1">
                {items.map((item) => {
                  const selected = pantrySelection.has(item.productId)
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => togglePantryItem(item.productId)}
                      className="flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left transition-colors hover:bg-muted"
                    >
                      <span
                        className={cn(
                          "flex size-5 shrink-0 items-center justify-center rounded-md ring-1",
                          selected
                            ? "bg-primary text-primary-foreground ring-primary"
                            : "ring-border",
                        )}
                      >
                        {selected && <Check className="size-3.5" />}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-sm">{item.productName}</span>
                      <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                        {item.quantity}
                        {item.unit ? ` ${item.unit}` : ""}
                      </span>
                    </button>
                  )
                })}
              </div>
              <div className="flex flex-col gap-2">
                <Button onClick={updatePantry} disabled={isPending}>
                  <Package className="size-4" />
                  Atualizar despensa
                </Button>
                <Button variant="ghost" onClick={finishFlow} disabled={isPending}>
                  Agora não
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
