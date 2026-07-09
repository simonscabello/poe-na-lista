import { Plus } from "lucide-react"
import { Suspense } from "react"
import { Container } from "@/components/layout/container"
import { Button } from "@/components/ui/button"
import { AdminProductFormDialog } from "@/features/backoffice/components/admin-product-form-dialog"
import { AdminProductsList } from "@/features/backoffice/components/admin-products-list"
import { AdminProductsPagination } from "@/features/backoffice/components/admin-products-pagination"
import { AdminProductsSearch } from "@/features/backoffice/components/admin-products-search"
import { AdminProductsSkeleton } from "@/features/backoffice/components/admin-products-skeleton"
import { getAdminCategories } from "@/services/category.service"
import { getAdminProducts } from "@/services/product.service"

type BackofficeProductsPageProps = {
  searchParams: Promise<{ q?: string; page?: string; categoryId?: string }>
}

export default function BackofficeProductsPage({ searchParams }: BackofficeProductsPageProps) {
  return (
    <Suspense fallback={<AdminProductsSkeleton />}>
      <BackofficeProductsContent searchParams={searchParams} />
    </Suspense>
  )
}

async function BackofficeProductsContent({ searchParams }: BackofficeProductsPageProps) {
  const { q, page: pageParam, categoryId: categoryIdParam } = await searchParams
  const page = Math.max(1, Number(pageParam) || 1)
  const search = q?.trim() || undefined
  const categoryId = categoryIdParam?.trim() || undefined

  const [data, categories] = await Promise.all([
    getAdminProducts({ search, page, categoryId }),
    getAdminCategories(),
  ])

  const subtitle = search
    ? `${data.total} resultado${data.total === 1 ? "" : "s"} para "${search}"`
    : `${data.total} produto${data.total === 1 ? "" : "s"} cadastrado${data.total === 1 ? "" : "s"}`

  return (
    <Container size="wide" className="space-y-6 py-6">
      <div className="flex items-center justify-between gap-2">
        <div className="space-y-1">
          <h1 className="text-page-title">Produtos</h1>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <AdminProductFormDialog
          categories={categories}
          trigger={
            <Button>
              <Plus className="size-4" />
              Novo produto
            </Button>
          }
        />
      </div>

      <AdminProductsSearch
        categories={categories}
        defaultValue={search}
        defaultCategoryId={categoryId}
      />

      <AdminProductsList products={data.products} categories={categories} search={search} />

      <AdminProductsPagination
        page={data.page}
        pageSize={data.pageSize}
        total={data.total}
        search={search}
        categoryId={categoryId}
      />
    </Container>
  )
}
