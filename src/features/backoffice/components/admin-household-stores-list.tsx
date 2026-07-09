"use client"

import { Pencil, Store, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { toast } from "sonner"
import { deleteHouseholdStoreAction } from "@/actions/store.actions"
import { ConfirmDialog } from "@/components/common/confirm-dialog"
import { EmptyState } from "@/components/common/empty-state"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { RenameHouseholdStoreDialog } from "@/features/backoffice/components/rename-household-store-dialog"
import type { AdminHouseholdStoreDTO } from "@/types/domain"

type AdminHouseholdStoresListProps = {
  stores: AdminHouseholdStoreDTO[]
  search?: string
}

export function AdminHouseholdStoresList({ stores, search }: AdminHouseholdStoresListProps) {
  const router = useRouter()
  const [pendingDelete, setPendingDelete] = useState<AdminHouseholdStoreDTO | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    if (!pendingDelete) return
    const target = pendingDelete

    startTransition(async () => {
      const result = await deleteHouseholdStoreAction(target.id)
      if (!result.success) {
        toast.error(result.error)
        return
      }
      toast.success("Loja excluída")
      setPendingDelete(null)
      router.refresh()
    })
  }

  if (stores.length === 0) {
    return (
      <EmptyState
        icon={Store}
        title={search ? "Nenhuma loja encontrada" : "Nenhuma loja cadastrada"}
        description={
          search
            ? "Tente outro termo de busca."
            : "Lojas aparecem aqui quando grupos registram compras."
        }
      />
    )
  }

  return (
    <>
      <div className="overflow-hidden rounded-2xl bg-card ring-1 ring-border/70">
        <ul className="divide-y divide-border/70">
          {stores.map((store) => (
            <li key={store.id} className="flex items-center gap-3 px-4 py-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                <Store className="size-5" />
              </span>
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate text-sm font-medium">{store.name}</p>
                  {store.matchesGlobalStore && <Badge variant="outline">No catálogo</Badge>}
                </div>
                <p className="truncate text-xs text-muted-foreground">
                  {store.householdName}
                  {" · "}
                  {store.purchaseCount === 1 ? "1 compra" : `${store.purchaseCount} compras`}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <RenameHouseholdStoreDialog
                  store={store}
                  trigger={
                    <Button variant="ghost" size="icon-sm" aria-label="Renomear loja">
                      <Pencil className="size-4" />
                    </Button>
                  }
                />
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Excluir loja"
                  disabled={store.purchaseCount > 0}
                  onClick={() => setPendingDelete(store)}
                >
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title="Excluir loja"
        description={`Tem certeza que deseja excluir "${pendingDelete?.name}" do grupo ${pendingDelete?.householdName}?`}
        pending={isPending}
        onConfirm={handleDelete}
      />
    </>
  )
}
