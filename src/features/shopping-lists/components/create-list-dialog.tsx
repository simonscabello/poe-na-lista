"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { createListAction } from "@/actions/shopping-list.actions"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  type ShoppingListNameValues,
  shoppingListNameSchema,
} from "@/features/shopping-lists/schemas"

type CreateListDialogProps = {
  householdId: string
}

export function CreateListDialog({ householdId }: CreateListDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const form = useForm<ShoppingListNameValues>({
    resolver: zodResolver(shoppingListNameSchema),
    defaultValues: { name: "" },
  })

  async function onSubmit(values: ShoppingListNameValues) {
    const result = await createListAction(householdId, values)
    if (!result.success) {
      toast.error(result.error)
      return
    }
    setOpen(false)
    form.reset()
    router.push(`/dashboard/lists/${result.data.id}`)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button>
            <Plus className="size-4" />
            Nova lista
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova lista</DialogTitle>
          <DialogDescription>Dê um nome para sua lista de compras.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="Compras da semana" autoFocus {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              Criar lista
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
