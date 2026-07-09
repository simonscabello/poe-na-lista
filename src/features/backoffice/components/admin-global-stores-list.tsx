"use client"

import { Pencil, Store, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { toast } from "sonner"
import { deleteGlobalStoreAction } from "@/actions/store.actions"
import { ConfirmDialog } from "@/components/common/confirm-dialog"
import { EmptyState } from "@/components/common/empty-state"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AdminGlobalStoreFormDialog } from "@/features/backoffice/components/admin-global-store-form-dialog"
import type { AdminGlobalStoreDTO } from "@/types/domain"

type AdminGlobalStoresListProps = {
  stores: AdminGlobalStoreDTO[]
  search?: string
}

export function AdminGlobalStoresList({ stores, search }: AdminGlobalStoresListProps) {
  const router = useRouter()
  const [pendingDelete, setPendingDelete] = useState<AdminGlobalStoreDTO | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    if (!pendingDelete) return
    const target = pendingDelete

    startTransition(async () => {
      const result = await deleteGlobalStoreAction(target.id)
      if (!result.success) {
        toast.error(result.error)
        return
      }
      toast.success(
        result.data.softDeleted
          ? "Loja desativada (grupos ainda usam este nome)"
          : "Loja excluída do catálogo",
      )
      setPendingDelete(null)
      router.refresh()
    })
  }

  if (stores.length === 0) {
    return (
      <EmptyState
        icon={Store}
        title={search ? "Nenhuma loja encontrada" : "Nenhuma loja no catálogo"}
        description={search ? "Tente outro termo de busca." : "Cadastre a primeira loja global."}
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
                  {!store.active && <Badge variant="secondary">Inativa</Badge>}
                </div>
                <p className="text-xs text-muted-foreground">
                  {store.householdUsageCount === 1
                    ? "1 grupo usa este nome"
                    : `${store.householdUsageCount} grupos usam este nome`}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <AdminGlobalStoreFormDialog
                  store={store}
                  trigger={
                    <Button variant="ghost" size="icon-sm" aria-label="Editar loja global">
                      <Pencil className="size-4" />
                    </Button>
                  }
                />
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Excluir loja global"
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
        title="Excluir loja global"
        description={
          pendingDelete && pendingDelete.householdUsageCount > 0
            ? `"${pendingDelete.name}" será apenas desativada porque ${pendingDelete.householdUsageCount} grupo(s) usam este nome.`
            : `Tem certeza que deseja excluir "${pendingDelete?.name}"?`
        }
        confirmLabel={
          pendingDelete && pendingDelete.householdUsageCount > 0 ? "Desativar" : "Excluir"
        }
        pending={isPending}
        onConfirm={handleDelete}
      />
    </>
  )
}
