"use client"

import { ListPlus } from "lucide-react"
import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { toast } from "sonner"
import { addItemAction } from "@/actions/shopping-list-item.actions"
import { EmptyState } from "@/components/common/empty-state"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import type { ShoppingListOption } from "@/features/pantry/components/pantry-view"

type AddToListSheetProps = {
  productId: string | null
  productName: string | null
  lists: ShoppingListOption[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddToListSheet({
  productId,
  productName,
  lists,
  open,
  onOpenChange,
}: AddToListSheetProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function addToList(listId: string) {
    if (!productId) return
    startTransition(async () => {
      const result = await addItemAction(listId, { productId, quantity: 1, unit: "", notes: "" })
      if (!result.success) {
        toast.error(result.error)
        return
      }
      toast.success(`${productName} adicionado à lista`)
      onOpenChange(false)
      router.refresh()
    })
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[80dvh] overflow-y-auto safe-bottom">
        <SheetHeader>
          <SheetTitle>Adicionar à lista</SheetTitle>
          <SheetDescription>Escolha em qual lista incluir {productName}.</SheetDescription>
        </SheetHeader>

        <div className="px-4 pb-6">
          {lists.length === 0 ? (
            <EmptyState
              icon={ListPlus}
              title="Nenhuma lista ativa"
              description="Crie uma lista de compras para adicionar produtos da despensa."
            />
          ) : (
            <ul className="space-y-1">
              {lists.map((list) => (
                <li key={list.id}>
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => addToList(list.id)}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors hover:bg-muted active:translate-y-px disabled:opacity-60"
                  >
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <ListPlus className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm font-medium">{list.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
