"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft, type LucideIcon, Search } from "lucide-react"
import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"
import { type Resolver, useForm } from "react-hook-form"
import { toast } from "sonner"
import { addPantryItemAction } from "@/actions/pantry.actions"
import { HorizontalScrollArea } from "@/components/common/horizontal-scroll-area"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { PantryItemFields } from "@/features/pantry/components/pantry-item-fields"
import { type UpdatePantryItemValues, updatePantryItemSchema } from "@/features/pantry/schemas"
import { ALL_CATEGORIES, productEmoji } from "@/lib/categories"
import { categoryIcon } from "@/lib/category-icons"
import { cn } from "@/lib/utils"
import type { CategoryDTO, ProductDTO } from "@/types/domain"

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim()
    .toLowerCase()
}

type AddPantryItemSheetProps = {
  householdId: string
  catalog: ProductDTO[]
  categories: CategoryDTO[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddPantryItemSheet({
  householdId,
  catalog,
  categories,
  open,
  onOpenChange,
}: AddPantryItemSheetProps) {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState<string>(ALL_CATEGORIES)
  const [selected, setSelected] = useState<ProductDTO | null>(null)

  const form = useForm<UpdatePantryItemValues>({
    resolver: zodResolver(updatePantryItemSchema) as Resolver<UpdatePantryItemValues>,
    defaultValues: { quantity: 1, minimumQuantity: 1, unit: "", expirationDate: "" },
  })

  const q = normalize(query)
  // A typed search is always global: while there's a query, ignore the browsed
  // category so results span every category.
  const effectiveCategory = q ? ALL_CATEGORIES : category

  const matches = useMemo(() => {
    return catalog
      .filter((product) => {
        if (effectiveCategory !== ALL_CATEGORIES && product.categoryId !== effectiveCategory) {
          return false
        }
        if (q && !normalize(product.name).includes(q)) return false
        return true
      })
      .slice(0, 40)
  }, [catalog, effectiveCategory, q])

  function selectCategory(id: string) {
    setCategory(id)
    setQuery("")
  }

  function reset() {
    setQuery("")
    setCategory(ALL_CATEGORIES)
    setSelected(null)
    form.reset({ quantity: 1, minimumQuantity: 1, unit: "", expirationDate: "" })
  }

  function handleOpenChange(next: boolean) {
    if (!next) reset()
    onOpenChange(next)
  }

  async function onSubmit(values: UpdatePantryItemValues) {
    if (!selected) return
    const result = await addPantryItemAction(householdId, { productId: selected.id, ...values })
    if (!result.success) {
      toast.error(result.error)
      return
    }
    toast.success(`${selected.name} na despensa`)
    reset()
    onOpenChange(false)
    router.refresh()
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent
        side="bottom"
        showCloseButton={false}
        className="gap-0 rounded-t-3xl p-0 data-[side=bottom]:max-h-[92dvh] sm:mx-auto sm:max-w-lg"
      >
        <div className="shrink-0 px-4 pt-3">
          <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-muted-foreground/25" />
          <div className="flex items-center gap-2">
            {selected && (
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Voltar"
                onClick={() => setSelected(null)}
              >
                <ArrowLeft className="size-4" />
              </Button>
            )}
            <h2 className="font-heading text-lg font-semibold tracking-tight">
              {selected ? selected.name : "Adicionar à despensa"}
            </h2>
          </div>
        </div>

        {selected ? (
          <div className="min-h-0 flex-1 overflow-y-auto px-4 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <PantryItemFields form={form} />
                <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                  Adicionar à despensa
                </Button>
              </form>
            </Form>
          </div>
        ) : (
          <>
            <div className="shrink-0 px-4 pt-3">
              <div className="relative">
                <Search className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-3 size-4 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Buscar produto..."
                  className="h-11 rounded-xl pl-9"
                  autoComplete="off"
                  aria-label="Buscar produto"
                />
              </div>

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
            <div className="min-h-0 flex-1 overflow-y-auto px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
              {matches.length === 0 ? (
                <p className="py-12 text-center text-sm text-muted-foreground">
                  Nenhum produto encontrado.
                </p>
              ) : (
                <ul className="space-y-1">
                  {matches.map((product) => (
                    <li key={product.id}>
                      <button
                        type="button"
                        onClick={() => setSelected(product)}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-muted active:translate-y-px"
                      >
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-xl">
                          {productEmoji(product.name, product.categoryName)}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium">{product.name}</span>
                          {product.categoryName && (
                            <span className="block truncate text-xs text-muted-foreground">
                              {product.categoryName}
                            </span>
                          )}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
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
