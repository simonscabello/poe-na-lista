import { CreateListDialog } from "@/features/shopping-lists/components/create-list-dialog"
import { ListCard } from "@/features/shopping-lists/components/list-card"
import type { HouseholdMemberDTO, ShoppingListSummary } from "@/types/domain"

type ListsGridProps = {
  lists: ShoppingListSummary[]
  members: HouseholdMemberDTO[]
  householdId: string
  canInvite: boolean
}

export function ListsGrid({ lists, members, householdId, canInvite }: ListsGridProps) {
  if (lists.length === 0) {
    return <ListsEmptyState householdId={householdId} />
  }

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-4">
      {lists.map((list) => (
        <ListCard
          key={list.id}
          list={list}
          members={members}
          householdId={householdId}
          canInvite={canInvite}
        />
      ))}
    </div>
  )
}

function ListsEmptyState({ householdId }: { householdId: string }) {
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-5 rounded-2xl border border-dashed border-border/70 px-6 py-16 text-center">
      <div className="flex size-20 items-center justify-center rounded-full bg-primary/10">
        <svg
          viewBox="0 0 100 100"
          fill="none"
          aria-hidden="true"
          className="size-10 text-primary"
          stroke="currentColor"
          strokeWidth={5}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x={26} y={20} width={48} height={62} rx={8} />
          <path d="M38 40h24M38 54h24M38 68h14" />
        </svg>
      </div>
      <div className="space-y-1">
        <p className="font-medium">Nenhuma lista ainda</p>
        <p className="text-sm text-muted-foreground">
          Crie sua primeira lista de compras para começar.
        </p>
      </div>
      <CreateListDialog householdId={householdId} />
    </div>
  )
}
