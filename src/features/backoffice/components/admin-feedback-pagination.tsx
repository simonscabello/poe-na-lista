import { ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

type AdminFeedbackPaginationProps = {
  page: number
  pageSize: number
  total: number
}

function buildFeedbackUrl(page: number) {
  return page > 1 ? `/backoffice/feedback?page=${page}` : "/backoffice/feedback"
}

export function AdminFeedbackPagination({ page, pageSize, total }: AdminFeedbackPaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const hasPrevious = page > 1
  const hasNext = page < totalPages

  if (totalPages <= 1) {
    return null
  }

  return (
    <div className="flex items-center justify-between gap-2">
      {hasPrevious ? (
        <Button variant="outline" size="sm" render={<Link href={buildFeedbackUrl(page - 1)} />}>
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
        <Button variant="outline" size="sm" render={<Link href={buildFeedbackUrl(page + 1)} />}>
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
