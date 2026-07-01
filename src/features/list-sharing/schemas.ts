import { z } from "zod"

export const createShareSchema = z.object({
  expiresInDays: z.coerce.number().int().positive().max(365).nullable().optional(),
})

export type CreateShareValues = z.infer<typeof createShareSchema>
