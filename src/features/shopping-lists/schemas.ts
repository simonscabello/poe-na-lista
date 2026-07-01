import { z } from "zod"

export const shoppingListNameSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(80, "Nome deve ter no máximo 80 caracteres"),
})

export const addItemSchema = z.object({
  productId: z.string().min(1, "Selecione um produto"),
  quantity: z.coerce.number().positive("Quantidade deve ser maior que zero").max(9999),
  unit: z.string().trim().max(20).optional().or(z.literal("")),
  notes: z.string().trim().max(200).optional().or(z.literal("")),
})

export const itemPriceSchema = z.object({
  price: z.coerce.number().min(0, "Preço inválido").max(999999).nullable(),
})

export type ShoppingListNameValues = z.infer<typeof shoppingListNameSchema>
export type AddItemValues = z.infer<typeof addItemSchema>
export type ItemPriceValues = z.infer<typeof itemPriceSchema>
