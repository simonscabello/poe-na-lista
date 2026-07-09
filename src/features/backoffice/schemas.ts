import { z } from "zod"
import { CATEGORY_ICON_NAMES } from "@/lib/category-icons"

const measureKindSchema = z.enum(["UNIT", "WEIGHT"])

export const categorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(40, "Nome deve ter no máximo 40 caracteres"),
  icon: z
    .string()
    .trim()
    .refine((value) => value === "" || CATEGORY_ICON_NAMES.includes(value), "Ícone inválido")
    .optional()
    .or(z.literal("")),
  sortOrder: z.number().int("Ordem inválida").min(0, "Ordem inválida").default(0),
  active: z.boolean().default(true),
})

export type CategoryInput = z.input<typeof categorySchema>
export type CategoryValues = z.output<typeof categorySchema>

export const adminProductSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Nome deve ter pelo menos 2 caracteres")
      .max(60, "Nome deve ter no máximo 60 caracteres"),
    categoryId: z.string().trim().min(1).optional().or(z.literal("")),
    measureKind: measureKindSchema.default("UNIT"),
    defaultUnit: z.string().trim().max(20).optional().or(z.literal("")),
    pricedByWeight: z.boolean().default(false),
    isGlobal: z.boolean().default(true),
    active: z.boolean().default(true),
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

export type AdminProductInput = z.input<typeof adminProductSchema>
export type AdminProductValues = z.output<typeof adminProductSchema>

export const mergeProductSchema = z.object({
  targetId: z.string().trim().min(1, "Selecione um produto global"),
})

export type MergeProductValues = z.infer<typeof mergeProductSchema>

export const globalStoreSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(60, "Nome deve ter no máximo 60 caracteres"),
  active: z.boolean().default(true),
})

export type GlobalStoreInput = z.input<typeof globalStoreSchema>
export type GlobalStoreValues = z.output<typeof globalStoreSchema>

export const renameHouseholdStoreSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(60, "Nome deve ter no máximo 60 caracteres"),
})

export type RenameHouseholdStoreValues = z.infer<typeof renameHouseholdStoreSchema>
