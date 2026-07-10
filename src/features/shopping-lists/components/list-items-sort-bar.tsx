"use client"

import { useAtom, useSetAtom } from "jotai"
import { ShoppingCart } from "lucide-react"
import {
  hideCheckedItemsAtom,
  type ListItemsSortMode,
  listItemsSortModeAtom,
  marketModeAtom,
} from "@/lib/atoms"
import { cn } from "@/lib/utils"

const SORT_OPTIONS: Array<{ value: ListItemsSortMode; label: string }> = [
  { value: "category", label: "Categoria" },
  { value: "alphabetical", label: "A–Z" },
]

type ListItemsSortBarProps = {
  itemCount: number
  showMarketToggle?: boolean
}

export function ListItemsSortBar({ itemCount, showMarketToggle = false }: ListItemsSortBarProps) {
  const [sortMode, setSortMode] = useAtom(listItemsSortModeAtom)
  const [marketMode, setMarketMode] = useAtom(marketModeAtom)
  const setHideChecked = useSetAtom(hideCheckedItemsAtom)

  if (itemCount === 0) return null

  const marketActive = showMarketToggle && marketMode

  function toggleMarketMode() {
    const next = !marketMode
    setMarketMode(next)
    // Entrar no modo mercado colapsa os comprados para focar no que falta;
    // o usuário ainda pode expandir a seção manualmente.
    if (next) setHideChecked(true)
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-medium text-muted-foreground">Ordenar por</span>
      <fieldset className="m-0 flex gap-1.5 border-0 p-0" disabled={marketActive}>
        <legend className="sr-only">Ordenação da lista</legend>
        {SORT_OPTIONS.map((option) => (
          <SortChip
            key={option.value}
            label={option.label}
            active={marketActive ? option.value === "category" : sortMode === option.value}
            disabled={marketActive}
            onClick={() => setSortMode(option.value)}
          />
        ))}
      </fieldset>

      {showMarketToggle && (
        <button
          type="button"
          aria-pressed={marketMode}
          onClick={toggleMarketMode}
          className={cn(
            "ml-auto flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3 text-xs font-medium whitespace-nowrap outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:translate-y-px",
            marketMode
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/70",
          )}
        >
          <ShoppingCart className="size-3.5" />
          Modo mercado
        </button>
      )}
    </div>
  )
}

function SortChip({
  label,
  active,
  disabled = false,
  onClick,
}: {
  label: string
  active: boolean
  disabled?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex h-8 shrink-0 items-center rounded-full px-3 text-xs font-medium whitespace-nowrap outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:translate-y-px disabled:pointer-events-none disabled:opacity-50",
        active
          ? "bg-primary text-primary-foreground"
          : "bg-secondary text-secondary-foreground hover:bg-secondary/70",
      )}
    >
      {label}
    </button>
  )
}
