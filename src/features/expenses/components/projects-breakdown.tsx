import Link from "next/link"
import { formatCurrency } from "@/lib/format-currency"
import { cn } from "@/lib/utils"
import type { ProjectSummaryDTO } from "@/types/domain"

export function ProjectsBreakdown({ projects }: { projects: ProjectSummaryDTO[] }) {
  const maxSpent = Math.max(...projects.map((project) => project.spent), 1)

  return (
    <div className="space-y-3 rounded-2xl bg-card p-5 ring-1 ring-border/70">
      <p className="text-section-label">Projetos</p>
      <ul className="space-y-2.5">
        {projects.map((project) => {
          const cap = project.budgetCap
          const percent =
            cap != null && cap > 0
              ? Math.min(Math.round((project.spent / cap) * 100), 100)
              : Math.round((project.spent / maxSpent) * 100)
          const over = cap != null && project.spent > cap
          const warn = cap != null && !over && percent >= 80
          return (
            <li key={project.id} className="space-y-1">
              <div className="flex items-center justify-between gap-2 text-sm">
                <Link href={`/dashboard/lists/${project.id}`} className="truncate hover:underline">
                  {project.name}
                </Link>
                <span className="shrink-0 font-medium tabular-nums">
                  {formatCurrency(project.spent)}
                  {cap != null && (
                    <span className="font-normal text-muted-foreground">
                      {" "}
                      / {formatCurrency(cap)}
                    </span>
                  )}
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className={cn(
                    "h-full rounded-full",
                    over ? "bg-destructive" : warn ? "bg-warning" : "bg-primary",
                  )}
                  style={{ width: `${Math.max(percent, 2)}%` }}
                />
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
