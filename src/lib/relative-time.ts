const relativeTimeFormatter = new Intl.RelativeTimeFormat("pt-BR", { numeric: "auto" })

const UNITS: { unit: Intl.RelativeTimeFormatUnit; seconds: number }[] = [
  { unit: "day", seconds: 86400 },
  { unit: "hour", seconds: 3600 },
  { unit: "minute", seconds: 60 },
]

export function formatRelativeTime(iso: string): string {
  const diffSeconds = (new Date(iso).getTime() - Date.now()) / 1000

  for (const { unit, seconds } of UNITS) {
    if (Math.abs(diffSeconds) >= seconds) {
      return relativeTimeFormatter.format(Math.round(diffSeconds / seconds), unit)
    }
  }

  return "agora"
}
