"use client"

import { BarChart3, Users } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Container } from "@/components/layout/container"
import { cn } from "@/lib/utils"

const items = [
  { href: "/backoffice", label: "Visão geral", icon: BarChart3, exact: true },
  { href: "/backoffice/users", label: "Usuários", icon: Users, exact: false },
]

export function BackofficeNav() {
  const pathname = usePathname()

  return (
    <div className="border-b border-border/60 bg-background">
      <Container size="wide">
        <nav className="-mb-px flex gap-1 overflow-x-auto">
          {items.map((item) => {
            const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href)
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-sm font-medium whitespace-nowrap transition-colors",
                  isActive
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </Container>
    </div>
  )
}
