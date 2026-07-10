"use client"

import { Sparkles } from "lucide-react"
import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { toast } from "sonner"
import { createSuggestedListAction } from "@/actions/shopping-list.actions"
import { Button } from "@/components/ui/button"
import type { SuggestedProductDTO } from "@/types/domain"

type SuggestedListCardProps = {
  householdId: string
  items: SuggestedProductDTO[]
}

const PREVIEW_COUNT = 4

export function SuggestedListCard({ householdId, items }: SuggestedListCardProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const previewNames = items.slice(0, PREVIEW_COUNT).map((item) => item.productName)
  const restCount = items.length - previewNames.length

  function create() {
    startTransition(async () => {
      const result = await createSuggestedListAction(householdId)
      if (!result.success) {
        toast.error(result.error)
        return
      }
      toast.success("Lista da semana criada")
      router.push(`/dashboard/lists/${result.data.id}`)
    })
  }

  return (
    <div className="flex items-start gap-3 rounded-2xl bg-card p-4 ring-1 ring-border/70">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Sparkles className="size-5" />
      </span>
      <div className="min-w-0 flex-1 space-y-2">
        <div>
          <p className="text-sm font-medium">Sua lista de sempre</p>
          <p className="text-xs text-muted-foreground">
            {items.length} itens que você compra com frequência: {previewNames.join(", ")}
            {restCount > 0 && ` +${restCount}`}
          </p>
        </div>
        <Button size="sm" onClick={create} loading={isPending}>
          Criar lista
        </Button>
      </div>
    </div>
  )
}
