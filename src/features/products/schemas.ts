import { z } from "zod"

export const createProductSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(60, "Nome deve ter no máximo 60 caracteres"),
  categoryId: z.string().trim().min(1).optional().or(z.literal("")),
})

export type CreateProductValues = z.infer<typeof createProductSchema>
