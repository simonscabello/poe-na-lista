"use client"

import { Archive, ListChecks, Receipt, User } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const items = [
  { href: "/dashboard/lists", label: "Listas", icon: ListChecks, exact: false },
  { href: "/dashboard/pantry", label: "Despensa", icon: Archive, exact: false },
  { href: "/dashboard/expenses", label: "Gastos", icon: Receipt, exact: false },
  { href: "/dashboard/profile", label: "Perfil", icon: User, exact: false },
]

export function BottomNavFallback() {
  return (
    <nav
      aria-hidden
      className="sticky bottom-0 z-40 border-t bg-background/85 backdrop-blur-xl safe-bottom sm:hidden"
    >
      <div className="mx-auto grid max-w-md grid-cols-4">
        {items.map((item) => {
          const Icon = item.icon

          return (
            <div
              key={item.href}
              className="flex flex-col items-center gap-1 pt-2 pb-2.5 text-[11px] font-medium text-muted-foreground"
            >
              <span className="flex h-8 w-12 items-center justify-center rounded-full">
                <Icon className="size-5" strokeWidth={2} />
              </span>
              {item.label}
            </div>
          )
        })}
      </div>
    </nav>
  )
}

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="sticky bottom-0 z-40 border-t border-border/60 bg-background/90 backdrop-blur-xl safe-bottom sm:hidden">
      <div className="mx-auto grid max-w-md grid-cols-4">
        {items.map((item) => {
          const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href)
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex flex-col items-center gap-1 pt-2 pb-2.5 text-[11px] font-medium transition-colors duration-[var(--duration-normal)] active:scale-95",
                isActive ? "text-primary" : "text-muted-foreground",
              )}
            >
              <span
                className={cn(
                  "flex h-8 w-12 items-center justify-center rounded-full transition-colors duration-[var(--duration-normal)]",
                  isActive ? "bg-primary/10" : "bg-transparent",
                )}
              >
                <Icon className="size-5" strokeWidth={isActive ? 2.4 : 2} />
              </span>
              {item.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
