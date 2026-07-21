import { z } from "zod"

export const feedbackSchema = z.object({
  rating: z
    .number({ message: "Escolha de 1 a 5 estrelas" })
    .int("Escolha de 1 a 5 estrelas")
    .min(1, "Escolha de 1 a 5 estrelas")
    .max(5, "Escolha de 1 a 5 estrelas"),
  comment: z
    .string()
    .trim()
    .max(500, "Comentário deve ter no máximo 500 caracteres")
    .optional()
    .transform((value) => (value ? value : undefined)),
})

export type FeedbackValues = z.infer<typeof feedbackSchema>
