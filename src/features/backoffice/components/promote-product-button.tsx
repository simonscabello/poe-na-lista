"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { toast } from "sonner"
import { promoteProductAction } from "@/actions/product.actions"
import { ConfirmDialog } from "@/components/common/confirm-dialog"
import { Button } from "@/components/ui/button"
import type { AdminModerationProductDTO } from "@/types/domain"

type PromoteProductButtonProps = {
  product: AdminModerationProductDTO
}

export function PromoteProductButton({ product }: PromoteProductButtonProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handlePromote() {
    startTransition(async () => {
      const result = await promoteProductAction(product.id)
      if (!result.success) {
        toast.error(result.error)
        return
      }
      toast.success(`"${product.name}" promovido ao catálogo global`)
      setOpen(false)
      router.refresh()
    })
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        Promover
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Promover ao catálogo global"
        description={`"${product.name}" passará a fazer parte do catálogo oficial e ficará disponível para todos os grupos.`}
        confirmLabel="Promover"
        pending={isPending}
        onConfirm={handlePromote}
      />
    </>
  )
}
