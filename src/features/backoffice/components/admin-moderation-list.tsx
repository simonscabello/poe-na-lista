"use client"

import { ClipboardCheck, Eye, EyeOff, Pencil } from "lucide-react"
import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { toast } from "sonner"
import { toggleProductActiveAction } from "@/actions/product.actions"
import { EmptyState } from "@/components/common/empty-state"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AdminProductFormDialog } from "@/features/backoffice/components/admin-product-form-dialog"
import { MergeProductDialog } from "@/features/backoffice/components/merge-product-dialog"
import { PromoteProductButton } from "@/features/backoffice/components/promote-product-button"
import { formatCalendarDate } from "@/lib/calendar-date"
import { categoryIcon } from "@/lib/category-icons"
import type { AdminCategoryDTO, AdminModerationProductDTO, AdminProductDTO } from "@/types/domain"

type AdminModerationListProps = {
  products: AdminModerationProductDTO[]
  categories: AdminCategoryDTO[]
  globalProducts: AdminProductDTO[]
  search?: string
}

export function AdminModerationList({
  products,
  categories,
  globalProducts,
  search,
}: AdminModerationListProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleToggleActive(product: AdminModerationProductDTO) {
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

  if (products.length === 0) {
    return (
      <EmptyState
        icon={ClipboardCheck}
        title={search ? "Nenhum produto encontrado" : "Nada para moderar"}
        description={
          search
            ? "Tente outro termo de busca."
            : "Produtos criados por grupos aparecerão aqui para revisão."
        }
      />
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl bg-card ring-1 ring-border/70">
      <ul className="divide-y divide-border/70">
        {products.map((product) => {
          const Icon = categoryIcon(product.categoryIcon)

          return (
            <li
              key={product.id}
              className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center"
            >
              <div className="flex min-w-0 flex-1 items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                  <Icon className="size-5" />
                </span>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-sm font-medium">{product.name}</p>
                    {!product.active && <Badge variant="destructive">Inativo</Badge>}
                    {product.usageCount > 0 && (
                      <Badge variant="outline">{product.usageCount} usos</Badge>
                    )}
                  </div>
                  <p className="truncate text-xs text-muted-foreground">
                    {product.categoryName ?? "Sem categoria"}
                    {product.householdName ? ` · ${product.householdName}` : ""}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {product.creatorName ?? product.creatorEmail ?? "Criador desconhecido"}
                    {" · "}
                    {formatCalendarDate(product.createdAt)}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-1 sm:shrink-0">
                <PromoteProductButton product={product} />
                <MergeProductDialog product={product} globalProducts={globalProducts} />
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
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
