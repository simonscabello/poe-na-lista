import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type AdminUsersSearchProps = {
  defaultValue?: string
}

export function AdminUsersSearch({ defaultValue }: AdminUsersSearchProps) {
  return (
    <form method="GET" className="flex gap-2">
      <div className="relative min-w-0 flex-1">
        <Search className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-3 size-4 text-muted-foreground" />
        <Input
          name="q"
          defaultValue={defaultValue}
          placeholder="Buscar por nome ou e-mail..."
          className="h-11 rounded-xl pl-9"
          aria-label="Buscar usuários"
        />
      </div>
      <Button type="submit" variant="outline" className="h-11 shrink-0">
        Buscar
      </Button>
    </form>
  )
}
