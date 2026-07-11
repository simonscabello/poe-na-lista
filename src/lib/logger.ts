/**
 * Logger estruturado mínimo (JSON no stdout) para o servidor. Centraliza o
 * ponto de saída para que, no futuro, dê para plugar um coletor (Sentry/OTel)
 * sem tocar em cada call site. Nunca deve lançar.
 */
type LogLevel = "info" | "warn" | "error"

function emit(level: LogLevel, message: string, context?: Record<string, unknown>): void {
  try {
    const entry = {
      level,
      message,
      time: new Date().toISOString(),
      ...context,
    }
    const line = JSON.stringify(entry)
    if (level === "error") {
      console.error(line)
    } else if (level === "warn") {
      console.warn(line)
    } else {
      console.info(line)
    }
  } catch {
    // Logging nunca pode quebrar o fluxo de negócio.
  }
}

function serializeError(error: unknown): Record<string, unknown> {
  if (error instanceof Error) {
    return { name: error.name, error: error.message, stack: error.stack }
  }
  return { error: String(error) }
}

export const logger = {
  info: (message: string, context?: Record<string, unknown>) => emit("info", message, context),
  warn: (message: string, context?: Record<string, unknown>) => emit("warn", message, context),
  error: (message: string, error?: unknown, context?: Record<string, unknown>) =>
    emit("error", message, { ...(error ? serializeError(error) : {}), ...context }),
}
