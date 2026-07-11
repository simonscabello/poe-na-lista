"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const items = [
  { href: "/dashboard/lists", label: "Listas" },
  { href: "/dashboard/pantry", label: "Despensa" },
  { href: "/dashboard/expenses", label: "Gastos" },
]

/** Navegação principal em telas sm+; no mobile a BottomNav cobre as mesmas rotas. */
export function HeaderNav() {
  const pathname = usePathname()

  return (
    <nav className="hidden items-center gap-1 sm:flex">
      {items.map((item) => {
        const isActive = pathname.startsWith(item.href)

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
