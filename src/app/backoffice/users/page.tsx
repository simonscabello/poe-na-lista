import { Suspense } from "react"
import { Container } from "@/components/layout/container"
import { AdminUsersList } from "@/features/backoffice/components/admin-users-list"
import { AdminUsersPagination } from "@/features/backoffice/components/admin-users-pagination"
import { AdminUsersSearch } from "@/features/backoffice/components/admin-users-search"
import { AdminUsersSkeleton } from "@/features/backoffice/components/admin-users-skeleton"
import { getAdminUsers } from "@/services/admin-users.service"

type BackofficeUsersPageProps = {
  searchParams: Promise<{ q?: string; page?: string }>
}

export default function BackofficeUsersPage({ searchParams }: BackofficeUsersPageProps) {
  return (
    <Suspense fallback={<AdminUsersSkeleton />}>
      <BackofficeUsersContent searchParams={searchParams} />
    </Suspense>
  )
}

async function BackofficeUsersContent({ searchParams }: BackofficeUsersPageProps) {
  const { q, page: pageParam } = await searchParams
  const page = Math.max(1, Number(pageParam) || 1)
  const search = q?.trim() || undefined

  const data = await getAdminUsers({ search, page })

  const subtitle = search
    ? `${data.total} resultado${data.total === 1 ? "" : "s"} para "${search}"`
    : `${data.total} usuário${data.total === 1 ? "" : "s"} cadastrado${data.total === 1 ? "" : "s"}`

  return (
    <Container size="wide" className="space-y-6 py-6">
      <div className="space-y-1">
        <h1 className="text-page-title">Usuários</h1>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>

      <AdminUsersSearch defaultValue={search} />

      <AdminUsersList users={data.users} search={search} />

      <AdminUsersPagination
        page={data.page}
        pageSize={data.pageSize}
        total={data.total}
        search={search}
      />
    </Container>
  )
}
