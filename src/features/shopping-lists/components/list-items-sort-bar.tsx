"use client"

import { useAtom } from "jotai"
import { type ListItemsSortMode, listItemsSortModeAtom } from "@/lib/atoms"
import { cn } from "@/lib/utils"

const SORT_OPTIONS: Array<{ value: ListItemsSortMode; label: string }> = [
  { value: "category", label: "Categoria" },
  { value: "alphabetical", label: "A–Z" },
]

type ListItemsSortBarProps = {
  itemCount: number
}

export function ListItemsSortBar({ itemCount }: ListItemsSortBarProps) {
  const [sortMode, setSortMode] = useAtom(listItemsSortModeAtom)

  if (itemCount === 0) return null

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-medium text-muted-foreground">Ordenar por</span>
      <fieldset className="m-0 flex gap-1.5 border-0 p-0">
        <legend className="sr-only">Ordenação da lista</legend>
        {SORT_OPTIONS.map((option) => (
          <SortChip
            key={option.value}
            label={option.label}
            active={sortMode === option.value}
            onClick={() => setSortMode(option.value)}
          />
        ))}
      </fieldset>
    </div>
  )
}

function SortChip({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "flex h-8 shrink-0 items-center rounded-full px-3 text-xs font-medium whitespace-nowrap outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:translate-y-px",
        active
          ? "bg-primary text-primary-foreground"
          : "bg-secondary text-secondary-foreground hover:bg-secondary/70",
      )}
    >
      {label}
    </button>
  )
}
