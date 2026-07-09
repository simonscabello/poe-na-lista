"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { type ReactNode, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { createAdminProductAction, updateProductAction } from "@/actions/product.actions"
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
  type AdminProductInput,
  type AdminProductValues,
  adminProductSchema,
} from "@/features/backoffice/schemas"
import { cn } from "@/lib/utils"
import type { AdminCategoryDTO, AdminProductDTO } from "@/types/domain"

type AdminProductFormDialogProps = {
  categories: AdminCategoryDTO[]
  product?: AdminProductDTO
  trigger: ReactNode
}

const selectClassName =
  "h-10 w-full min-w-0 rounded-lg border border-input bg-transparent px-3 py-1 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50"

export function AdminProductFormDialog({
  categories,
  product,
  trigger,
}: AdminProductFormDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const isEditing = Boolean(product)

  const form = useForm<AdminProductInput, unknown, AdminProductValues>({
    resolver: zodResolver(adminProductSchema),
    defaultValues: {
      name: product?.name ?? "",
      categoryId: product?.categoryId ?? "",
      measureKind: product?.measureKind ?? "UNIT",
      defaultUnit: product?.defaultUnit ?? "",
      pricedByWeight: product?.pricedByWeight ?? false,
      isGlobal: product?.isGlobal ?? true,
      active: product?.active ?? true,
    },
  })

  const measureKind = form.watch("measureKind")

  async function onSubmit(values: AdminProductValues) {
    const result = isEditing
      ? await updateProductAction(product?.id ?? "", values)
      : await createAdminProductAction(values)

    if (!result.success) {
      toast.error(result.error)
      return
    }

    toast.success(isEditing ? "Produto atualizado" : "Produto criado")
    setOpen(false)
    if (!isEditing) {
      form.reset()
    }
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger as React.ReactElement} />
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar produto" : "Novo produto"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Atualize os dados do produto." : "Cadastre um novo produto no catálogo."}
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
                    <Input placeholder="Leite integral" autoFocus {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria</FormLabel>
                  <FormControl>
                    <select className={selectClassName} {...field}>
                      <option value="">Sem categoria</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                          {category.active ? "" : " (inativa)"}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="measureKind"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de medida</FormLabel>
                  <FormControl>
                    <select className={selectClassName} {...field}>
                      <option value="UNIT">Unidade</option>
                      <option value="WEIGHT">Peso (kg)</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {measureKind === "WEIGHT" && (
              <FormField
                control={form.control}
                name="defaultUnit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unidade padrão</FormLabel>
                    <FormControl>
                      <Input placeholder="kg" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            {measureKind === "UNIT" && (
              <FormField
                control={form.control}
                name="pricedByWeight"
                render={({ field }) => (
                  <FormItem className="flex-row items-center gap-2.5">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(checked) => field.onChange(checked === true)}
                      />
                    </FormControl>
                    <FormLabel className={cn("!mt-0 font-normal")}>Precificado por peso</FormLabel>
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={form.control}
              name="isGlobal"
              render={({ field }) => (
                <FormItem className="flex-row items-center gap-2.5">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={(checked) => field.onChange(checked === true)}
                    />
                  </FormControl>
                  <FormLabel className="!mt-0 font-normal">
                    Produto global (catálogo oficial)
                  </FormLabel>
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
                  <FormLabel className="!mt-0 font-normal">Produto ativo</FormLabel>
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" loading={form.formState.isSubmitting}>
              {isEditing ? "Salvar alterações" : "Criar produto"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
