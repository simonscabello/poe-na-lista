import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import type { HouseholdMemberDTO } from "@/types/domain"

type HouseholdMembersAvatarsProps = {
  members: HouseholdMemberDTO[]
  /** `onPrimary` = avatares em card verde; `default` = fundo da página. */
  tone?: "default" | "onPrimary"
}

const MAX_VISIBLE = 3

function initials(member: HouseholdMemberDTO): string {
  return (member.name ?? member.email ?? "U").slice(0, 1).toUpperCase()
}

export function HouseholdMembersAvatars({
  members,
  tone = "default",
}: HouseholdMembersAvatarsProps) {
  if (members.length === 0) {
    return null
  }

  const visible = members.slice(0, MAX_VISIBLE)
  const extra = members.length - visible.length
  const onPrimary = tone === "onPrimary"

  return (
    <AvatarGroup
      className={cn(onPrimary && "*:data-[slot=avatar]:ring-primary-foreground/40")}
      aria-label={`${members.length} ${members.length === 1 ? "pessoa" : "pessoas"} no grupo`}
    >
      {visible.map((member) => (
        <Avatar key={member.id} size="sm">
          {member.image && <AvatarImage src={member.image} alt={member.name ?? ""} />}
          <AvatarFallback
            className={cn(
              onPrimary
                ? "bg-primary-foreground/20 text-primary-foreground"
                : "bg-muted text-muted-foreground",
            )}
          >
            {initials(member)}
          </AvatarFallback>
        </Avatar>
      ))}
      {extra > 0 && (
        <AvatarGroupCount
          className={cn(
            "text-xs",
            onPrimary
              ? "bg-primary-foreground/20 text-primary-foreground ring-primary-foreground/40"
              : "bg-muted text-muted-foreground",
          )}
        >
          +{extra}
        </AvatarGroupCount>
      )}
    </AvatarGroup>
  )
}
