"use client"

import { Eye, EyeOff, Package, Pencil, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { toast } from "sonner"
import { deleteProductAction, toggleProductActiveAction } from "@/actions/product.actions"
import { ConfirmDialog } from "@/components/common/confirm-dialog"
import { EmptyState } from "@/components/common/empty-state"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AdminProductFormDialog } from "@/features/backoffice/components/admin-product-form-dialog"
import { categoryIcon } from "@/lib/category-icons"
import type { AdminCategoryDTO, AdminProductDTO } from "@/types/domain"

type AdminProductsListProps = {
  products: AdminProductDTO[]
  categories: AdminCategoryDTO[]
  search?: string
}

export function AdminProductsList({ products, categories, search }: AdminProductsListProps) {
  const router = useRouter()
  const [pendingDelete, setPendingDelete] = useState<AdminProductDTO | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleToggleActive(product: AdminProductDTO) {
    startTransition(async () => {
      const result = await toggleProductActiveAction(product.id, !product.active)
      if (!result.success) {
        toast.error(result.error)
        return
      }
      toast.success(product.active ? "Produto desativado" : "Produto ativado")
      router.refresh()
    })
  }

  function handleDelete() {
    if (!pendingDelete) return
    const target = pendingDelete

    startTransition(async () => {
      const result = await deleteProductAction(target.id)
      if (!result.success) {
        toast.error(result.error)
        return
      }
      toast.success(
        result.data.softDeleted ? "Produto desativado (está em uso)" : "Produto excluído",
      )
      setPendingDelete(null)
      router.refresh()
    })
  }

  if (products.length === 0) {
    return (
      <EmptyState
        icon={Package}
        title={search ? "Nenhum produto encontrado" : "Nenhum produto cadastrado"}
        description={
          search ? "Tente outro termo de busca." : "Cadastre o primeiro produto do catálogo."
        }
      />
    )
  }

  return (
    <>
      <div className="overflow-hidden rounded-2xl bg-card ring-1 ring-border/70">
        <ul className="divide-y divide-border/70">
          {products.map((product) => {
            const Icon = categoryIcon(product.categoryIcon)

            return (
              <li key={product.id} className="flex items-center gap-3 px-4 py-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                  <Icon className="size-5" />
                </span>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-sm font-medium">{product.name}</p>
                    <Badge variant={product.isGlobal ? "outline" : "secondary"}>
                      {product.isGlobal ? "Global" : "Grupo"}
                    </Badge>
                    {!product.active && <Badge variant="destructive">Inativo</Badge>}
                  </div>
                  <p className="truncate text-xs text-muted-foreground">
                    {product.categoryName ?? "Sem categoria"}
                    {product.householdName ? ` · ${product.householdName}` : ""}
                    {product.measureKind === "WEIGHT" ? " · por peso" : ""}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={product.active ? "Desativar produto" : "Ativar produto"}
                    disabled={isPending}
                    onClick={() => handleToggleActive(product)}
                  >
                    {product.active ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                  </Button>
                  <AdminProductFormDialog
                    categories={categories}
                    product={product}
                    trigger={
                      <Button variant="ghost" size="icon-sm" aria-label="Editar produto">
                        <Pencil className="size-4" />
                      </Button>
                    }
                  />
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Excluir produto"
                    onClick={() => setPendingDelete(product)}
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
        title="Excluir produto"
        description={
          pendingDelete?.inUse
            ? `O produto "${pendingDelete.name}" está em uso e será apenas desativado.`
            : `Tem certeza que deseja excluir "${pendingDelete?.name}"? Esta ação não pode ser desfeita.`
        }
        confirmLabel={pendingDelete?.inUse ? "Desativar" : "Excluir"}
        pending={isPending}
        onConfirm={handleDelete}
      />
    </>
  )
}
