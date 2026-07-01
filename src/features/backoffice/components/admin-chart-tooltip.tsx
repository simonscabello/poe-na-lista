"use client"

type TooltipPayloadEntry = {
  name?: string
  value?: number | string
  color?: string
}

type AdminChartTooltipProps = {
  active?: boolean
  label?: string
  payload?: TooltipPayloadEntry[]
}

export function AdminChartTooltip({ active, label, payload }: AdminChartTooltipProps) {
  if (!active || !payload || payload.length === 0) {
    return null
  }

  return (
    <div className="rounded-lg bg-popover p-2.5 text-xs shadow-md ring-1 ring-border/70">
      <p className="mb-1.5 font-medium text-popover-foreground">{label}</p>
      <div className="space-y-1">
        {payload.map((entry) => (
          <div key={entry.name} className="flex items-center gap-2">
            <span
              className="h-0.5 w-3 shrink-0 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted-foreground">{entry.name}</span>
            <span className="ml-auto font-semibold tabular-nums text-popover-foreground">
              {entry.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
