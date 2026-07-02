"use client"

import { Package, Plus, Search } from "lucide-react"
import { useMemo, useState } from "react"
import { EmptyState } from "@/components/common/empty-state"
import { HorizontalScrollArea } from "@/components/common/horizontal-scroll-area"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AddPantryItemSheet } from "@/features/pantry/components/add-pantry-item-sheet"
import { AddToListSheet } from "@/features/pantry/components/add-to-list-sheet"
import { EditPantryItemDialog } from "@/features/pantry/components/edit-pantry-item-dialog"
import { PantryItemRow } from "@/features/pantry/components/pantry-item-row"
import { ALL_CATEGORIES } from "@/lib/categories"
import { cn } from "@/lib/utils"
import type { CategoryDTO, PantryItemDTO, PantryItemStatus, ProductDTO } from "@/types/domain"

export type ShoppingListOption = { id: string; name: string }

type StatusFilter = PantryItemStatus | "all"

const STATUS_FILTERS: Array<{ value: StatusFilter; label: string }> = [
  { value: "all", label: "Todos" },
  { value: "low_stock", label: "Estoque baixo" },
  { value: "out", label: "Acabou" },
  { value: "expiring_soon", label: "Validade próxima" },
  { value: "available", label: "Disponível" },
]

const UNCATEGORIZED = "Outros"

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim()
    .toLowerCase()
}

type PantryViewProps = {
  householdId: string
  items: PantryItemDTO[]
  catalog: ProductDTO[]
  categories: CategoryDTO[]
  lists: ShoppingListOption[]
}

export function PantryView({ householdId, items, catalog, categories, lists }: PantryViewProps) {
  const [query, setQuery] = useState("")
  const [status, setStatus] = useState<StatusFilter>("all")
  const [category, setCategory] = useState<string>(ALL_CATEGORIES)
  const [addOpen, setAddOpen] = useState(false)
  const [editItem, setEditItem] = useState<PantryItemDTO | null>(null)
  const [addToListItem, setAddToListItem] = useState<PantryItemDTO | null>(null)

  const usedCategories = useMemo(() => {
    const ids = new Set(items.map((item) => item.categoryId).filter(Boolean))
    return categories.filter((cat) => ids.has(cat.id))
  }, [items, categories])

  const filtered = useMemo(() => {
    const q = normalize(query)
    return items.filter((item) => {
      if (status !== "all" && item.status !== status) return false
      if (category !== ALL_CATEGORIES && item.categoryId !== category) return false
      if (q && !normalize(item.productName).includes(q)) return false
      return true
    })
  }, [items, query, status, category])

  const grouped = useMemo(() => {
    const groups = new Map<string, PantryItemDTO[]>()
    for (const item of filtered) {
      const key = item.categoryName?.trim() || UNCATEGORIZED
      const group = groups.get(key) ?? []
      group.push(item)
      groups.set(key, group)
    }
    return [...groups.entries()].sort((a, b) => {
      if (a[0] === UNCATEGORIZED) return 1
      if (b[0] === UNCATEGORIZED) return -1
      return a[0].localeCompare(b[0], "pt-BR")
    })
  }, [filtered])

  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-page-title">Despensa</h1>
          <p className="text-sm text-muted-foreground">O que você já tem em casa</p>
        </div>
        <Button onClick={() => setAddOpen(true)}>
          <Plus className="size-4" />
          Adicionar
        </Button>
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={Package}
          title="Sua despensa está vazia"
          description="Adicione o que você já tem em casa para controlar o estoque e saber o que está acabando."
          action={
            <Button onClick={() => setAddOpen(true)}>
              <Plus className="size-4" />
              Adicionar item
            </Button>
          }
        />
      ) : (
        <>
          <div className="space-y-3">
            <div className="relative">
              <Search className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-3 size-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar na despensa..."
                className="h-11 rounded-xl pl-9"
                aria-label="Buscar na despensa"
              />
            </div>

            <HorizontalScrollArea className="pb-1">
              {STATUS_FILTERS.map((option) => (
                <FilterChip
                  key={option.value}
                  label={option.label}
                  active={status === option.value}
                  onClick={() => setStatus(option.value)}
                />
              ))}
            </HorizontalScrollArea>

            {usedCategories.length > 0 && (
              <HorizontalScrollArea className="pb-1">
                <FilterChip
                  label="Todas"
                  active={category === ALL_CATEGORIES}
                  onClick={() => setCategory(ALL_CATEGORIES)}
                />
                {usedCategories.map((cat) => (
                  <FilterChip
                    key={cat.id}
                    label={cat.name}
                    active={category === cat.id}
                    onClick={() => setCategory(cat.id)}
                  />
                ))}
              </HorizontalScrollArea>
            )}
          </div>

          {grouped.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              Nenhum item encontrado com esses filtros.
            </p>
          ) : (
            <div className="space-y-6">
              {grouped.map(([categoryName, categoryItems]) => (
                <section key={categoryName} className="space-y-2">
                  <h2 className="text-section-label px-0.5">{categoryName}</h2>
                  <div className="divide-y divide-border/60 overflow-hidden rounded-2xl bg-card ring-1 ring-border/70">
                    {categoryItems.map((item) => (
                      <PantryItemRow
                        key={item.id}
                        item={item}
                        onEdit={setEditItem}
                        onAddToList={setAddToListItem}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </>
      )}

      <AddPantryItemSheet
        householdId={householdId}
        catalog={catalog}
        categories={categories}
        open={addOpen}
        onOpenChange={setAddOpen}
      />

      {editItem && (
        <EditPantryItemDialog
          item={editItem}
          open={editItem !== null}
          onOpenChange={(open) => !open && setEditItem(null)}
        />
      )}

      <AddToListSheet
        productId={addToListItem?.productId ?? null}
        productName={addToListItem?.productName ?? null}
        lists={lists}
        open={addToListItem !== null}
        onOpenChange={(open) => !open && setAddToListItem(null)}
      />
    </>
  )
}

function FilterChip({
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
      onClick={onClick}
      className={cn(
        "flex h-9 shrink-0 items-center rounded-full px-4 text-sm font-medium whitespace-nowrap outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:translate-y-px",
        active
          ? "bg-primary text-primary-foreground"
          : "bg-secondary text-secondary-foreground hover:bg-secondary/70",
      )}
    >
      {label}
    </button>
  )
}
