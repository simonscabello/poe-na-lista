"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { type Resolver, useForm } from "react-hook-form"
import { toast } from "sonner"
import { updatePantryItemAction } from "@/actions/pantry.actions"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Form } from "@/components/ui/form"
import { PantryItemFields } from "@/features/pantry/components/pantry-item-fields"
import { type UpdatePantryItemValues, updatePantryItemSchema } from "@/features/pantry/schemas"
import type { PantryItemDTO } from "@/types/domain"

function toDateInput(value: string | null): string {
  if (!value) return ""
  return value.slice(0, 10)
}

type EditPantryItemDialogProps = {
  item: PantryItemDTO
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditPantryItemDialog({ item, open, onOpenChange }: EditPantryItemDialogProps) {
  const router = useRouter()
  const form = useForm<UpdatePantryItemValues>({
    resolver: zodResolver(updatePantryItemSchema) as Resolver<UpdatePantryItemValues>,
    defaultValues: {
      quantity: item.quantity,
      minimumQuantity: item.minimumQuantity,
      unit: item.unit ?? "",
      expirationDate: toDateInput(item.expirationDate),
    },
  })

  async function onSubmit(values: UpdatePantryItemValues) {
    const result = await updatePantryItemAction(item.id, values)
    if (!result.success) {
      toast.error(result.error)
      return
    }
    toast.success("Item atualizado")
    onOpenChange(false)
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{item.productName}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <PantryItemFields form={form} />
            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              Salvar
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
