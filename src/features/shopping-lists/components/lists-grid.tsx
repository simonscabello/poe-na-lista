import { ListChecks } from "lucide-react"
import { EmptyState } from "@/components/common/empty-state"
import { ListCard } from "@/features/shopping-lists/components/list-card"
import type { ShoppingListSummary } from "@/types/domain"

type ListsGridProps = {
  lists: ShoppingListSummary[]
}

export function ListsGrid({ lists }: ListsGridProps) {
  if (lists.length === 0) {
    return (
      <EmptyState
        icon={ListChecks}
        title="Nenhuma lista ainda"
        description="Crie sua primeira lista de compras para começar."
      />
    )
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {lists.map((list) => (
        <ListCard key={list.id} list={list} />
      ))}
    </div>
  )
}
