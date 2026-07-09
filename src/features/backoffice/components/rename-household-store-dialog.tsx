"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { type ReactNode, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { renameHouseholdStoreAction } from "@/actions/store.actions"
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
  type RenameHouseholdStoreValues,
  renameHouseholdStoreSchema,
} from "@/features/backoffice/schemas"
import type { AdminHouseholdStoreDTO } from "@/types/domain"

type RenameHouseholdStoreDialogProps = {
  store: AdminHouseholdStoreDTO
  trigger: ReactNode
}

export function RenameHouseholdStoreDialog({ store, trigger }: RenameHouseholdStoreDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  const form = useForm<RenameHouseholdStoreValues>({
    resolver: zodResolver(renameHouseholdStoreSchema),
    defaultValues: { name: store.name },
  })

  async function onSubmit(values: RenameHouseholdStoreValues) {
    const result = await renameHouseholdStoreAction(store.id, values)
    if (!result.success) {
      toast.error(result.error)
      return
    }
    toast.success("Loja renomeada")
    setOpen(false)
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger as React.ReactElement} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Renomear loja</DialogTitle>
          <DialogDescription>
            Grupo: {store.householdName}. Se houver match no catálogo global, o nome canônico será
            aplicado.
          </DialogDescription>
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
                    <Input autoFocus {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" loading={form.formState.isSubmitting}>
              Salvar
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
