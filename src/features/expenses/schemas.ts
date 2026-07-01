import { z } from "zod"

export const finalizePurchaseSchema = z.object({
  totalAmount: z.coerce.number().min(0).max(9999999, "Valor muito alto").optional(),
  purchasedAt: z.string().min(1, "Informe a data"),
  storeName: z.string().trim().max(80).optional().or(z.literal("")),
  notes: z.string().trim().max(300).optional().or(z.literal("")),
})

export const stockPantrySchema = z.object({
  items: z.array(
    z.object({
      productId: z.string().min(1),
      quantity: z.coerce.number().min(0).max(99999),
      unit: z.string().trim().max(20).optional().or(z.literal("")),
    }),
  ),
})

export type FinalizePurchaseValues = z.infer<typeof finalizePurchaseSchema>
export type StockPantryValues = z.infer<typeof stockPantrySchema>
