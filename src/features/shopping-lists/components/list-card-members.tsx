import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from "@/components/ui/avatar"
import type { HouseholdMemberDTO } from "@/types/domain"

type ListCardMembersProps = {
  members: HouseholdMemberDTO[]
}

const MAX_VISIBLE = 3

function initials(member: HouseholdMemberDTO): string {
  return (member.name ?? member.email ?? "U").slice(0, 1).toUpperCase()
}

export function ListCardMembers({ members }: ListCardMembersProps) {
  if (members.length === 0) {
    return null
  }

  const visible = members.slice(0, MAX_VISIBLE)
  const extra = members.length - visible.length

  return (
    <AvatarGroup className="*:data-[slot=avatar]:ring-primary-foreground/40">
      {visible.map((member) => (
        <Avatar key={member.id} size="sm">
          {member.image && <AvatarImage src={member.image} alt={member.name ?? ""} />}
          <AvatarFallback className="bg-primary-foreground/20 text-primary-foreground">
            {initials(member)}
          </AvatarFallback>
        </Avatar>
      ))}
      {extra > 0 && (
        <AvatarGroupCount className="bg-primary-foreground/20 text-xs text-primary-foreground ring-primary-foreground/40">
          +{extra}
        </AvatarGroupCount>
      )}
    </AvatarGroup>
  )
}
