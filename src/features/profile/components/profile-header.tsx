import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

type ProfileHeaderProps = {
  name: string | null
  email: string | null
  image: string | null
}

export function ProfileHeader({ name, email, image }: ProfileHeaderProps) {
  const initials = (name ?? email ?? "U").slice(0, 1).toUpperCase()

  return (
    <div className="flex items-center gap-3">
      <Avatar size="lg">
        {image && <AvatarImage src={image} alt={name ?? "Usuário"} />}
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <p className="truncate font-medium text-foreground">{name ?? "Usuário"}</p>
        {email && <p className="truncate text-sm text-muted-foreground">{email}</p>}
      </div>
    </div>
  )
}
