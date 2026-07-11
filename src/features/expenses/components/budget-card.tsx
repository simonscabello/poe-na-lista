"use client"

import { PiggyBank, SquarePen, TrendingUp } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState, useTransition } from "react"
import { toast } from "sonner"
import { setMonthlyBudgetAction } from "@/actions/household.actions"
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
import type { BudgetStatusDTO } from "@/types/domain"

type BudgetCardProps = {
  householdId: string
  status: BudgetStatusDTO | null
  canManage: boolean
}

export function BudgetCard({ householdId, status, canManage }: BudgetCardProps) {
  const [dialogOpen, setDialogOpen] = useState(false)

  if (!status && !canManage) return null

  if (!status) {
    return (
      <>
        <div className="flex items-start gap-3 rounded-2xl bg-card p-4 ring-1 ring-border/70">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <PiggyBank className="size-5" />
          </span>
          <div className="min-w-0 flex-1 space-y-2">
            <div>
              <p className="text-sm font-medium">Defina um orçamento mensal</p>
              <p className="text-xs text-muted-foreground">
                Acompanhe o gasto do grupo e saiba antes de estourar o mês.
              </p>
            </div>
            <Button size="sm" onClick={() => setDialogOpen(true)}>
              Definir orçamento
            </Button>
          </div>
        </div>
        <BudgetDialog
          householdId={householdId}
          currentBudget={null}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
        />
      </>
    )
  }

  const over = status.remaining < 0
  const warn = !over && status.percentUsed >= 80
  const projectedOver = status.projectedTotal != null && status.projectedTotal > status.budget

  return (
    <>
      <div className="space-y-3 rounded-2xl bg-card p-5 ring-1 ring-border/70">
        <div className="flex items-center justify-between gap-2">
          <p className="text-section-label">Orçamento do mês</p>
          {canManage && (
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Editar orçamento"
              onClick={() => setDialogOpen(true)}
              className="-my-1 text-muted-foreground"
            >
              <SquarePen className="size-4" />
            </Button>
          )}
        </div>

        <p className="font-heading text-2xl font-semibold tracking-tight tabular-nums">
          {formatCurrency(status.spent)}{" "}
          <span className="text-base font-normal text-muted-foreground">
            de {formatCurrency(status.budget)}
          </span>
        </p>

        <div
          className="h-2 overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-valuenow={Math.min(Math.round(status.percentUsed), 100)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Uso do orçamento do mês"
        >
          <div
            className={cn(
              "h-full rounded-full transition-[width]",
              over ? "bg-destructive" : warn ? "bg-amber-500" : "bg-primary",
            )}
            style={{ width: `${Math.min(status.percentUsed, 100)}%` }}
          />
        </div>

        <p
          className={cn(
            "text-xs tabular-nums",
            over ? "font-medium text-destructive" : "text-muted-foreground",
          )}
        >
          {over
            ? `${formatCurrency(Math.abs(status.remaining))} acima do orçamento`
            : `Resta ${formatCurrency(status.remaining)} · ${status.daysRemaining} ${status.daysRemaining === 1 ? "dia" : "dias"} até o fim do mês`}
        </p>

        {status.projectedTotal != null && (
          <p
            className={cn(
              "flex items-center gap-1.5 text-xs",
              projectedOver
                ? "font-medium text-amber-700 dark:text-amber-400"
                : "text-muted-foreground",
            )}
          >
            <TrendingUp className="size-3.5 shrink-0" />
            <span className="tabular-nums">
              No ritmo atual, o mês fecha em ~{formatCurrency(status.projectedTotal)}
              {projectedOver
                ? ` — ${formatCurrency(status.projectedTotal - status.budget)} acima do orçamento`
                : ", dentro do orçamento"}
            </span>
          </p>
        )}
      </div>

      <BudgetDialog
        householdId={householdId}
        currentBudget={status.budget}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </>
  )
}

function BudgetDialog({
  householdId,
  currentBudget,
  open,
  onOpenChange,
}: {
  householdId: string
  currentBudget: number | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [value, setValue] = useState<number | null>(currentBudget)
  const wasOpenRef = useRef(false)

  useEffect(() => {
    if (open && !wasOpenRef.current) {
      setValue(currentBudget)
    }
    wasOpenRef.current = open
  }, [open, currentBudget])

  function save(nextBudget: number | null) {
    startTransition(async () => {
      const result = await setMonthlyBudgetAction(householdId, { budget: nextBudget })
      if (!result.success) {
        toast.error(result.error)
        return
      }
      toast.success(nextBudget != null ? "Orçamento salvo" : "Orçamento removido")
      onOpenChange(false)
      router.refresh()
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Orçamento mensal</DialogTitle>
          <DialogDescription>
            Teto de gasto do grupo para o mês. Todos os membros acompanham o progresso.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="monthly-budget">Valor</Label>
            <CurrencyInput
              id="monthly-budget"
              variant="full"
              value={value}
              onCommit={setValue}
              onValueChange={setValue}
              placeholder="0,00"
              aria-label="Valor do orçamento mensal"
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
            {currentBudget != null && (
              <Button
                variant="ghost"
                onClick={() => save(null)}
                disabled={isPending}
                className="text-destructive hover:text-destructive"
              >
                Remover orçamento
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
