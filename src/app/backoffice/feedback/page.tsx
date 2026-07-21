import { Suspense } from "react"
import { Container } from "@/components/layout/container"
import { AdminFeedbackList } from "@/features/backoffice/components/admin-feedback-list"
import { AdminFeedbackPagination } from "@/features/backoffice/components/admin-feedback-pagination"
import { AdminFeedbackSkeleton } from "@/features/backoffice/components/admin-feedback-skeleton"
import { AdminFeedbackSummary } from "@/features/backoffice/components/admin-feedback-summary"
import { getAdminFeedback } from "@/services/admin-feedback.service"

type BackofficeFeedbackPageProps = {
  searchParams: Promise<{ page?: string }>
}

export default function BackofficeFeedbackPage({ searchParams }: BackofficeFeedbackPageProps) {
  return (
    <Suspense fallback={<AdminFeedbackSkeleton />}>
      <BackofficeFeedbackContent searchParams={searchParams} />
    </Suspense>
  )
}

async function BackofficeFeedbackContent({ searchParams }: BackofficeFeedbackPageProps) {
  const { page: pageParam } = await searchParams
  const page = Math.max(1, Number(pageParam) || 1)

  const data = await getAdminFeedback({ page })

  return (
    <Container size="wide" className="space-y-6 py-6">
      <div className="space-y-1">
        <h1 className="text-page-title">Avaliações</h1>
        <p className="text-sm text-muted-foreground">
          {data.total} avaliaç{data.total === 1 ? "ão enviada" : "ões enviadas"} pelos usuários
        </p>
      </div>

      <AdminFeedbackSummary
        averageRating={data.averageRating}
        total={data.total}
        distribution={data.distribution}
      />

      <AdminFeedbackList feedback={data.feedback} />

      <AdminFeedbackPagination page={data.page} pageSize={data.pageSize} total={data.total} />
    </Container>
  )
}
