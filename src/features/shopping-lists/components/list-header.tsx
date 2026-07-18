"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft, Copy, Megaphone, MoreVertical, Pencil, Share2, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import {
  deleteListAction,
  duplicateListAction,
  nudgeListAction,
  renameListAction,
} from "@/actions/shopping-list.actions"
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
import {
  type ShoppingListNameValues,
  shoppingListNameSchema,
} from "@/features/shopping-lists/schemas"

type ListHeaderProps = {
  listId: string
  name: string
  /** Mostra "Avisar o grupo" (só em listas ativas). */
  canNudge?: boolean
  onShare?: () => void
}

export function ListHeader({ listId, name, canNudge = false, onShare }: ListHeaderProps) {
  const router = useRouter()
  const [renameOpen, setRenameOpen] = useState(false)
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const form = useForm<ShoppingListNameValues>({
    resolver: zodResolver(shoppingListNameSchema),
    defaultValues: { name },
  })

  async function onRename(values: ShoppingListNameValues) {
    const result = await renameListAction(listId, values)
    if (!result.success) {
      toast.error(result.error)
      return
    }
    setRenameOpen(false)
    toast.success("Lista renomeada")
    router.refresh()
  }

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteListAction(listId)
      if (!result.success) {
        toast.error(result.error)
        return
      }
      setConfirmDeleteOpen(false)
      toast.success("Lista excluída")
      router.push("/dashboard/lists")
    })
  }

  function handleDuplicate() {
    startTransition(async () => {
      const result = await duplicateListAction(listId)
      if (!result.success) {
        toast.error(result.error)
        return
      }
      toast.success("Lista duplicada")
      router.push(`/dashboard/lists/${result.data.id}`)
    })
  }

  function handleNudge() {
    startTransition(async () => {
      const result = await nudgeListAction(listId)
      if (!result.success) {
        toast.error(result.error)
        return
      }
      toast.success("Grupo avisado — todos recebem o convite para olhar a lista")
    })
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Voltar"
        onClick={() => router.push("/dashboard/lists")}
      >
        <ArrowLeft className="size-4" />
      </Button>
      <h1 className="text-page-title min-w-0 flex-1 truncate text-xl sm:text-2xl">{name}</h1>

      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" size="icon-sm" aria-label="Opções">
                <MoreVertical className="size-4" />
              </Button>
            }
          />
          <DropdownMenuContent align="end">
            {canNudge && (
              <DropdownMenuItem disabled={isPending} onClick={handleNudge}>
                <Megaphone className="size-4" />
                Avisar o grupo
              </DropdownMenuItem>
            )}
            {onShare && (
              <DropdownMenuItem onClick={onShare}>
                <Share2 className="size-4" />
                Compartilhar lista
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => setRenameOpen(true)}>
              <Pencil className="size-4" />
              Renomear
            </DropdownMenuItem>
            <DropdownMenuItem disabled={isPending} onClick={handleDuplicate}>
              <Copy className="size-4" />
              Duplicar
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              disabled={isPending}
              onClick={() => setConfirmDeleteOpen(true)}
            >
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

      <ConfirmDialog
        open={confirmDeleteOpen}
        onOpenChange={setConfirmDeleteOpen}
        title="Excluir lista"
        description={`Tem certeza que deseja excluir "${name}"? Essa ação não pode ser desfeita.`}
        pending={isPending}
        onConfirm={handleDelete}
      />
    </div>
  )
}
