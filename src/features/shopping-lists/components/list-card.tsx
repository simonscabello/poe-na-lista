"use client"

import { Check, Copy, MoreVertical, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { toast } from "sonner"
import { deleteListAction, duplicateListAction } from "@/actions/shopping-list.actions"
import { Button } from "@/components/ui/button"
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
import { ListCardIllustration } from "@/features/shopping-lists/components/list-card-illustration"
import { ListCardInviteButton } from "@/features/shopping-lists/components/list-card-invite-button"
import { ListCardMembers } from "@/features/shopping-lists/components/list-card-members"
import { cn } from "@/lib/utils"
import type { HouseholdMemberDTO, ShoppingListSummary } from "@/types/domain"

type ListCardProps = {
  list: ShoppingListSummary
  members: HouseholdMemberDTO[]
  householdId: string
  canInvite: boolean
}

export function ListCard({ list, members, householdId, canInvite }: ListCardProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [confirmOpen, setConfirmOpen] = useState(false)

  const pendingItems = list.totalItems - list.checkedItems
  const allDone = list.totalItems > 0 && pendingItems === 0
  const isCompleted = list.status === "COMPLETED"

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

  function handleDuplicate() {
    startTransition(async () => {
      const result = await duplicateListAction(list.id)
      if (!result.success) {
        toast.error(result.error)
        return
      }
      toast.success("Lista duplicada")
      router.push(`/dashboard/lists/${result.data.id}`)
    })
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
            <DropdownMenuItem disabled={isPending} onClick={handleDuplicate}>
              <Copy className="size-4" />
              Duplicar
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onClick={() => setConfirmOpen(true)}>
              <Trash2 className="size-4" />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="pointer-events-none relative z-[1] mt-2">
        <StatusBadge allDone={allDone} pendingItems={pendingItems} isCompleted={isCompleted} />
      </div>

      <div className="relative z-[1] mt-4 flex items-center justify-between gap-2">
        <div className="pointer-events-none">
          <ListCardMembers members={members} />
        </div>
        {canInvite && <ListCardInviteButton householdId={householdId} />}
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
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
    </article>
  )
}

function StatusBadge({
  allDone,
  pendingItems,
  isCompleted,
}: {
  allDone: boolean
  pendingItems: number
  isCompleted: boolean
}) {
  if (isCompleted) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-primary-foreground/20 px-2.5 py-1 text-xs font-medium">
        <Check className="size-3.5" />
        Finalizada
      </span>
    )
  }

  if (allDone) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-primary-foreground/20 px-2.5 py-1 text-xs font-medium">
        <Check className="size-3.5" />
        Tudo certo
      </span>
    )
  }

  return (
    <span className="inline-flex items-center rounded-full bg-primary-foreground/15 px-2.5 py-1 text-xs font-medium tabular-nums">
      {pendingItems === 0
        ? "Lista vazia"
        : `${pendingItems} ${pendingItems === 1 ? "item" : "itens"}`}
    </span>
  )
}
