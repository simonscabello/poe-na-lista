"use client"

import { Check } from "lucide-react"
import Link from "next/link"
import { useOptimistic, useTransition } from "react"
import { toast } from "sonner"
import { togglePublicItemAction } from "@/actions/list-share.actions"
import { AppLogo } from "@/components/common/app-logo"
import { categoryEmoji } from "@/lib/categories"
import { haptic } from "@/lib/haptics"
import { cn } from "@/lib/utils"
import type { PublicListDTO, PublicListItemDTO } from "@/types/domain"

const UNCATEGORIZED = "Outros"

function groupByCategory(items: PublicListItemDTO[]): Array<[string, PublicListItemDTO[]]> {
  const groups = new Map<string, PublicListItemDTO[]>()
  for (const item of items) {
    const key = item.category?.trim() || UNCATEGORIZED
    const group = groups.get(key) ?? []
    group.push(item)
    groups.set(key, group)
  }

  return [...groups.entries()].sort((a, b) => {
    if (a[0] === UNCATEGORIZED) return 1
    if (b[0] === UNCATEGORIZED) return -1
    return a[0].localeCompare(b[0], "pt-BR")
  })
}

function formatQuantity(item: PublicListItemDTO): string | null {
  const showQuantity = item.quantity > 1 || (item.unit != null && item.unit !== "")
  if (!showQuantity) return null
  const value = Number.isInteger(item.quantity)
    ? String(item.quantity)
    : item.quantity.toFixed(2).replace(/\.?0+$/, "")
  return item.unit ? `${value} ${item.unit}` : value
}

export function PublicListView({ list, token }: { list: PublicListDTO; token: string }) {
  const [, startTransition] = useTransition()
  const [items, applyToggle] = useOptimistic(
    list.items,
    (state: PublicListItemDTO[], action: { id: string; checked: boolean }) =>
      state.map((item) => (item.id === action.id ? { ...item, checked: action.checked } : item)),
  )

  const groups = groupByCategory(items)
  const pendingCount = items.filter((item) => !item.checked).length

  function toggle(item: PublicListItemDTO) {
    startTransition(async () => {
      haptic("tap")
      applyToggle({ id: item.id, checked: !item.checked })
      const result = await togglePublicItemAction({
        token,
        itemId: item.id,
        checked: !item.checked,
      })
      if (!result.success) {
        toast.error(result.error)
      }
    })
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-col px-4 py-8">
      <header className="space-y-1">
        <h1 className="text-page-title text-2xl">{list.name}</h1>
        <p className="text-sm text-muted-foreground">
          {items.length === 0
            ? "Lista sem itens"
            : `${pendingCount} ${pendingCount === 1 ? "item para comprar" : "itens para comprar"}`}
        </p>
        {list.canCheck && items.length > 0 && (
          <p className="text-xs text-muted-foreground">
            Toque em um item para marcar como comprado — quem compartilhou vê na hora.
          </p>
        )}
      </header>

      <div className="mt-6 flex-1 space-y-6">
        {groups.map(([category, categoryItems]) => (
          <section key={category} className="space-y-2">
            <h2 className="text-section-label flex items-center gap-2">
              <span aria-hidden>{categoryEmoji(category)}</span>
              {category}
            </h2>
            <ul className="divide-y divide-border/60 overflow-hidden rounded-2xl bg-card ring-1 ring-border/70">
              {categoryItems.map((item) => {
                const quantity = formatQuantity(item)
                const content = (
                  <>
                    <span
                      className={cn(
                        "flex size-5 shrink-0 items-center justify-center rounded-full ring-1 transition-colors",
                        item.checked
                          ? "bg-primary text-primary-foreground ring-primary"
                          : "ring-border",
                      )}
                    >
                      {item.checked && <Check className="size-3.5" />}
                    </span>
                    <span
                      className={cn(
                        "flex-1 text-left text-sm",
                        item.checked && "text-muted-foreground line-through",
                      )}
                    >
                      {item.productName}
                    </span>
                    {quantity && (
                      <span className="shrink-0 text-xs font-medium text-muted-foreground tabular-nums">
                        {quantity}
                      </span>
                    )}
                  </>
                )

                return (
                  <li key={item.id}>
                    {list.canCheck ? (
                      <button
                        type="button"
                        onClick={() => toggle(item)}
                        aria-pressed={item.checked}
                        aria-label={
                          item.checked
                            ? `Desmarcar ${item.productName}`
                            : `Marcar ${item.productName} como comprado`
                        }
                        className="flex w-full items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/40 active:bg-muted/60"
                      >
                        {content}
                      </button>
                    ) : (
                      <div className="flex items-center gap-3 px-4 py-3">{content}</div>
                    )}
                  </li>
                )
              })}
            </ul>
          </section>
        ))}
      </div>

      <footer className="mt-10 flex flex-col items-center gap-2 border-t border-border/60 pt-6 text-center">
        <AppLogo />
        <p className="text-sm text-muted-foreground">Esta lista foi criada com o Põe na Lista.</p>
        <Link href="/" className="text-sm font-medium text-primary hover:underline">
          Organize e compartilhe suas compras
        </Link>
      </footer>
    </div>
  )
}
