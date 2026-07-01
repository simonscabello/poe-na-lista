import type { LucideIcon } from "lucide-react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type AdminStatCardProps = {
  label: string
  value: string
  icon: LucideIcon
  hint?: string
  href?: string
}

export function AdminStatCard({ label, value, icon: Icon, hint, href }: AdminStatCardProps) {
  const card = (
    <Card
      className={cn("ring-1 ring-border/70", href && "transition-colors hover:ring-primary/40")}
    >
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

  if (href) {
    return (
      <Link href={href} className="block">
        {card}
      </Link>
    )
  }

  return card
}
