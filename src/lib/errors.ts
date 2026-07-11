import { ZodError } from "zod"
import { Prisma } from "@/generated/prisma/client"
import { logger } from "@/lib/logger"
import { AuthError, ForbiddenError } from "@/lib/permissions"

const GENERIC_MESSAGE = "Erro inesperado. Tente novamente."

/**
 * Traduz erros conhecidos do Prisma em mensagens seguras para o usuário. Nunca
 * repassamos a mensagem crua (ela vaza nomes de tabelas/colunas e detalhes
 * internos).
 */
function mapPrismaError(error: Prisma.PrismaClientKnownRequestError): string {
  switch (error.code) {
    case "P2002":
      return "Já existe um registro com esses dados."
    case "P2003":
      return "Operação bloqueada por um vínculo com outro registro."
    case "P2025":
      return "Registro não encontrado."
    default:
      return GENERIC_MESSAGE
  }
}

export function getActionErrorMessage(error: unknown): string {
  if (error instanceof ZodError) {
    return error.issues[0]?.message ?? "Dados inválidos"
  }

  // Erros de negócio esperados (permissão/autenticação) carregam mensagem
  // amigável e não precisam de log.
  if (error instanceof AuthError || error instanceof ForbiddenError) {
    return error.message
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    logger.error("Prisma known request error", error, { code: error.code })
    return mapPrismaError(error)
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    logger.error("Prisma validation error", error)
    return GENERIC_MESSAGE
  }

  // Erros lançados de propósito nos services (ex.: "Lista não encontrada")
  // trazem texto seguro; ainda assim registramos para diagnóstico.
  if (error instanceof Error) {
    logger.error("Action error", error)
    return error.message
  }

  logger.error("Unknown action error", error)
  return GENERIC_MESSAGE
}
