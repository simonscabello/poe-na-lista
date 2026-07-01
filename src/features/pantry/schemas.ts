import { z } from "zod"

export const pantryItemSchema = z.object({
  productId: z.string().min(1, "Selecione um produto"),
  quantity: z.coerce.number().min(0, "Quantidade inválida").max(99999),
  minimumQuantity: z.coerce.number().min(0, "Mínimo inválido").max(99999),
  unit: z.string().trim().max(20).optional().or(z.literal("")),
  expirationDate: z.string().trim().optional().or(z.literal("")),
})

export const updatePantryItemSchema = pantryItemSchema.omit({ productId: true })

export type PantryItemValues = z.infer<typeof pantryItemSchema>
export type UpdatePantryItemValues = z.infer<typeof updatePantryItemSchema>
