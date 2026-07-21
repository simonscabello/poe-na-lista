import { z } from "zod"

const listNameField = z
  .string()
  .trim()
  .min(2, "Nome deve ter pelo menos 2 caracteres")
  .max(80, "Nome deve ter no máximo 80 caracteres")

export const shoppingListNameSchema = z.object({
  name: listNameField,
})

export const createListSchema = z.object({
  name: listNameField,
  kind: z.enum(["GROCERY", "PROJECT"]).default("GROCERY"),
  // Teto opcional; só é aplicado quando kind = PROJECT.
  budgetCap: z.coerce.number().positive("Valor inválido").max(9999999).nullish(),
})

export const listBudgetSchema = z.object({
  budgetCap: z.coerce.number().positive("Valor inválido").max(9999999).nullable(),
})

export const addItemSchema = z.object({
  productId: z.string().min(1, "Selecione um produto"),
  quantity: z.coerce.number().positive("Quantidade deve ser maior que zero").max(9999),
  unit: z.string().trim().max(20).optional().or(z.literal("")),
  notes: z.string().trim().max(200).optional().or(z.literal("")),
  priceMode: z.enum(["UNIT", "TOTAL"]).optional(),
})

export const itemPriceSchema = z.object({
  price: z.coerce.number().min(0, "Preço inválido").max(999999).nullable(),
  priceMode: z.enum(["UNIT", "TOTAL"]),
})

export type ShoppingListNameValues = z.infer<typeof shoppingListNameSchema>
export type CreateListValues = z.infer<typeof createListSchema>
export type ListBudgetValues = z.infer<typeof listBudgetSchema>
export type AddItemValues = z.infer<typeof addItemSchema>
export type ItemPriceValues = z.infer<typeof itemPriceSchema>
