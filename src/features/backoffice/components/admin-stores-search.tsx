import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type AdminStoresSearchProps = {
  defaultValue?: string
  tab: "global" | "household"
}

export function AdminStoresSearch({ defaultValue, tab }: AdminStoresSearchProps) {
  return (
    <form method="GET" className="flex gap-2">
      <input type="hidden" name="tab" value={tab} />
      <div className="relative min-w-0 flex-1">
        <Search className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-3 size-4 text-muted-foreground" />
        <Input
          name="q"
          defaultValue={defaultValue}
          placeholder="Buscar por nome..."
          className="h-11 rounded-xl pl-9"
          aria-label="Buscar lojas"
        />
      </div>
      <Button type="submit" variant="outline" className="h-11 shrink-0">
        Buscar
      </Button>
    </form>
  )
}
