import { ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

type AdminStoresPaginationProps = {
  page: number
  pageSize: number
  total: number
  search?: string
  tab: "global" | "household"
}

function buildStoresUrl(page: number, tab: "global" | "household", search?: string) {
  const params = new URLSearchParams()
  params.set("tab", tab)
  if (search) params.set("q", search)
  if (page > 1) params.set("page", String(page))
  return `/backoffice/stores?${params.toString()}`
}

export function AdminStoresPagination({
  page,
  pageSize,
  total,
  search,
  tab,
}: AdminStoresPaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const hasPrevious = page > 1
  const hasNext = page < totalPages

  if (totalPages <= 1) {
    return null
  }

  return (
    <div className="flex items-center justify-between gap-2">
      {hasPrevious ? (
        <Button
          variant="outline"
          size="sm"
          render={<Link href={buildStoresUrl(page - 1, tab, search)} />}
        >
          <ChevronLeft className="size-4" />
          Anterior
        </Button>
      ) : (
        <Button variant="outline" size="sm" disabled>
          <ChevronLeft className="size-4" />
          Anterior
        </Button>
      )}

      <span className="text-sm text-muted-foreground">
        Página {page} de {totalPages}
      </span>

      {hasNext ? (
        <Button
          variant="outline"
          size="sm"
          render={<Link href={buildStoresUrl(page + 1, tab, search)} />}
        >
          Próxima
          <ChevronRight className="size-4" />
        </Button>
      ) : (
        <Button variant="outline" size="sm" disabled>
          Próxima
          <ChevronRight className="size-4" />
        </Button>
      )}
    </div>
  )
}
