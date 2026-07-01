import { z } from "zod"

const measureKindSchema = z.enum(["UNIT", "WEIGHT", "VOLUME"])

export const createProductSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Nome deve ter pelo menos 2 caracteres")
      .max(60, "Nome deve ter no máximo 60 caracteres"),
    categoryId: z.string().trim().min(1).optional().or(z.literal("")),
    measureKind: measureKindSchema.default("UNIT"),
    defaultUnit: z.string().trim().max(20).optional().or(z.literal("")),
  })
  .superRefine((values, ctx) => {
    if (values.measureKind === "UNIT") return
    if (!values.defaultUnit?.trim()) {
      ctx.addIssue({
        code: "custom",
        message: "Informe a unidade",
        path: ["defaultUnit"],
      })
    }
  })

export type CreateProductValues = z.infer<typeof createProductSchema>
