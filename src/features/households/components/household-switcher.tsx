"use client"

import { Check, ChevronsUpDown, Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { setActiveHouseholdAction } from "@/actions/active-household.actions"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { HouseholdSummary } from "@/types/domain"

type HouseholdSwitcherProps = {
  households: HouseholdSummary[]
  activeId: string
}

export function HouseholdSwitcher({ households, activeId }: HouseholdSwitcherProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const active = households.find((household) => household.id === activeId)

  function selectHousehold(householdId: string) {
    if (householdId === activeId) {
      return
    }
    startTransition(async () => {
      await setActiveHouseholdAction(householdId)
      router.refresh()
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="sm" className="max-w-[12rem] gap-1.5" disabled={isPending}>
            <span className="truncate font-medium">{active?.name ?? "Selecionar grupo"}</span>
            <ChevronsUpDown className="size-3.5 opacity-60" />
          </Button>
        }
      />
      <DropdownMenuContent align="start" className="w-56">
        {households.map((household) => (
          <DropdownMenuItem key={household.id} onClick={() => selectHousehold(household.id)}>
            <span className="truncate">{household.name}</span>
            {household.id === activeId && <Check className="ml-auto size-4" />}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push("/dashboard/household/new")}>
          <Plus className="size-4" />
          Novo grupo
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
