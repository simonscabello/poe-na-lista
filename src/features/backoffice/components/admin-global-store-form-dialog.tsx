"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { type ReactNode, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { createGlobalStoreAction, updateGlobalStoreAction } from "@/actions/store.actions"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
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
  type GlobalStoreInput,
  type GlobalStoreValues,
  globalStoreSchema,
} from "@/features/backoffice/schemas"
import type { AdminGlobalStoreDTO } from "@/types/domain"

type AdminGlobalStoreFormDialogProps = {
  store?: AdminGlobalStoreDTO
  trigger: ReactNode
}

export function AdminGlobalStoreFormDialog({ store, trigger }: AdminGlobalStoreFormDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const isEditing = Boolean(store)

  const form = useForm<GlobalStoreInput, unknown, GlobalStoreValues>({
    resolver: zodResolver(globalStoreSchema),
    defaultValues: {
      name: store?.name ?? "",
      active: store?.active ?? true,
    },
  })

  async function onSubmit(values: GlobalStoreValues) {
    const result = isEditing
      ? await updateGlobalStoreAction(store?.id ?? "", values)
      : await createGlobalStoreAction(values)

    if (!result.success) {
      toast.error(result.error)
      return
    }

    toast.success(isEditing ? "Loja atualizada" : "Loja criada")
    setOpen(false)
    if (!isEditing) {
      form.reset({ name: "", active: true })
    }
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger as React.ReactElement} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar loja global" : "Nova loja global"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Atualize o nome canônico usado no catálogo oficial."
              : "Cadastre uma rede ou mercado reconhecido em todo o app."}
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
                    <Input placeholder="Carrefour" autoFocus {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="active"
              render={({ field }) => (
                <FormItem className="flex-row items-center gap-2.5">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={(checked) => field.onChange(checked === true)}
                    />
                  </FormControl>
                  <FormLabel className="!mt-0 font-normal">Loja ativa no catálogo</FormLabel>
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" loading={form.formState.isSubmitting}>
              {isEditing ? "Salvar alterações" : "Criar loja"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
