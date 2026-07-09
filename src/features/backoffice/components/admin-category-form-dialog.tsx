"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { type ReactNode, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { createCategoryAction, updateCategoryAction } from "@/actions/category.actions"
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
import { CategoryIconPicker } from "@/features/backoffice/components/category-icon-picker"
import {
  type CategoryInput,
  type CategoryValues,
  categorySchema,
} from "@/features/backoffice/schemas"
import type { AdminCategoryDTO } from "@/types/domain"

type AdminCategoryFormDialogProps = {
  category?: AdminCategoryDTO
  trigger: ReactNode
}

export function AdminCategoryFormDialog({ category, trigger }: AdminCategoryFormDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const isEditing = Boolean(category)

  const form = useForm<CategoryInput, unknown, CategoryValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: category?.name ?? "",
      icon: category?.icon ?? "",
      sortOrder: category?.sortOrder ?? 0,
      active: category?.active ?? true,
    },
  })

  async function onSubmit(values: CategoryValues) {
    const result = isEditing
      ? await updateCategoryAction(category?.id ?? "", values)
      : await createCategoryAction(values)

    if (!result.success) {
      toast.error(result.error)
      return
    }

    toast.success(isEditing ? "Categoria atualizada" : "Categoria criada")
    setOpen(false)
    if (!isEditing) {
      form.reset({ name: "", icon: "", sortOrder: 0, active: true })
    }
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger as React.ReactElement} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar categoria" : "Nova categoria"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Atualize os dados da categoria."
              : "Cadastre uma nova categoria de produtos."}
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
                    <Input placeholder="Laticínios" autoFocus {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="icon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ícone</FormLabel>
                  <FormControl>
                    <CategoryIconPicker
                      value={field.value ?? ""}
                      onChange={(icon) => field.onChange(icon)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="sortOrder"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ordem de exibição</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      name={field.name}
                      ref={field.ref}
                      onBlur={field.onBlur}
                      value={field.value ?? 0}
                      onChange={(event) => field.onChange(Number(event.target.value))}
                    />
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
                  <FormLabel className="!mt-0 font-normal">Categoria ativa</FormLabel>
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" loading={form.formState.isSubmitting}>
              {isEditing ? "Salvar alterações" : "Criar categoria"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
