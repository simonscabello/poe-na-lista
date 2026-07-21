"use client"

import { SquarePen, Target, TrendingUp } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState, useTransition } from "react"
import { toast } from "sonner"
import { setListBudgetAction } from "@/actions/shopping-list.actions"
import { CurrencyInput } from "@/components/common/currency-input"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { formatCurrency } from "@/lib/format-currency"
import { cn } from "@/lib/utils"

type ProjectBudgetHeaderProps = {
  listId: string
  budgetCap: number | null
  /** Já gasto: soma das compras registradas no projeto. */
  realizedSpent: number
  /** Estimativa do que falta comprar; recalculada ao vivo pelos itens da lista. */
  estimatedRemaining: number
  /** Itens não marcados sem referência de preço, fora da estimativa. */
  unknownCount: number
}

export function ProjectBudgetHeader({
  listId,
  budgetCap,
  realizedSpent,
  estimatedRemaining,
  unknownCount,
}: ProjectBudgetHeaderProps) {
  const [dialogOpen, setDialogOpen] = useState(false)

  if (budgetCap == null) {
    return (
      <>
        <div className="flex items-start gap-3 rounded-2xl bg-card p-4 ring-1 ring-border/70">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Target className="size-5" />
          </span>
          <div className="min-w-0 flex-1 space-y-2">
            <div>
              <p className="text-sm font-medium">Defina um teto de gasto</p>
              <p className="text-xs text-muted-foreground">
                {realizedSpent > 0
                  ? `${formatCurrency(realizedSpent)} gastos até agora neste projeto.`
                  : "Acompanhe quanto já gastou e quanto ainda falta."}
              </p>
            </div>
            <Button size="sm" onClick={() => setDialogOpen(true)}>
              Definir teto
            </Button>
          </div>
        </div>
        <BudgetCapDialog
          listId={listId}
          currentCap={null}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
        />
      </>
    )
  }

  const percentUsed = budgetCap > 0 ? (realizedSpent / budgetCap) * 100 : 0
  const remaining = budgetCap - realizedSpent
  const over = remaining < 0
  const warn = !over && percentUsed >= 80
  const projectedTotal = realizedSpent + estimatedRemaining
  const projectedOver = projectedTotal > budgetCap

  return (
    <>
      <div className="space-y-3 rounded-2xl bg-card p-5 ring-1 ring-border/70">
        <div className="flex items-center justify-between gap-2">
          <p className="text-section-label">Teto do projeto</p>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Editar teto"
            onClick={() => setDialogOpen(true)}
            className="-my-1 text-muted-foreground"
          >
            <SquarePen className="size-4" />
          </Button>
        </div>

        <p className="font-heading text-2xl font-semibold tracking-tight tabular-nums">
          {formatCurrency(realizedSpent)}{" "}
          <span className="text-base font-normal text-muted-foreground">
            de {formatCurrency(budgetCap)}
          </span>
        </p>

        <div
          className="h-2 overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-valuenow={Math.min(Math.round(percentUsed), 100)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Uso do teto do projeto"
        >
          <div
            className={cn(
              "h-full rounded-full transition-[width]",
              over ? "bg-destructive" : warn ? "bg-warning" : "bg-primary",
            )}
            style={{ width: `${Math.min(percentUsed, 100)}%` }}
          />
        </div>

        <p
          className={cn(
            "text-xs tabular-nums",
            over ? "font-medium text-destructive" : "text-muted-foreground",
          )}
        >
          {over
            ? `${formatCurrency(Math.abs(remaining))} acima do teto`
            : `Resta ${formatCurrency(remaining)}`}
        </p>

        {estimatedRemaining > 0 && (
          <p
            className={cn(
              "flex items-center gap-1.5 text-xs",
              projectedOver ? "font-medium text-warning" : "text-muted-foreground",
            )}
          >
            <TrendingUp className="size-3.5 shrink-0" />
            <span className="tabular-nums">
              Faltando comprar ~{formatCurrency(estimatedRemaining)} · projeção ~
              {formatCurrency(projectedTotal)}
              {projectedOver ? ` (${formatCurrency(projectedTotal - budgetCap)} acima)` : ""}
            </span>
          </p>
        )}

        {unknownCount > 0 && (
          <p className="text-xs text-muted-foreground tabular-nums">
            {unknownCount}{" "}
            {unknownCount === 1 ? "item sem referência de preço" : "itens sem referência de preço"}
          </p>
        )}
      </div>

      <BudgetCapDialog
        listId={listId}
        currentCap={budgetCap}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </>
  )
}

function BudgetCapDialog({
  listId,
  currentCap,
  open,
  onOpenChange,
}: {
  listId: string
  currentCap: number | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [value, setValue] = useState<number | null>(currentCap)
  const wasOpenRef = useRef(false)

  useEffect(() => {
    if (open && !wasOpenRef.current) {
      setValue(currentCap)
    }
    wasOpenRef.current = open
  }, [open, currentCap])

  function save(nextCap: number | null) {
    startTransition(async () => {
      const result = await setListBudgetAction(listId, { budgetCap: nextCap })
      if (!result.success) {
        toast.error(result.error)
        return
      }
      toast.success(nextCap != null ? "Teto salvo" : "Teto removido")
      onOpenChange(false)
      router.refresh()
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Teto do projeto</DialogTitle>
          <DialogDescription>Quanto você quer, no máximo, gastar neste projeto.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="project-cap">Valor</Label>
            <CurrencyInput
              id="project-cap"
              variant="full"
              value={value}
              onCommit={setValue}
              onValueChange={setValue}
              placeholder="0,00"
              aria-label="Teto de gasto do projeto"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Button
              onClick={() => save(value)}
              loading={isPending}
              disabled={value == null || value <= 0}
              className="w-full"
            >
              Salvar
            </Button>
            {currentCap != null && (
              <Button
                variant="ghost"
                onClick={() => save(null)}
                disabled={isPending}
                className="text-destructive hover:text-destructive"
              >
                Remover teto
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
