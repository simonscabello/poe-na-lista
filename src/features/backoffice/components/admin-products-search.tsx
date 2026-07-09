import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { AdminCategoryDTO } from "@/types/domain"

type AdminProductsSearchProps = {
  categories: AdminCategoryDTO[]
  defaultValue?: string
  defaultCategoryId?: string
}

const selectClassName =
  "h-11 rounded-xl border border-input bg-transparent px-3 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 sm:w-48"

export function AdminProductsSearch({
  categories,
  defaultValue,
  defaultCategoryId,
}: AdminProductsSearchProps) {
  return (
    <form method="GET" className="flex flex-col gap-2 sm:flex-row">
      <div className="relative min-w-0 flex-1">
        <Search className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-3 size-4 text-muted-foreground" />
        <Input
          name="q"
          defaultValue={defaultValue}
          placeholder="Buscar por nome..."
          className="h-11 rounded-xl pl-9"
          aria-label="Buscar produtos"
        />
      </div>
      <select
        name="categoryId"
        defaultValue={defaultCategoryId ?? ""}
        className={selectClassName}
        aria-label="Filtrar por categoria"
      >
        <option value="">Todas as categorias</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>
      <Button type="submit" variant="outline" className="h-11 shrink-0">
        Buscar
      </Button>
    </form>
  )
}
