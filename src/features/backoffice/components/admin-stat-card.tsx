import type { LucideIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

type AdminStatCardProps = {
  label: string
  value: string
  icon: LucideIcon
  hint?: string
}

export function AdminStatCard({ label, value, icon: Icon, hint }: AdminStatCardProps) {
  return (
    <Card className="ring-1 ring-border/70">
      <CardContent className="space-y-1">
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Icon className="size-3.5" />
          {label}
        </span>
        <span className="block font-heading text-xl font-semibold tabular-nums">{value}</span>
        {hint && <span className="block text-xs text-muted-foreground">{hint}</span>}
      </CardContent>
    </Card>
  )
}
