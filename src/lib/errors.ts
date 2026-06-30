import { ZodError } from "zod"
import { AuthError, ForbiddenError } from "@/lib/permissions"

export function getActionErrorMessage(error: unknown): string {
  if (error instanceof ZodError) {
    return error.issues[0]?.message ?? "Dados inválidos"
  }

  if (error instanceof AuthError || error instanceof ForbiddenError) {
    return error.message
  }

  if (error instanceof Error) {
    return error.message
  }

  return "Erro inesperado. Tente novamente."
}
