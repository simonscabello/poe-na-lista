"use client"

import { Archive, CalendarClock, ChevronDown, ListPlus, PackageX, Trash2, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { useOptimistic, useState, useTransition } from "react"
import { toast } from "sonner"
import {
  addPantryItemToListAction,
  removePantryItemAction,
  restockPantryAction,
  updatePantryItemAction,
} from "@/actions/pantry.actions"
import { EmptyState } from "@/components/common/empty-state"
import { QuantityStepper } from "@/components/common/quantity-stepper"
import { Container } from "@/components/layout/container"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { calendarDateFromStored, localDateString } from "@/lib/calendar-date"
import { categoryEmoji, productEmoji } from "@/lib/categories"
import { formatQuantity, getMeasureConfigForItem } from "@/lib/measure"
import { cn } from "@/lib/utils"
import type { PantryItemDTO } from "@/types/domain"

const UNCATEGORIZED = "Outros"
const EXPIRY_WARNING_DAYS = 3

/** Dias de calendário até a validade (negativo = vencido). */
function daysUntilExpiry(iso: string): number {
  const expiration = calendarDateFromStored(iso)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  return Math.round((expiration.getTime() - today.getTime()) / (24 * 60 * 60 * 1000))
}

function expiryBadge(days: number): { label: string; expired: boolean } {
  if (days < 0) return { label: "Vencido", expired: true }
  if (days === 0) return { label: "Vence hoje", expired: false }
  if (days === 1) return { label: "Vence amanhã", expired: false }
  return { label: `Vence em ${days} dias`, expired: false }
}

type PantryFilter = "all" | "low" | "expiring"

function isExpiring(item: PantryItemDTO): boolean {
  return (
    item.expirationDate != null &&
    item.quantity > 0 &&
    daysUntilExpiry(item.expirationDate) <= EXPIRY_WARNING_DAYS
  )
}

type OptimisticAction =
  | { type: "setQty"; id: string; quantity: number }
  | { type: "remove"; id: string }

function reducer(state: PantryItemDTO[], action: OptimisticAction): PantryItemDTO[] {
  switch (action.type) {
    case "setQty":
      return state.map((item) =>
        item.id === action.id
          ? {
              ...item,
              quantity: action.quantity,
              belowMinimum: action.quantity < item.minimumQuantity,
            }
          : item,
      )
    case "remove":
      return state.filter((item) => item.id !== action.id)
  }
}

export function PantryView({
  householdId,
  items: initialItems,
  restockCount,
}: {
  householdId: string
  items: PantryItemDTO[]
  restockCount: number
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [items, applyOptimistic] = useOptimistic(initialItems, reducer)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [filter, setFilter] = useState<PantryFilter>("all")

  const lowCount = items.filter((item) => item.belowMinimum).length
  const expiringCount = items.filter(isExpiring).length

  // Se o filtro ativo ficar vazio (ex.: tudo reposto), volta para "Todos".
  const activeFilter =
    (filter === "low" && lowCount === 0) || (filter === "expiring" && expiringCount === 0)
      ? "all"
      : filter
  const filteredItems =
    activeFilter === "low"
      ? items.filter((item) => item.belowMinimum)
      : activeFilter === "expiring"
        ? items.filter(isExpiring)
        : items

  const groups = new Map<string, PantryItemDTO[]>()
  for (const item of filteredItems) {
    const key = item.category?.trim() || UNCATEGORIZED
    const group = groups.get(key) ?? []
    group.push(item)
    groups.set(key, group)
  }
  const sortedGroups = [...groups.entries()].sort((a, b) => {
    if (a[0] === UNCATEGORIZED) return 1
    if (b[0] === UNCATEGORIZED) return -1
    return a[0].localeCompare(b[0], "pt-BR")
  })

  function changeQuantity(item: PantryItemDTO, nextQuantity: number) {
    const quantity = Math.max(nextQuantity, 0)
    startTransition(async () => {
      applyOptimistic({ type: "setQty", id: item.id, quantity })
      const result = await updatePantryItemAction(item.id, { quantity })
      if (!result.success) {
        toast.error(result.error)
        return
      }
      router.refresh()
    })
  }

  function changeMinimum(item: PantryItemDTO, nextMinimum: number) {
    startTransition(async () => {
      const result = await updatePantryItemAction(item.id, {
        minimumQuantity: Math.max(nextMinimum, 0),
      })
      if (!result.success) {
        toast.error(result.error)
        return
      }
      router.refresh()
    })
  }

  function changeExpiration(item: PantryItemDTO, value: string | null) {
    startTransition(async () => {
      const result = await updatePantryItemAction(item.id, { expirationDate: value })
      if (!result.success) {
        toast.error(result.error)
        return
      }
      router.refresh()
    })
  }

  function addToList(item: PantryItemDTO) {
    startTransition(async () => {
      const result = await addPantryItemToListAction(item.id)
      if (!result.success) {
        toast.error(result.error)
        return
      }
      toast.success(`${item.productName} adicionado à lista`)
    })
  }

  function remove(item: PantryItemDTO) {
    startTransition(async () => {
      applyOptimistic({ type: "remove", id: item.id })
      const result = await removePantryItemAction(item.id)
      if (!result.success) {
        toast.error(result.error)
        return
      }
      toast(`${item.productName} excluído da despensa`)
      router.refresh()
    })
  }

  function restock() {
    startTransition(async () => {
      const result = await restockPantryAction(householdId)
      if (!result.success) {
        toast.error(result.error)
        return
      }
      toast.success(
        `${result.data.added} ${result.data.added === 1 ? "item adicionado" : "itens adicionados"} à lista`,
      )
      router.push(`/dashboard/lists/${result.data.listId}`)
    })
  }

  return (
    <Container size="wide" className="space-y-6 py-6">
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-page-title">Despensa</h1>
          <p className="text-sm text-muted-foreground">
            {items.length === 0
              ? "O estoque da casa, atualizado a cada compra"
              : `${items.length} ${items.length === 1 ? "produto" : "produtos"}${lowCount > 0 ? ` · ${lowCount} em falta` : ""}`}
          </p>
        </div>
        {restockCount > 0 && (
          <Button onClick={restock} loading={isPending}>
            <ListPlus className="size-4" />
            Repor em falta
          </Button>
        )}
      </div>

      {items.length > 0 && (lowCount > 0 || expiringCount > 0) && (
        <div className="flex flex-wrap items-center gap-1.5">
          <FilterChip
            label="Todos"
            active={activeFilter === "all"}
            onClick={() => setFilter("all")}
          />
          {lowCount > 0 && (
            <FilterChip
              label={`Em falta · ${lowCount}`}
              active={activeFilter === "low"}
              onClick={() => setFilter("low")}
            />
          )}
          {expiringCount > 0 && (
            <FilterChip
              label={`Vencendo · ${expiringCount}`}
              active={activeFilter === "expiring"}
              onClick={() => setFilter("expiring")}
            />
          )}
        </div>
      )}

      {expiringCount > 0 && activeFilter !== "expiring" && (
        <button
          type="button"
          onClick={() => setFilter("expiring")}
          className="flex w-full items-center gap-2 rounded-xl bg-warning/10 px-4 py-3 text-left text-sm font-medium text-warning transition-colors hover:bg-warning/15"
        >
          <CalendarClock className="size-4 shrink-0" />
          <span className="min-w-0 flex-1">
            {expiringCount === 1
              ? "1 produto vencendo ou vencido."
              : `${expiringCount} produtos vencendo ou vencidos.`}
          </span>
          <span className="shrink-0 text-xs underline underline-offset-2">Ver itens</span>
        </button>
      )}

      {items.length === 0 ? (
        <EmptyState
          icon={Archive}
          title="Despensa vazia"
          description="Finalize uma compra e os itens entram aqui sozinhos. Depois é só ajustar o que for consumindo."
        />
      ) : (
        <div className="space-y-6">
          {sortedGroups.map(([category, categoryItems]) => (
            <section key={category} className="space-y-2">
              <h2 className="text-section-label flex items-center gap-2 px-1">
                <span aria-hidden>{categoryEmoji(category)}</span>
                {category}
              </h2>
              <ul className="overflow-hidden rounded-2xl bg-card ring-1 ring-border/70">
                {categoryItems.map((item) => (
                  <PantryItemRow
                    key={item.id}
                    item={item}
                    expanded={expandedId === item.id}
                    onToggleExpanded={() =>
                      setExpandedId((current) => (current === item.id ? null : item.id))
                    }
                    onChangeQuantity={changeQuantity}
                    onChangeMinimum={changeMinimum}
                    onChangeExpiration={changeExpiration}
                    onRemove={remove}
                    onAddToList={addToList}
                    isPending={isPending}
                  />
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </Container>
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

function PantryItemRow({
  item,
  expanded,
  onToggleExpanded,
  onChangeQuantity,
  onChangeMinimum,
  onChangeExpiration,
  onRemove,
  onAddToList,
  isPending,
}: {
  item: PantryItemDTO
  expanded: boolean
  onToggleExpanded: () => void
  onChangeQuantity: (item: PantryItemDTO, nextQuantity: number) => void
  onChangeMinimum: (item: PantryItemDTO, nextMinimum: number) => void
  onChangeExpiration: (item: PantryItemDTO, value: string | null) => void
  onRemove: (item: PantryItemDTO) => void
  onAddToList: (item: PantryItemDTO) => void
  isPending: boolean
}) {
  const measure = getMeasureConfigForItem(undefined, item.unit)
  const stepLabel = measure.step < 1 ? String(measure.step).replace(".", ",") : String(measure.step)
  const expiryDays = item.expirationDate != null ? daysUntilExpiry(item.expirationDate) : null
  const badge =
    expiryDays != null && expiryDays <= EXPIRY_WARNING_DAYS && item.quantity > 0
      ? expiryBadge(expiryDays)
      : null

  return (
    <li className="border-b last:border-b-0">
      <div className="flex items-center gap-3 px-3 py-3">
        <button
          type="button"
          onClick={onToggleExpanded}
          aria-expanded={expanded}
          aria-label={`Detalhes de ${item.productName}`}
          className="flex min-w-0 flex-1 items-center gap-2 py-1 text-left"
        >
          <ChevronDown
            className={cn(
              "size-4 shrink-0 text-muted-foreground transition-transform",
              !expanded && "-rotate-90",
            )}
          />
          <span
            aria-hidden
            className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-lg leading-none"
          >
            {productEmoji(item.productName, item.category)}
          </span>
          <span className="min-w-0">
            <span className="block break-words text-[0.95rem]">{item.productName}</span>
            {(item.belowMinimum || badge) && (
              <span className="mt-0.5 flex flex-wrap items-center gap-1.5">
                {item.belowMinimum && (
                  <span className="rounded-full bg-warning/15 px-2 py-0.5 text-[0.7rem] font-medium text-warning">
                    Em falta
                  </span>
                )}
                {badge && (
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[0.7rem] font-medium",
                      badge.expired
                        ? "bg-destructive/15 text-destructive"
                        : "bg-warning/15 text-warning",
                    )}
                  >
                    {badge.label}
                  </span>
                )}
              </span>
            )}
          </span>
        </button>

        <div className="flex shrink-0 items-center gap-1.5">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onAddToList(item)}
            disabled={isPending}
            aria-label={`Adicionar ${item.productName} à lista`}
            className="text-muted-foreground"
          >
            <ListPlus className="size-4" />
          </Button>
          <QuantityStepper
            count={item.quantity}
            name={item.productName}
            size="md"
            step={measure.step}
            formatValue={(value) => formatQuantity(value, item.unit)}
            removeLabel={`Consumir ${stepLabel} de ${item.productName}`}
            onAdd={() => onChangeQuantity(item, item.quantity + measure.step)}
            onRemove={() => onChangeQuantity(item, item.quantity - measure.step)}
          />
        </div>
      </div>

      {expanded && (
        <div className="space-y-4 border-t border-border/60 bg-muted/30 px-4 py-4">
          <div className="flex items-center justify-between gap-3">
            <Label className="text-sm">Estoque mínimo</Label>
            <QuantityStepper
              count={item.minimumQuantity}
              name={`mínimo de ${item.productName}`}
              size="sm"
              step={measure.step}
              formatValue={(value) => formatQuantity(value, item.unit)}
              onAdd={() => onChangeMinimum(item, item.minimumQuantity + measure.step)}
              onRemove={() => onChangeMinimum(item, item.minimumQuantity - measure.step)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`expiry-${item.id}`}>Validade</Label>
            <div className="flex items-center gap-2">
              <Input
                id={`expiry-${item.id}`}
                type="date"
                value={
                  item.expirationDate
                    ? localDateString(calendarDateFromStored(item.expirationDate))
                    : ""
                }
                onChange={(event) => onChangeExpiration(item, event.target.value || null)}
                className="max-w-44"
              />
              {item.expirationDate && (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Limpar validade"
                  onClick={() => onChangeExpiration(item, null)}
                  className="text-muted-foreground"
                >
                  <X className="size-4" />
                </Button>
              )}
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            O botão − registra consumo. Quando o estoque ficar abaixo do mínimo, o produto aparece
            como em falta. Excluir remove o produto da despensa por completo.
          </p>

          <div className="flex flex-wrap items-center gap-2">
            {item.quantity > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onChangeQuantity(item, 0)}
                disabled={isPending}
              >
                <PackageX className="size-4" />
                Acabou
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemove(item)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="size-4" />
              Excluir da despensa
            </Button>
          </div>
        </div>
      )}
    </li>
  )
}
