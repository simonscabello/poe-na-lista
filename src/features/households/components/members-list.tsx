"use client"

import { Trash2 } from "lucide-react"
import { useTransition } from "react"
import { toast } from "sonner"
import { removeMemberAction } from "@/actions/household.actions"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { HouseholdRole } from "@/generated/prisma/enums"
import type { HouseholdMemberDTO } from "@/types/domain"

const roleLabel: Record<HouseholdRole, string> = {
  OWNER: "Dono",
  ADMIN: "Admin",
  MEMBER: "Membro",
}

const roleVariant: Record<HouseholdRole, "default" | "secondary" | "outline"> = {
  OWNER: "default",
  ADMIN: "secondary",
  MEMBER: "outline",
}

type MembersListProps = {
  householdId: string
  members: HouseholdMemberDTO[]
  canManage: boolean
}

export function MembersList({ householdId, members, canManage }: MembersListProps) {
  const [isPending, startTransition] = useTransition()

  function handleRemove(memberId: string) {
    startTransition(async () => {
      const result = await removeMemberAction(householdId, memberId)
      if (!result.success) {
        toast.error(result.error)
        return
      }
      toast.success("Membro removido")
    })
  }

  return (
    <ul className="divide-y">
      {members.map((member) => {
        const initials = (member.name ?? member.email ?? "U").slice(0, 1).toUpperCase()
        const canRemove = canManage && member.role !== HouseholdRole.OWNER

        return (
          <li key={member.id} className="flex items-center gap-3 py-3">
            <Avatar size="sm">
              {member.image && <AvatarImage src={member.image} alt={member.name ?? ""} />}
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{member.name ?? "Sem nome"}</p>
              <p className="truncate text-xs text-muted-foreground">{member.email}</p>
            </div>
            <Badge variant={roleVariant[member.role]}>{roleLabel[member.role]}</Badge>
            {canRemove && (
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Remover membro"
                disabled={isPending}
                onClick={() => handleRemove(member.id)}
              >
                <Trash2 className="size-4 text-destructive" />
              </Button>
            )}
          </li>
        )
      })}
    </ul>
  )
}
