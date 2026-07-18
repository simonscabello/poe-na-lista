"use client"

import { RotateCcw } from "lucide-react"
import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { toast } from "sonner"
import { createListFromPurchaseAction } from "@/actions/shopping-list.actions"
import { Button } from "@/components/ui/button"

/** Cria uma lista nova com os itens desta compra e leva o usuário até ela. */
export function BuyAgainButton({ purchaseId }: { purchaseId: string }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function buyAgain() {
    startTransition(async () => {
      const result = await createListFromPurchaseAction(purchaseId)
      if (!result.success) {
        toast.error(result.error)
        return
      }
      toast.success(
        result.data.skippedCount > 0
          ? `Lista criada — ${result.data.skippedCount} ${
              result.data.skippedCount === 1
                ? "item fora do catálogo ficou"
                : "itens fora do catálogo ficaram"
            } de fora`
          : "Lista criada com os itens desta compra",
      )
      router.push(`/dashboard/lists/${result.data.id}`)
    })
  }

  return (
    <Button variant="outline" size="sm" onClick={buyAgain} loading={isPending}>
      <RotateCcw className="size-4" />
      Comprar de novo
    </Button>
  )
}
