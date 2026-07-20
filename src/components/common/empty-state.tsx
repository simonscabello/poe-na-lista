import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

type EmptyStateProps = {
  icon: LucideIcon
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex animate-fade-up flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border/70 bg-card/50 px-6 py-16 text-center",
        className,
      )}
    >
      <div className="flex size-16 items-center justify-center rounded-full bg-gradient-to-br from-accent to-primary/15 ring-1 ring-primary/10">
        <Icon className="size-7 text-primary" strokeWidth={1.8} />
      </div>
      <div className="space-y-1">
        <p className="font-heading font-medium">{title}</p>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  )
}
