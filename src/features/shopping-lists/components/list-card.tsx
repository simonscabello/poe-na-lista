"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import {
  AlertCircle,
  Calculator,
  Check,
  MoreVertical,
  Pencil,
  Store,
  Target,
  Trash2,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { deleteListAction, renameListAction } from "@/actions/shopping-list.actions"
import { ConfirmDialog } from "@/components/common/confirm-dialog"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { ListCardIllustration } from "@/features/shopping-lists/components/list-card-illustration"
import { ListCardInviteButton } from "@/features/shopping-lists/components/list-card-invite-button"
import { ListCardMembers } from "@/features/shopping-lists/components/list-card-members"
import {
  type ShoppingListNameValues,
  shoppingListNameSchema,
} from "@/features/shopping-lists/schemas"
import { formatCurrency } from "@/lib/format-currency"
import { cn } from "@/lib/utils"
import type { HouseholdMemberDTO, ShoppingListSummary } from "@/types/domain"

type ListCardProps = {
  list: ShoppingListSummary
  members: HouseholdMemberDTO[]
  householdId: string
  canInvite: boolean
  /** Estimativa de total pelos últimos preços pagos; null quando não há referência suficiente. */
  estimatedTotal?: number | null
}

export function ListCard({
  list,
  members,
  householdId,
  canInvite,
  estimatedTotal = null,
}: ListCardProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [renameOpen, setRenameOpen] = useState(false)
  const form = useForm<ShoppingListNameValues>({
    resolver: zodResolver(shoppingListNameSchema),
    defaultValues: { name: list.name },
  })

  const pendingItems = list.totalItems - list.checkedItems
  const allDone = list.totalItems > 0 && pendingItems === 0
  const isCompleted = list.status === "COMPLETED"
  const progressPercent =
    list.totalItems > 0 ? Math.round((list.checkedItems / list.totalItems) * 100) : 0
  const isProject = list.kind === "PROJECT"
  const hasCap = isProject && list.budgetCap != null
  // Projeto com teto troca a barra de progresso de itens pela barra de gasto.
  const showProgress = !isCompleted && list.totalItems > 0 && !hasCap

  function openList() {
    router.push(`/dashboard/lists/${list.id}`)
  }

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteListAction(list.id)
      if (!result.success) {
        toast.error(result.error)
        return
      }
      setConfirmOpen(false)
      toast.success("Lista excluída")
      router.refresh()
    })
  }

  async function onRename(values: ShoppingListNameValues) {
    const result = await renameListAction(list.id, values)
    if (!result.success) {
      toast.error(result.error)
      return
    }
    setRenameOpen(false)
    toast.success("Lista renomeada")
    router.refresh()
  }

  return (
    <article
      className={cn(
        "relative flex min-h-36 flex-col justify-between overflow-hidden rounded-2xl p-5 shadow-sm ring-1 transition-all duration-[var(--duration-fast)] active:scale-[0.99]",
        isCompleted
          ? "bg-gradient-to-br from-muted-foreground to-muted-foreground/80 text-primary-foreground ring-muted-foreground/30"
          : "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground ring-primary/30",
      )}
    >
      <button
        type="button"
        onClick={openList}
        aria-label={`Abrir lista ${list.name}`}
        className="absolute inset-0 z-0 rounded-2xl"
      />

      <ListCardIllustration seed={list.id} />

      <div className="pointer-events-none relative z-[1] flex items-start justify-between gap-2">
        <h2 className="min-w-0 flex-1 truncate font-heading text-xl font-semibold tracking-tight">
          {list.name}
        </h2>

        <Dialog
          open={renameOpen}
          onOpenChange={(open) => {
            setRenameOpen(open)
            if (open) form.reset({ name: list.name })
          }}
        >
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Opções da lista"
                  className="pointer-events-auto -mt-1 -mr-1 rounded-full text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground"
                >
                  <MoreVertical className="size-4" />
                </Button>
              }
            />
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setRenameOpen(true)}>
                <Pencil className="size-4" />
                Renomear
              </DropdownMenuItem>
              <DropdownMenuItem variant="destructive" onClick={() => setConfirmOpen(true)}>
                <Trash2 className="size-4" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>Renomear lista</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onRename)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome</FormLabel>
                      <FormControl>
                        <Input autoFocus {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" loading={form.formState.isSubmitting}>
                  Salvar
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="pointer-events-none relative z-[1] mt-2 flex flex-wrap items-center gap-2">
        {isProject && (
          <span className="inline-flex items-center gap-1 rounded-full bg-primary-foreground/15 px-2.5 py-1 text-xs font-medium">
            <Target className="size-3.5" />
            Projeto
          </span>
        )}
        <StatusBadge
          allDone={allDone}
          totalItems={list.totalItems}
          pendingItems={pendingItems}
          isCompleted={isCompleted}
          unpricedCheckedItems={list.unpricedCheckedItems}
          purchaseCount={list.purchaseCount}
        />
      </div>

      {!isProject && !isCompleted && estimatedTotal != null && (
        <p className="pointer-events-none relative z-[1] mt-2 flex items-center gap-1.5 truncate text-xs font-medium opacity-90 tabular-nums">
          <Calculator className="size-3.5 shrink-0" />~{formatCurrency(estimatedTotal)} estimados
        </p>
      )}

      {isProject && !hasCap && !isCompleted && list.spent > 0 && (
        <p className="pointer-events-none relative z-[1] mt-2 flex items-center gap-1.5 truncate text-xs font-medium opacity-90 tabular-nums">
          <Target className="size-3.5 shrink-0" />
          {formatCurrency(list.spent)} gastos
        </p>
      )}

      {isProject && list.budgetCap != null && !isCompleted && (
        <ProjectBudgetBar spent={list.spent} cap={list.budgetCap} name={list.name} />
      )}

      {isCompleted && (list.lastPurchaseStoreName || list.lastPurchaseTotal != null) && (
        <p className="pointer-events-none relative z-[1] mt-2 flex items-center gap-1.5 truncate text-xs font-medium opacity-90 tabular-nums">
          <Store className="size-3.5 shrink-0" />
          {[
            list.lastPurchaseStoreName,
            list.lastPurchaseTotal != null ? formatCurrency(list.lastPurchaseTotal) : null,
          ]
            .filter(Boolean)
            .join(" · ")}
        </p>
      )}

      {showProgress && (
        <div className="pointer-events-none relative z-[1] mt-3 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-medium tabular-nums">
            <span>
              {list.checkedItems} de {list.totalItems} {list.totalItems === 1 ? "item" : "itens"}
            </span>
            <span className="opacity-90">{progressPercent}%</span>
          </div>
          <div
            className="h-1.5 overflow-hidden rounded-full bg-primary-foreground/20"
            role="progressbar"
            aria-valuenow={progressPercent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Progresso da compra da lista ${list.name}`}
          >
            <div
              className="h-full rounded-full bg-primary-foreground transition-[width] duration-[var(--duration-fast)]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      <div className="relative z-[1] mt-4 flex items-center justify-between gap-2">
        <div className="pointer-events-none">
          <ListCardMembers members={members} />
        </div>
        {canInvite && <ListCardInviteButton householdId={householdId} />}
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Excluir lista"
        description={`Tem certeza que deseja excluir "${list.name}"? Essa ação não pode ser desfeita.`}
        pending={isPending}
        onConfirm={handleDelete}
      />
    </article>
  )
}

function StatusBadge({
  allDone,
  totalItems,
  pendingItems,
  isCompleted,
  unpricedCheckedItems,
  purchaseCount,
}: {
  allDone: boolean
  totalItems: number
  pendingItems: number
  isCompleted: boolean
  unpricedCheckedItems: number
  purchaseCount: number
}) {
  const hasPartialPurchase = !isCompleted && purchaseCount > 0 && pendingItems > 0

  return (
    <div className="flex flex-wrap items-center gap-2">
      {isCompleted ? (
        <span className="inline-flex items-center gap-1 rounded-full bg-primary-foreground/20 px-2.5 py-1 text-xs font-medium">
          <Check className="size-3.5" />
          Finalizada
        </span>
      ) : totalItems === 0 ? (
        <span className="inline-flex items-center rounded-full bg-primary-foreground/15 px-2.5 py-1 text-xs font-medium">
          Lista vazia
        </span>
      ) : allDone ? (
        <span className="inline-flex items-center gap-1 rounded-full bg-primary-foreground/20 px-2.5 py-1 text-xs font-medium">
          <Check className="size-3.5" />
          Tudo certo
        </span>
      ) : null}

      {hasPartialPurchase && (
        <span className="inline-flex items-center rounded-full bg-primary-foreground/15 px-2.5 py-1 text-xs font-medium">
          Compra parcial
        </span>
      )}

      {unpricedCheckedItems > 0 && (
        <span className="inline-flex items-center gap-1 rounded-full bg-warning/30 px-2.5 py-1 text-xs font-medium tabular-nums">
          <AlertCircle className="size-3.5" />
          {unpricedCheckedItems} sem preço
        </span>
      )}
    </div>
  )
}

function ProjectBudgetBar({ spent, cap, name }: { spent: number; cap: number; name: string }) {
  const percent = cap > 0 ? Math.round((spent / cap) * 100) : 0
  const over = spent > cap

  return (
    <div className="pointer-events-none relative z-[1] mt-3 space-y-1.5">
      <div className="flex items-center justify-between text-xs font-medium tabular-nums">
        <span>
          {formatCurrency(spent)} de {formatCurrency(cap)}
        </span>
        <span className="opacity-90">{percent}%</span>
      </div>
      <div
        className="h-1.5 overflow-hidden rounded-full bg-primary-foreground/20"
        role="progressbar"
        aria-valuenow={Math.min(percent, 100)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Uso do teto do projeto ${name}`}
      >
        <div
          className="h-full rounded-full bg-primary-foreground transition-[width] duration-[var(--duration-fast)]"
          style={{ width: `${Math.min(percent, 100)}%` }}
        />
      </div>
      {over && (
        <p className="text-xs font-medium tabular-nums">
          {formatCurrency(spent - cap)} acima do teto
        </p>
      )}
    </div>
  )
}
