import { ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

type AdminModerationPaginationProps = {
  page: number
  pageSize: number
  total: number
  search?: string
  categoryId?: string
}

function buildModerationUrl(page: number, search?: string, categoryId?: string) {
  const params = new URLSearchParams()
  if (search) params.set("q", search)
  if (categoryId) params.set("categoryId", categoryId)
  if (page > 1) params.set("page", String(page))
  const query = params.toString()
  return query ? `/backoffice/moderation?${query}` : "/backoffice/moderation"
}

export function AdminModerationPagination({
  page,
  pageSize,
  total,
  search,
  categoryId,
}: AdminModerationPaginationProps) {
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
          render={<Link href={buildModerationUrl(page - 1, search, categoryId)} />}
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
          render={<Link href={buildModerationUrl(page + 1, search, categoryId)} />}
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
