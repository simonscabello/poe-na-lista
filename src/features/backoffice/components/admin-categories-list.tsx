"use client"

import { Pencil, Tags, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { toast } from "sonner"
import { deleteCategoryAction } from "@/actions/category.actions"
import { ConfirmDialog } from "@/components/common/confirm-dialog"
import { EmptyState } from "@/components/common/empty-state"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AdminCategoryFormDialog } from "@/features/backoffice/components/admin-category-form-dialog"
import { categoryIcon } from "@/lib/category-icons"
import type { AdminCategoryDTO } from "@/types/domain"

type AdminCategoriesListProps = {
  categories: AdminCategoryDTO[]
}

export function AdminCategoriesList({ categories }: AdminCategoriesListProps) {
  const router = useRouter()
  const [pendingDelete, setPendingDelete] = useState<AdminCategoryDTO | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    if (!pendingDelete) return
    const target = pendingDelete

    startTransition(async () => {
      const result = await deleteCategoryAction(target.id)
      if (!result.success) {
        toast.error(result.error)
        return
      }
      toast.success(
        result.data.softDeleted
          ? "Categoria desativada (possui produtos vinculados)"
          : "Categoria excluída",
      )
      setPendingDelete(null)
      router.refresh()
    })
  }

  if (categories.length === 0) {
    return (
      <EmptyState
        icon={Tags}
        title="Nenhuma categoria cadastrada"
        description="Crie a primeira categoria para organizar os produtos."
      />
    )
  }

  return (
    <>
      <div className="overflow-hidden rounded-2xl bg-card ring-1 ring-border/70">
        <ul className="divide-y divide-border/70">
          {categories.map((category) => {
            const Icon = categoryIcon(category.icon)

            return (
              <li key={category.id} className="flex items-center gap-3 px-4 py-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                  <Icon className="size-5" />
                </span>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium">{category.name}</p>
                    {!category.active && <Badge variant="secondary">Inativa</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {category.productCount === 1
                      ? "1 produto"
                      : `${category.productCount} produtos`}
                    {" · ordem "}
                    {category.sortOrder}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <AdminCategoryFormDialog
                    category={category}
                    trigger={
                      <Button variant="ghost" size="icon-sm" aria-label="Editar categoria">
                        <Pencil className="size-4" />
                      </Button>
                    }
                  />
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Excluir categoria"
                    onClick={() => setPendingDelete(category)}
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </div>
              </li>
            )
          })}
        </ul>
      </div>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title="Excluir categoria"
        description={
          pendingDelete && pendingDelete.productCount > 0
            ? `A categoria "${pendingDelete.name}" possui produtos vinculados e será apenas desativada.`
            : `Tem certeza que deseja excluir "${pendingDelete?.name}"? Esta ação não pode ser desfeita.`
        }
        confirmLabel={pendingDelete && pendingDelete.productCount > 0 ? "Desativar" : "Excluir"}
        pending={isPending}
        onConfirm={handleDelete}
      />
    </>
  )
}
