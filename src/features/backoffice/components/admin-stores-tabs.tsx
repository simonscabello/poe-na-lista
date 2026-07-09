"use client"

import { Plus } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AdminGlobalStoreFormDialog } from "@/features/backoffice/components/admin-global-store-form-dialog"
import { AdminGlobalStoresList } from "@/features/backoffice/components/admin-global-stores-list"
import { AdminHouseholdStoresList } from "@/features/backoffice/components/admin-household-stores-list"
import { AdminStoresPagination } from "@/features/backoffice/components/admin-stores-pagination"
import { AdminStoresSearch } from "@/features/backoffice/components/admin-stores-search"
import { cn } from "@/lib/utils"
import type { AdminGlobalStoresPageDTO, AdminHouseholdStoresPageDTO } from "@/types/domain"

type AdminStoresTabsProps = {
  tab: "global" | "household"
  search?: string
  globalData: AdminGlobalStoresPageDTO
  householdData: AdminHouseholdStoresPageDTO
}

export function AdminStoresTabs({ tab, search, globalData, householdData }: AdminStoresTabsProps) {
  const pathname = usePathname()

  function tabHref(nextTab: "global" | "household") {
    const params = new URLSearchParams()
    params.set("tab", nextTab)
    if (search) params.set("q", search)
    return `${pathname}?${params.toString()}`
  }

  return (
    <Tabs value={tab} className="gap-4">
      <TabsList>
        <TabsTrigger
          value="global"
          render={<Link href={tabHref("global")} className={cn("px-3 py-1")} />}
        >
          Catálogo oficial
        </TabsTrigger>
        <TabsTrigger
          value="household"
          render={<Link href={tabHref("household")} className={cn("px-3 py-1")} />}
        >
          Lojas dos grupos
        </TabsTrigger>
      </TabsList>

      <TabsContent value="global" className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm text-muted-foreground">
            {globalData.total === 1
              ? "1 loja no catálogo oficial"
              : `${globalData.total} lojas no catálogo oficial`}
          </p>
          <AdminGlobalStoreFormDialog
            trigger={
              <Button size="sm">
                <Plus className="size-4" />
                Nova loja
              </Button>
            }
          />
        </div>
        <AdminStoresSearch defaultValue={search} tab="global" />
        <AdminGlobalStoresList stores={globalData.stores} search={search} />
        <AdminStoresPagination
          page={globalData.page}
          pageSize={globalData.pageSize}
          total={globalData.total}
          search={search}
          tab="global"
        />
      </TabsContent>

      <TabsContent value="household" className="space-y-4">
        <p className="text-sm text-muted-foreground">
          {householdData.total === 1
            ? "1 loja cadastrada por grupos"
            : `${householdData.total} lojas cadastradas por grupos`}
        </p>
        <AdminStoresSearch defaultValue={search} tab="household" />
        <AdminHouseholdStoresList stores={householdData.stores} search={search} />
        <AdminStoresPagination
          page={householdData.page}
          pageSize={householdData.pageSize}
          total={householdData.total}
          search={search}
          tab="household"
        />
      </TabsContent>
    </Tabs>
  )
}
