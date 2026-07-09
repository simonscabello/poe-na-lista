"use client"

import { ListPlus, RotateCcw } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useRef, useState, useTransition } from "react"
import { toast } from "sonner"
import { finalizePurchaseAction } from "@/actions/purchase.actions"
import { CurrencyInput } from "@/components/common/currency-input"
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
import type { ShoppingListItemDTO, StoreDTO } from "@/types/domain"

type Step = "pending" | "details"
type PendingHandling = "NEW_LIST" | "KEEP_IN_LIST"

type FinalizePurchaseSheetProps = {
  listId: string
  listName: string
  items: ShoppingListItemDTO[]
  stores: StoreDTO[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function FinalizePurchaseSheet({
  listId,
  listName,
  items,
  stores,
  open,
  onOpenChange,
}: FinalizePurchaseSheetProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [step, setStep] = useState<Step>("details")
  const wasOpenRef = useRef(false)

  const checkedItems = useMemo(() => items.filter((item) => item.checked), [items])
  const pendingItems = useMemo(() => items.filter((item) => !item.checked), [items])
  const hasPending = pendingItems.length > 0

  const [pendingHandling, setPendingHandling] = useState<PendingHandling>("NEW_LIST")
  const [pendingListName, setPendingListName] = useState(`${listName} · pendências`)

  const [manualTotal, setManualTotal] = useState<number | null>(null)
  const totalInputRef = useRef<HTMLInputElement>(null)
  const [purchasedAt, setPurchasedAt] = useState(localDateString)
  const [storeName, setStoreName] = useState("")
  const [notes, setNotes] = useState("")

  const itemsTotal = useMemo(
    () =>
      checkedItems.reduce(
        (sum, item) => sum + (computeLineTotal(item.price, item.quantity, item.priceMode) ?? 0),
        0,
      ),
    [checkedItems],
  )
  const allPriced = checkedItems.length > 0 && checkedItems.every((item) => item.price != null)

  useEffect(() => {
    const justOpened = open && !wasOpenRef.current
    wasOpenRef.current = open

    if (!justOpened) return

    const initialHasPending = items.some((item) => !item.checked)

    setStep(initialHasPending ? "pending" : "details")
    setPendingListName(`${listName} · pendências`)
    setPendingHandling("NEW_LIST")
    setManualTotal(null)
    setPurchasedAt(localDateString())
    setStoreName("")
    setNotes("")
  }, [open, items, listName])

  useEffect(() => {
    if (open && !allPriced && itemsTotal > 0) {
      setManualTotal((current) => (current == null ? itemsTotal : current))
    }
  }, [open, allPriced, itemsTotal])

  useEffect(() => {
    if (open && step === "details" && !allPriced) {
      totalInputRef.current?.focus()
    }
  }, [open, step, allPriced])

  const hasManualTotal = manualTotal != null && manualTotal > 0
  const belowItems = hasManualTotal && manualTotal + 0.001 < itemsTotal
  const canRegister = allPriced || (hasManualTotal && !belowItems)

  function finishFlow(destination: string | null) {
    onOpenChange(false)
    if (destination) {
      router.push(destination)
    }
  }

  function finalize() {
    if (!canRegister) return
    startTransition(async () => {
      const result = await finalizePurchaseAction(listId, {
        totalAmount: allPriced ? undefined : (manualTotal ?? undefined),
        purchasedAt,
        storeName,
        notes,
        pendingHandling: hasPending ? pendingHandling : undefined,
        pendingListName: hasPending && pendingHandling === "NEW_LIST" ? pendingListName : undefined,
      })
      if (!result.success) {
        toast.error(result.error)
        return
      }

      const viewPurchase = {
        label: "Ver em Gastos",
        onClick: () => router.push(`/dashboard/expenses/${result.data.purchaseId}`),
      }

      let destination: string | null = null

      if (result.data.pendingListName) {
        toast.success(`Compra registrada · pendências em ${result.data.pendingListName}`, {
          action: viewPurchase,
        })
        destination = result.data.pendingListId
          ? `/dashboard/lists/${result.data.pendingListId}`
          : null
      } else if (hasPending && pendingHandling === "KEEP_IN_LIST") {
        toast.success(
          `Compra registrada · ${pendingItems.length} ${pendingItems.length === 1 ? "item restante" : "itens restantes"} na lista`,
          { action: viewPurchase },
        )
      } else {
        toast.success("Compra registrada", { action: viewPurchase })
        destination = allPriced ? "/dashboard/lists" : null
      }

      router.refresh()
      finishFlow(destination)
    })
  }

  const stepTitle = step === "pending" ? "Itens não encontrados" : "Finalizar compra"

  const stepDescription =
    step === "pending"
      ? `${pendingItems.length} ${pendingItems.length === 1 ? "item não foi marcado" : "itens não foram marcados"} como comprado.`
      : allPriced
        ? "O total foi calculado a partir dos preços dos itens marcados."
        : "Informe o valor total. O resto é opcional."

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[92dvh] overflow-y-auto safe-bottom">
        <SheetHeader>
          <SheetTitle>{stepTitle}</SheetTitle>
          <SheetDescription>{stepDescription}</SheetDescription>
        </SheetHeader>

        <div className="space-y-5 px-4 pb-6">
          {step === "pending" && (
            <>
              <ul className="max-h-36 space-y-1 overflow-y-auto rounded-xl bg-muted/40 px-3 py-2 ring-1 ring-border/60">
                {pendingItems.map((item) => (
                  <li key={item.id} className="truncate text-sm text-muted-foreground">
                    {item.productName}
                  </li>
                ))}
              </ul>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setPendingHandling("NEW_LIST")}
                  className={cn(
                    "flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left ring-1 transition-colors",
                    pendingHandling === "NEW_LIST"
                      ? "bg-primary/10 ring-primary"
                      : "ring-border hover:bg-muted/50",
                  )}
                >
                  <ListPlus className="mt-0.5 size-5 shrink-0" />
                  <span>
                    <span className="block text-sm font-medium">
                      Criar nova lista com pendências
                    </span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      Esta lista será finalizada e os itens pendentes vão para outra lista.
                    </span>
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setPendingHandling("KEEP_IN_LIST")}
                  className={cn(
                    "flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left ring-1 transition-colors",
                    pendingHandling === "KEEP_IN_LIST"
                      ? "bg-primary/10 ring-primary"
                      : "ring-border hover:bg-muted/50",
                  )}
                >
                  <RotateCcw className="mt-0.5 size-5 shrink-0" />
                  <span>
                    <span className="block text-sm font-medium">Manter na lista atual</span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      Compra parcial — os pendentes ficam para a próxima ida ao mercado.
                    </span>
                  </span>
                </button>
              </div>

              {pendingHandling === "NEW_LIST" && (
                <div className="space-y-2">
                  <Label htmlFor="pending-list-name">Nome da nova lista</Label>
                  <Input
                    id="pending-list-name"
                    value={pendingListName}
                    onChange={(event) => setPendingListName(event.target.value)}
                    placeholder="Nome da lista"
                  />
                </div>
              )}

              <Button
                onClick={() => setStep("details")}
                disabled={pendingHandling === "NEW_LIST" && !pendingListName.trim()}
                className="w-full"
              >
                Continuar
              </Button>
            </>
          )}

          {step === "details" && (
            <>
              <p className="text-xs text-muted-foreground tabular-nums">
                {checkedItems.length}{" "}
                {checkedItems.length === 1 ? "item marcado" : "itens marcados"}
                {hasPending &&
                  ` · ${pendingItems.length} pendente${pendingItems.length === 1 ? "" : "s"}`}
              </p>

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
                  <Label htmlFor="total">Valor total</Label>
                  <CurrencyInput
                    id="total"
                    variant="full"
                    value={manualTotal}
                    onCommit={setManualTotal}
                    onValueChange={setManualTotal}
                    placeholder="0,00"
                    aria-label="Valor total da compra"
                    aria-invalid={belowItems}
                    inputRef={totalInputRef}
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
                        : `Itens marcados somam ${formatCurrency(itemsTotal)}`}
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
                {stores.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {stores.map((store) => {
                      const selected =
                        store.name.trim().toLowerCase() === storeName.trim().toLowerCase()
                      return (
                        <button
                          key={store.id}
                          type="button"
                          onClick={() => setStoreName(selected ? "" : store.name)}
                          className={cn(
                            "rounded-full px-3 py-1.5 text-sm ring-1 transition-colors",
                            selected
                              ? "bg-primary/10 text-primary ring-primary"
                              : "text-muted-foreground ring-border hover:bg-muted/50",
                          )}
                        >
                          {store.name}
                        </button>
                      )
                    })}
                  </div>
                )}
                <Input
                  id="store"
                  placeholder={
                    stores.length > 0 ? "Ou escreva um novo mercado" : "Onde você comprou"
                  }
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

              <div className="flex flex-col gap-2">
                {hasPending && (
                  <Button type="button" variant="ghost" onClick={() => setStep("pending")}>
                    Voltar
                  </Button>
                )}
                <Button
                  onClick={finalize}
                  loading={isPending}
                  disabled={!canRegister}
                  className="w-full"
                >
                  Registrar compra
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
