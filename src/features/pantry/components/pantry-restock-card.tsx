"use client"

import { Archive } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { toast } from "sonner"
import { restockPantryAction } from "@/actions/pantry.actions"
import { Button } from "@/components/ui/button"

const PREVIEW_COUNT = 4

type PantryRestockCardProps = {
  householdId: string
  productNames: string[]
}

/** Card na home de listas: itens da despensa abaixo do mínimo, com reposição em um toque. */
export function PantryRestockCard({ householdId, productNames }: PantryRestockCardProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const previewNames = productNames.slice(0, PREVIEW_COUNT)
  const restCount = productNames.length - previewNames.length

  function restock() {
    startTransition(async () => {
      const result = await restockPantryAction(householdId)
      if (!result.success) {
        toast.error(result.error)
        return
      }
      toast.success(
        `${result.data.added} ${result.data.added === 1 ? "item adicionado" : "itens adicionados"} à lista`,
      )
      router.push(`/dashboard/lists/${result.data.listId}`)
    })
  }

  return (
    <div className="flex items-start gap-3 rounded-2xl bg-card p-4 ring-1 ring-border/70">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-400">
        <Archive className="size-5" />
      </span>
      <div className="min-w-0 flex-1 space-y-2">
        <div>
          <p className="text-sm font-medium">
            {productNames.length === 1
              ? "1 item em falta na despensa"
              : `${productNames.length} itens em falta na despensa`}
          </p>
          <p className="text-xs text-muted-foreground">
            {previewNames.join(", ")}
            {restCount > 0 && ` +${restCount}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={restock} loading={isPending}>
            Repor na lista
          </Button>
          <Link
            href="/dashboard/pantry"
            className="text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            Ver despensa
          </Link>
        </div>
      </div>
    </div>
  )
}
