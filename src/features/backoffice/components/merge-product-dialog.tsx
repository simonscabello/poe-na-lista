"use client"

import { GitMerge, Search } from "lucide-react"
import { useRouter } from "next/navigation"
import { useMemo, useState, useTransition } from "react"
import { toast } from "sonner"
import { mergeProductAction } from "@/actions/product.actions"
import { ConfirmDialog } from "@/components/common/confirm-dialog"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { categoryIcon } from "@/lib/category-icons"
import { cn } from "@/lib/utils"
import type { AdminModerationProductDTO, AdminProductDTO } from "@/types/domain"

type MergeProductDialogProps = {
  product: AdminModerationProductDTO
  globalProducts: AdminProductDTO[]
}

export function MergeProductDialog({ product, globalProducts }: MergeProductDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [selectedTarget, setSelectedTarget] = useState<AdminProductDTO | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const filtered = useMemo(() => {
    const trimmed = query.trim().toLowerCase()
    if (!trimmed) return globalProducts.slice(0, 30)
    return globalProducts.filter((item) => item.name.toLowerCase().includes(trimmed)).slice(0, 30)
  }, [globalProducts, query])

  function handleMerge() {
    if (!selectedTarget) return

    startTransition(async () => {
      const result = await mergeProductAction(product.id, { targetId: selectedTarget.id })
      if (!result.success) {
        toast.error(result.error)
        return
      }
      toast.success(
        `"${product.name}" mesclado em "${selectedTarget.name}" (${result.data.itemsMoved} referências movidas)`,
      )
      setConfirmOpen(false)
      setOpen(false)
      setSelectedTarget(null)
      setQuery("")
      router.refresh()
    })
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger
          render={
            <Button variant="outline" size="sm">
              <GitMerge className="size-4" />
              Mesclar
            </Button>
          }
        />
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Mesclar em produto global</DialogTitle>
            <DialogDescription>
              Todas as referências de &quot;{product.name}&quot; serão transferidas para o produto
              global escolhido. O produto do grupo será removido.
            </DialogDescription>
          </DialogHeader>

          <div className="relative">
            <Search className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-3 size-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar no catálogo global..."
              className="pl-9"
              autoFocus
            />
          </div>

          <ul className="max-h-64 space-y-1 overflow-y-auto rounded-lg border border-border p-1">
            {filtered.length === 0 ? (
              <li className="px-3 py-6 text-center text-sm text-muted-foreground">
                Nenhum produto global encontrado
              </li>
            ) : (
              filtered.map((item) => {
                const Icon = categoryIcon(item.categoryIcon)
                const isSelected = selectedTarget?.id === item.id

                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedTarget(item)}
                      className={cn(
                        "flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm transition-colors",
                        isSelected ? "bg-primary/10 text-primary" : "hover:bg-muted",
                      )}
                    >
                      <Icon className="size-4 shrink-0 text-muted-foreground" />
                      <span className="min-w-0 flex-1 truncate">{item.name}</span>
                      {item.categoryName && (
                        <span className="shrink-0 text-xs text-muted-foreground">
                          {item.categoryName}
                        </span>
                      )}
                    </button>
                  </li>
                )
              })
            )}
          </ul>

          <Button
            className="w-full"
            disabled={!selectedTarget}
            onClick={() => setConfirmOpen(true)}
          >
            Continuar
          </Button>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Confirmar mesclagem"
        description={
          selectedTarget
            ? `Mesclar "${product.name}" em "${selectedTarget.name}"? Esta ação não pode ser desfeita.`
            : ""
        }
        confirmLabel="Mesclar"
        pending={isPending}
        onConfirm={handleMerge}
      />
    </>
  )
}
