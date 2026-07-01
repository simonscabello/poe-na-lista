import { Users } from "lucide-react"
import { EmptyState } from "@/components/common/empty-state"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { formatCalendarDate } from "@/lib/calendar-date"
import type { AdminUserSummaryDTO } from "@/types/domain"

type AdminUsersListProps = {
  users: AdminUserSummaryDTO[]
  search?: string
}

function formatCount(count: number, singular: string, plural: string) {
  return count === 1 ? `1 ${singular}` : `${count} ${plural}`
}

export function AdminUsersList({ users, search }: AdminUsersListProps) {
  if (users.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title={search ? "Nenhum usuário encontrado" : "Nenhum usuário cadastrado"}
        description={
          search
            ? "Tente outro termo de busca."
            : "Os usuários aparecerão aqui conforme forem se cadastrando."
        }
      />
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl bg-card ring-1 ring-border/70">
      <ul className="divide-y divide-border/70">
        {users.map((user) => {
          const initials = (user.name ?? user.email ?? "U").slice(0, 1).toUpperCase()

          return (
            <li key={user.id} className="flex items-start gap-3 px-4 py-3 sm:items-center">
              <Avatar size="sm" className="mt-0.5 sm:mt-0">
                {user.image && <AvatarImage src={user.image} alt={user.name ?? ""} />}
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1 space-y-1">
                <p className="truncate text-sm font-medium">{user.name ?? "Sem nome"}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {user.email ?? "Sem e-mail"}
                </p>
                <p className="text-xs text-muted-foreground sm:hidden">
                  {formatCalendarDate(user.createdAt)}
                  {" · "}
                  {formatCount(user.householdCount, "grupo", "grupos")}
                  {" · "}
                  {formatCount(user.listsCreatedCount, "lista", "listas")}
                </p>
              </div>
              <div className="hidden shrink-0 flex-col items-end gap-1.5 sm:flex">
                <span className="text-xs text-muted-foreground">
                  {formatCalendarDate(user.createdAt)}
                </span>
                <div className="flex flex-wrap justify-end gap-1">
                  <Badge variant="outline">
                    {formatCount(user.householdCount, "grupo", "grupos")}
                  </Badge>
                  <Badge variant="outline">
                    {formatCount(user.listsCreatedCount, "lista", "listas")}
                  </Badge>
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
