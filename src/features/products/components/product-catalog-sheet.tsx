"use client"

import { Check, type LucideIcon, Plus, Search, X } from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"
import { toast } from "sonner"
import { createProductAction } from "@/actions/product.actions"
import { HorizontalScrollArea } from "@/components/common/horizontal-scroll-area"
import { QuantityStepper } from "@/components/common/quantity-stepper"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { ALL_CATEGORIES, productEmoji } from "@/lib/categories"
import { categoryIcon } from "@/lib/category-icons"
import { haptic } from "@/lib/haptics"
import { formatQuantity, getMeasureConfig, isMeasurableProduct } from "@/lib/measure"
import { cn } from "@/lib/utils"
import type { CategoryDTO, ProductDTO } from "@/types/domain"

type ProductCatalogSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  householdId: string
  catalog: ProductDTO[]
  frequent: ProductDTO[]
  categories: CategoryDTO[]
  /** productId → quantity currently in the list, for the live "in list" badge. */
  inList: Map<string, number>
  onAdd: (product: ProductDTO) => void
  onAddOne: (product: ProductDTO) => void
  onRemoveOne: (product: ProductDTO) => void
}

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim()
    .toLowerCase()
}

export function ProductCatalogSheet({
  open,
  onOpenChange,
  householdId,
  catalog,
  frequent,
  categories,
  inList,
  onAdd,
  onAddOne,
  onRemoveOne,
}: ProductCatalogSheetProps) {
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState<string>(ALL_CATEGORIES)
  const [created, setCreated] = useState<ProductDTO[]>([])
  const [isCreating, setIsCreating] = useState(false)
  const [createMeasureKind, setCreateMeasureKind] = useState<"UNIT" | "WEIGHT">("UNIT")
  const [createUnit, setCreateUnit] = useState("kg")
  const [createPricedByWeight, setCreatePricedByWeight] = useState(false)

  // Reset transient state each time the sheet opens so it always starts fresh.
  useEffect(() => {
    if (open) {
      setQuery("")
      setCategory(ALL_CATEGORIES)
      setCreateMeasureKind("UNIT")
      setCreatePricedByWeight(false)
    }
  }, [open])

  const fullCatalog = useMemo(() => {
    if (created.length === 0) return catalog
    const seen = new Set(catalog.map((p) => p.id))
    return [...created.filter((p) => !seen.has(p.id)), ...catalog]
  }, [catalog, created])

  const q = normalize(query)

  // A typed search is always global: while there's a query, ignore the browsed
  // category so results span every category. The selection is preserved and
  // restored as soon as the search is cleared.
  const searching = q.length > 0
  const effectiveCategory = searching ? ALL_CATEGORIES : category

  const matches = useMemo(() => {
    return fullCatalog.filter((product) => {
      if (effectiveCategory !== ALL_CATEGORIES && product.categoryId !== effectiveCategory) {
        return false
      }
      if (q && !normalize(product.name).includes(q)) return false
      return true
    })
  }, [fullCatalog, effectiveCategory, q])

  const activeCategoryName = useMemo(
    () => categories.find((c) => c.id === effectiveCategory)?.name ?? null,
    [categories, effectiveCategory],
  )

  const frequentMatches = useMemo(() => {
    if (effectiveCategory !== ALL_CATEGORIES) return []
    return frequent.filter((product) => !q || normalize(product.name).includes(q))
  }, [frequent, effectiveCategory, q])

  const trimmed = query.trim()
  const hasExactMatch = matches.some((p) => normalize(p.name) === q)
  const showCreate = trimmed.length >= 2 && !hasExactMatch

  const totalInList = useMemo(() => {
    let sum = 0
    for (const value of inList.values()) sum += value
    return sum
  }, [inList])

  function handleAdd(product: ProductDTO) {
    haptic("success")
    onAdd(product)
  }

  function handleAddOne(product: ProductDTO) {
    haptic("success")
    onAddOne(product)
  }

  function handleRemove(product: ProductDTO) {
    haptic("remove")
    onRemoveOne(product)
  }

  // Tapping a category chip is a browse intent, so it exits any active search.
  function selectCategory(id: string) {
    setCategory(id)
    setQuery("")
  }

  async function handleCreate() {
    if (isCreating) return
    setIsCreating(true)
    const result = await createProductAction(householdId, {
      name: trimmed,
      measureKind: createMeasureKind,
      defaultUnit: createMeasureKind === "UNIT" ? "" : createUnit,
      pricedByWeight: createMeasureKind === "UNIT" && createPricedByWeight,
    })
    setIsCreating(false)
    if (!result.success) {
      toast.error(result.error)
      return
    }
    setCreated((prev) => [result.data, ...prev])
    setQuery("")
    handleAdd(result.data)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        showCloseButton={false}
        className="gap-0 rounded-t-3xl p-0 data-[side=bottom]:h-[92dvh] data-[side=bottom]:max-h-[92dvh] data-[side=bottom]:min-h-[92dvh] sm:mx-auto sm:max-w-xl"
      >
        {/* Grabber + header */}
        <div className="shrink-0 px-4 pt-3">
          <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-muted-foreground/25" />
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h2 className="font-heading text-lg font-semibold tracking-tight">
                Adicionar produtos
              </h2>
              <p className="text-xs text-muted-foreground">
                {totalInList > 0
                  ? `${totalInList} ${totalInList === 1 ? "item" : "itens"} na lista`
                  : "Toque para adicionar"}
              </p>
            </div>
            <Button
              type="button"
              variant="secondary"
              aria-label="Concluir"
              onClick={() => onOpenChange(false)}
              className="h-9 rounded-full px-4"
            >
              Concluir
            </Button>
          </div>

          {/* Search */}
          <div className="relative mt-3">
            <Search className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-3 size-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar produto..."
              className="h-11 rounded-xl pr-9 pl-9"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              aria-label="Buscar produto"
            />
            {query && (
              <button
                type="button"
                aria-label="Limpar busca"
                onClick={() => setQuery("")}
                className="-translate-y-1/2 absolute top-1/2 right-2 flex size-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          {/* Category chips — fixed below search so the sheet height stays stable */}
          {categories.length > 0 && (
            <HorizontalScrollArea className="-mx-4 mt-3 pb-1">
              <CategoryChip
                label="Todos"
                active={effectiveCategory === ALL_CATEGORIES}
                onClick={() => selectCategory(ALL_CATEGORIES)}
              />
              {categories.map((item) => (
                <CategoryChip
                  key={item.id}
                  label={item.name}
                  icon={categoryIcon(item.icon)}
                  active={effectiveCategory === item.id}
                  onClick={() => selectCategory(item.id)}
                />
              ))}
            </HorizontalScrollArea>
          )}
        </div>

        {/* Scrollable content */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
          {/* Frequent strip */}
          {frequentMatches.length > 0 && (
            <section className="mb-4">
              <SectionTitle>Comprados recentemente</SectionTitle>
              <HorizontalScrollArea className="-mx-4 pb-1">
                {frequentMatches.map((product) => (
                  <FrequentPill
                    key={product.id}
                    product={product}
                    count={inList.get(product.id) ?? 0}
                    onAdd={handleAdd}
                    onAddOne={handleAddOne}
                    onRemove={handleRemove}
                  />
                ))}
              </HorizontalScrollArea>
            </section>
          )}

          {/* Product grid */}
          {matches.length > 0 && (
            <section>
              <SectionTitle>
                {effectiveCategory === ALL_CATEGORIES ? "Todos os produtos" : activeCategoryName}
              </SectionTitle>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {matches.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    count={inList.get(product.id) ?? 0}
                    showCategory={effectiveCategory === ALL_CATEGORIES}
                    onAdd={handleAdd}
                    onAddOne={handleAddOne}
                    onRemove={handleRemove}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Create-on-the-fly / empty state */}
          {showCreate && (
            <div className="mt-3 space-y-3 rounded-2xl border border-primary/30 border-dashed bg-primary/5 p-4">
              <div className="flex items-center gap-3">
                <span className="flex size-9 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <Plus className="size-5" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-medium">Criar "{trimmed}"</span>
                  <span className="block text-xs text-muted-foreground">
                    Adiciona um novo produto e inclui na lista
                  </span>
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    ["UNIT", "Unidade"],
                    ["WEIGHT", "Peso"],
                  ] as const
                ).map(([kind, label]) => (
                  <button
                    key={kind}
                    type="button"
                    onClick={() => {
                      setCreateMeasureKind(kind)
                      if (kind === "WEIGHT") {
                        setCreateUnit("kg")
                        setCreatePricedByWeight(false)
                      }
                    }}
                    className={cn(
                      "rounded-xl border px-3 py-2 text-sm font-medium transition-colors",
                      createMeasureKind === kind
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-card",
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {createMeasureKind === "WEIGHT" && (
                <Input
                  value={createUnit}
                  onChange={(event) => setCreateUnit(event.target.value)}
                  placeholder="kg, g..."
                  aria-label="Unidade padrão"
                />
              )}

              {createMeasureKind === "UNIT" && (
                <div className="flex items-start gap-2.5 rounded-xl border border-border bg-card p-3 text-sm">
                  <Checkbox
                    id="create-priced-by-weight"
                    checked={createPricedByWeight}
                    onCheckedChange={(checked) => setCreatePricedByWeight(checked === true)}
                    className="mt-0.5"
                  />
                  <Label htmlFor="create-priced-by-weight" className="flex-1 font-normal">
                    <span className="block font-medium">Preço varia por peso</span>
                    <span className="block text-xs text-muted-foreground">
                      Ex: hortifrúti. Você compra em unidades (ex: 3 cebolas), mas o preço exato só
                      é conhecido na balança do mercado.
                    </span>
                  </Label>
                </div>
              )}

              <Button type="button" loading={isCreating} onClick={handleCreate} className="w-full">
                Criar e adicionar
              </Button>
            </div>
          )}

          {matches.length === 0 && frequentMatches.length === 0 && !showCreate && (
            <p className="py-12 text-center text-sm text-muted-foreground">
              Nenhum produto encontrado.
            </p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-section-label mb-2 px-0.5">{children}</h3>
}

function CategoryChip({
  label,
  icon: Icon,
  active,
  onClick,
}: {
  label: string
  icon?: LucideIcon
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex h-9 shrink-0 items-center gap-1.5 rounded-full px-4 text-sm font-medium whitespace-nowrap outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:translate-y-px",
        active
          ? "bg-primary text-primary-foreground"
          : "bg-secondary text-secondary-foreground hover:bg-secondary/70",
      )}
    >
      {Icon && <Icon className="size-4" />}
      {label}
    </button>
  )
}

function FrequentPill({
  product,
  count,
  onAdd,
  onAddOne,
  onRemove,
}: {
  product: ProductDTO
  count: number
  onAdd: (product: ProductDTO) => void
  onAddOne: (product: ProductDTO) => void
  onRemove: (product: ProductDTO) => void
}) {
  const [pulse, triggerPulse] = useAddPulse()
  const measurable = isMeasurableProduct(product)
  const config = getMeasureConfig(product)
  function add() {
    triggerPulse()
    onAdd(product)
  }
  return (
    <div
      className={cn(
        "flex h-10 shrink-0 items-center rounded-full border bg-card pl-3 transition-all",
        count > 0 ? "pr-1" : "pr-4",
        pulse
          ? "scale-95 border-primary bg-primary/10"
          : count > 0
            ? "border-primary/40"
            : "border-border",
      )}
    >
      <button
        type="button"
        onClick={add}
        className="flex items-center gap-2 active:translate-y-px"
        aria-label={`Adicionar ${product.name}`}
      >
        <span className="text-base leading-none">
          {productEmoji(product.name, product.categoryName)}
        </span>
        <span className="text-sm font-medium whitespace-nowrap">{product.name}</span>
        {count === 0 && <Plus className="size-4 text-muted-foreground" />}
      </button>
      {count > 0 && (
        <div className="ml-1.5">
          <QuantityStepper
            count={count}
            onAdd={() => onAddOne(product)}
            onRemove={() => onRemove(product)}
            name={product.name}
            step={measurable ? config.step : 1}
            formatValue={
              measurable ? (value) => formatQuantity(value, product.defaultUnit) : undefined
            }
          />
        </div>
      )}
    </div>
  )
}

function ProductCard({
  product,
  count,
  showCategory,
  onAdd,
  onAddOne,
  onRemove,
}: {
  product: ProductDTO
  count: number
  showCategory: boolean
  onAdd: (product: ProductDTO) => void
  onAddOne: (product: ProductDTO) => void
  onRemove: (product: ProductDTO) => void
}) {
  const [pulse, triggerPulse] = useAddPulse()
  const measurable = isMeasurableProduct(product)
  const config = getMeasureConfig(product)
  function add() {
    triggerPulse()
    onAdd(product)
  }
  return (
    <div
      className={cn(
        "relative flex items-center gap-1 rounded-xl border bg-card p-2 transition-all duration-150",
        pulse ? "scale-[0.99] border-primary bg-primary/10" : "border-border",
        count > 0 && !pulse && "border-primary/40",
      )}
    >
      <button
        type="button"
        onClick={add}
        className="flex min-w-0 flex-1 items-center gap-2.5 rounded-lg py-0.5 text-left transition-colors active:translate-y-px"
        aria-label={`Adicionar ${product.name}`}
      >
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-xl">
          {productEmoji(product.name, product.categoryName)}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[0.875rem] font-medium leading-tight">
            {product.name}
          </span>
          {showCategory && product.categoryName && (
            <span className="mt-0.5 block truncate text-[0.7rem] text-muted-foreground leading-tight">
              {product.categoryName}
              {measurable && product.defaultUnit ? ` · ${product.defaultUnit}` : ""}
            </span>
          )}
        </span>
      </button>
      {count > 0 ? (
        <QuantityStepper
          count={count}
          onAdd={() => onAddOne(product)}
          onRemove={() => onRemove(product)}
          name={product.name}
          step={measurable ? config.step : 1}
          formatValue={
            measurable ? (value) => formatQuantity(value, product.defaultUnit) : undefined
          }
        />
      ) : (
        <button
          type="button"
          onClick={add}
          aria-label={`Adicionar ${product.name}`}
          className="flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary text-muted-foreground transition-colors hover:bg-secondary/70 active:translate-y-px"
        >
          {pulse ? <Check className="size-3.5" /> : <Plus className="size-3.5" />}
        </button>
      )}
    </div>
  )
}

/** Brief visual "added" feedback. Returns [active, trigger]. */
function useAddPulse(): [boolean, () => void] {
  const [pulse, setPulse] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current)
    }
  }, [])

  function trigger() {
    setPulse(true)
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => setPulse(false), 200)
  }

  return [pulse, trigger]
}
