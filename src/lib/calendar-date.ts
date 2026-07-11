const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/

/** Data de hoje no calendário local (YYYY-MM-DD). */
export function localDateString(date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

/**
 * Interpreta YYYY-MM-DD como data de calendário e grava meia-noite UTC. Assim a
 * leitura (calendarDateFromStored, via getUTC*) recupera o mesmo dia em
 * qualquer fuso de servidor — gravar meia-noite local quebraria o dia em
 * servidores com offset positivo (ex.: UTC+9).
 */
export function parseCalendarDate(dateStr: string): Date {
  if (!DATE_ONLY.test(dateStr)) {
    throw new Error("Data inválida")
  }
  const [year, month, day] = dateStr.split("-").map(Number)
  return new Date(Date.UTC(year, month - 1, day))
}

/**
 * Normaliza um instante do banco para a data de calendário pretendida.
 * Compras antigas foram salvas como meia-noite UTC (ex.: 2026-07-01T00:00:00Z).
 */
export function calendarDateFromStored(value: string | Date): Date {
  const date = typeof value === "string" ? new Date(value) : value
  return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
}

export function calendarMonthKey(value: string | Date): string {
  const date = calendarDateFromStored(value)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
}

export function currentCalendarMonthKey(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
}

export function formatCalendarDate(value: string | Date): string {
  return calendarDateFromStored(value).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

export function formatCalendarDateLong(value: string | Date): string {
  return calendarDateFromStored(value).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })
}
