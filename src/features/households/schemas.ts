import { z } from "zod"

export const householdNameSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(60, "Nome deve ter no máximo 60 caracteres"),
})

export type HouseholdNameValues = z.infer<typeof householdNameSchema>
