import { Plus } from "lucide-react"
import { Suspense } from "react"
import { Container } from "@/components/layout/container"
import { Button } from "@/components/ui/button"
import { AdminCategoriesList } from "@/features/backoffice/components/admin-categories-list"
import { AdminCategoriesSkeleton } from "@/features/backoffice/components/admin-categories-skeleton"
import { AdminCategoryFormDialog } from "@/features/backoffice/components/admin-category-form-dialog"
import { getAdminCategories } from "@/services/category.service"

export default function BackofficeCategoriesPage() {
  return (
    <Suspense fallback={<AdminCategoriesSkeleton />}>
      <BackofficeCategoriesContent />
    </Suspense>
  )
}

async function BackofficeCategoriesContent() {
  const categories = await getAdminCategories()

  const subtitle =
    categories.length === 1
      ? "1 categoria cadastrada"
      : `${categories.length} categorias cadastradas`

  return (
    <Container size="wide" className="space-y-6 py-6">
      <div className="flex items-center justify-between gap-2">
        <div className="space-y-1">
          <h1 className="text-page-title">Categorias</h1>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <AdminCategoryFormDialog
          trigger={
            <Button>
              <Plus className="size-4" />
              Nova categoria
            </Button>
          }
        />
      </div>

      <AdminCategoriesList categories={categories} />
    </Container>
  )
}
