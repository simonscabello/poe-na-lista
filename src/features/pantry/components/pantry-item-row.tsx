"use client"

import { ListPlus, MoreVertical, PackageX, Pencil, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { toast } from "sonner"
import { removePantryItemAction, setPantryItemQuantityAction } from "@/actions/pantry.actions"
import { QuantityStepper } from "@/components/common/quantity-stepper"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { PantryStatusBadge } from "@/features/pantry/components/pantry-status-badge"
import { productEmoji } from "@/lib/categories"
import type { PantryItemDTO } from "@/types/domain"

function formatQuantity(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(2).replace(/\.?0+$/, "")
}

type PantryItemRowProps = {
  item: PantryItemDTO
  onEdit: (item: PantryItemDTO) => void
  onAddToList: (item: PantryItemDTO) => void
}

export function PantryItemRow({ item, onEdit, onAddToList }: PantryItemRowProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function changeQuantity(next: number) {
    startTransition(async () => {
      const result = await setPantryItemQuantityAction(item.id, Math.max(0, next))
      if (!result.success) {
        toast.error(result.error)
        return
      }
      router.refresh()
    })
  }

  function remove() {
    startTransition(async () => {
      const result = await removePantryItemAction(item.id)
      if (!result.success) {
        toast.error(result.error)
        return
      }
      toast.success("Item removido da despensa")
      router.refresh()
    })
  }

  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted text-xl">
        {productEmoji(item.productName, item.categoryName)}
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{item.productName}</p>
        <div className="mt-1 flex items-center gap-2">
          <PantryStatusBadge status={item.status} />
          <span className="text-xs text-muted-foreground tabular-nums">
            mín. {formatQuantity(item.minimumQuantity)}
            {item.unit ? ` ${item.unit}` : ""}
          </span>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <QuantityStepper
          count={Number(formatQuantity(item.quantity))}
          name={item.productName}
          size="md"
          onAdd={() => changeQuantity(item.quantity + 1)}
          onRemove={() => changeQuantity(item.quantity - 1)}
        />

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Opções do item"
                disabled={isPending}
              >
                <MoreVertical className="size-4" />
              </Button>
            }
          />
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onAddToList(item)}>
              <ListPlus className="size-4" />
              Adicionar à lista
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(item)}>
              <Pencil className="size-4" />
              Editar
            </DropdownMenuItem>
            {item.quantity > 0 && (
              <DropdownMenuItem onClick={() => changeQuantity(0)}>
                <PackageX className="size-4" />
                Marcar como acabou
              </DropdownMenuItem>
            )}
            <DropdownMenuItem variant="destructive" onClick={remove}>
              <Trash2 className="size-4" />
              Remover
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
