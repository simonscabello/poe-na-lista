import { Suspense } from "react"
import { Container } from "@/components/layout/container"
import { AdminModerationList } from "@/features/backoffice/components/admin-moderation-list"
import { AdminModerationPagination } from "@/features/backoffice/components/admin-moderation-pagination"
import { AdminModerationSearch } from "@/features/backoffice/components/admin-moderation-search"
import { AdminModerationSkeleton } from "@/features/backoffice/components/admin-moderation-skeleton"
import { getAdminCategories } from "@/services/category.service"
import { getAdminModerationProducts, getAdminProducts } from "@/services/product.service"

type BackofficeModerationPageProps = {
  searchParams: Promise<{ q?: string; page?: string; categoryId?: string }>
}

export default function BackofficeModerationPage({ searchParams }: BackofficeModerationPageProps) {
  return (
    <Suspense fallback={<AdminModerationSkeleton />}>
      <BackofficeModerationContent searchParams={searchParams} />
    </Suspense>
  )
}

async function BackofficeModerationContent({ searchParams }: BackofficeModerationPageProps) {
  const { q, page: pageParam, categoryId: categoryIdParam } = await searchParams
  const page = Math.max(1, Number(pageParam) || 1)
  const search = q?.trim() || undefined
  const categoryId = categoryIdParam?.trim() || undefined

  const [data, categories, globalCatalog] = await Promise.all([
    getAdminModerationProducts({ search, page, categoryId }),
    getAdminCategories(),
    getAdminProducts({ scope: "global", pageSize: 500 }),
  ])

  const subtitle = search
    ? `${data.total} resultado${data.total === 1 ? "" : "s"} para "${search}"`
    : `${data.total} produto${data.total === 1 ? "" : "s"} aguardando revisão`

  return (
    <Container size="wide" className="space-y-6 py-6">
      <div className="space-y-1">
        <h1 className="text-page-title">Moderação</h1>
        <p className="text-sm text-muted-foreground">
          Revise produtos criados por grupos e promova ou mescle no catálogo oficial
        </p>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>

      <AdminModerationSearch
        categories={categories}
        defaultValue={search}
        defaultCategoryId={categoryId}
      />

      <AdminModerationList
        products={data.products}
        categories={categories}
        globalProducts={globalCatalog.products}
        search={search}
      />

      <AdminModerationPagination
        page={data.page}
        pageSize={data.pageSize}
        total={data.total}
        search={search}
        categoryId={categoryId}
      />
    </Container>
  )
}
