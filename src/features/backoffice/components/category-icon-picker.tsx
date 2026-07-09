"use client"

import { CATEGORY_ICON_NAMES, categoryIcon } from "@/lib/category-icons"
import { cn } from "@/lib/utils"

type CategoryIconPickerProps = {
  value: string
  onChange: (icon: string) => void
}

export function CategoryIconPicker({ value, onChange }: CategoryIconPickerProps) {
  return (
    <div className="grid max-h-52 grid-cols-6 gap-2 overflow-y-auto rounded-lg border border-input p-2">
      {CATEGORY_ICON_NAMES.map((name) => {
        const Icon = categoryIcon(name)
        const isActive = value === name

        return (
          <button
            key={name}
            type="button"
            onClick={() => onChange(isActive ? "" : name)}
            aria-label={name}
            aria-pressed={isActive}
            className={cn(
              "flex aspect-square items-center justify-center rounded-md border transition-colors",
              isActive
                ? "border-primary bg-primary/10 text-primary"
                : "border-transparent text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon className="size-5" />
          </button>
        )
      })}
    </div>
  )
}
