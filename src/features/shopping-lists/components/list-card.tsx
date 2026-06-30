"use client"

import { Check, MoreVertical, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { toast } from "sonner"
import { deleteListAction } from "@/actions/shopping-list.actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { ShoppingListSummary } from "@/types/domain"

type ListCardProps = {
  list: ShoppingListSummary
}

export function ListCard({ list }: ListCardProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const progress = list.totalItems > 0 ? Math.round((list.checkedItems / list.totalItems) * 100) : 0

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

  const isComplete = list.totalItems > 0 && list.checkedItems === list.totalItems

  return (
    <Card className="relative transition-all duration-[var(--duration-fast)] hover:bg-muted/40 active:scale-[0.99]">
      <CardHeader className="flex-row items-start justify-between gap-2">
        <button
          type="button"
          onClick={openList}
          aria-label={`Abrir lista ${list.name}`}
          className="min-w-0 flex-1 text-left after:absolute after:inset-0"
        >
          <CardTitle className="truncate">{list.name}</CardTitle>
        </button>

        <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Opções da lista"
                  className="relative z-10"
                >
                  <MoreVertical className="size-4" />
                </Button>
              }
            />
            <DropdownMenuContent align="end">
              <DropdownMenuItem variant="destructive" onClick={() => setConfirmOpen(true)}>
                <Trash2 className="size-4" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>Excluir lista</DialogTitle>
              <DialogDescription>
                Tem certeza que deseja excluir "{list.name}"? Essa ação não pode ser desfeita.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
              <Button variant="destructive" disabled={isPending} onClick={handleDelete}>
                Excluir
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>

      <CardContent>
        <div className="w-full space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="tabular-nums">
              {list.totalItems === 0
                ? "Lista vazia"
                : `${list.checkedItems} de ${list.totalItems} itens`}
            </span>
            {isComplete ? (
              <span className="inline-flex items-center gap-1 font-medium text-primary">
                <Check className="size-3.5" />
                Completa
              </span>
            ) : (
              list.totalItems > 0 && <span className="tabular-nums">{progress}%</span>
            )}
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-[var(--duration-normal)]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
