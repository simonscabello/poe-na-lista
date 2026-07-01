import { notFound, redirect } from "next/navigation"
import { Suspense } from "react"
import { ListDetailSkeleton } from "@/features/shopping-lists/components/list-detail-skeleton"
import { ListView } from "@/features/shopping-lists/components/list-view"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getActiveShareForList } from "@/services/list-share.service"
import { getCategories, getFrequentProducts, getProductCatalog } from "@/services/product.service"
import { getListDetail } from "@/services/shopping-list.service"

type ListDetailPageProps = {
  params: Promise<{ listId: string }>
}

export default function ListDetailPage({ params }: ListDetailPageProps) {
  return (
    <Suspense fallback={<ListDetailSkeleton />}>
      {params.then(({ listId }) => (
        <ListDetailContent listId={listId} />
      ))}
    </Suspense>
  )
}

async function ListDetailContent({ listId }: { listId: string }) {
  const session = await auth()
  if (!session?.user) {
    redirect(`/login?callbackUrl=/dashboard/lists/${listId}`)
  }

  const list = await getListDetail(listId)
  if (!list) {
    notFound()
  }

  const membership = await prisma.householdMember.findUnique({
    where: { userId_householdId: { userId: session.user.id, householdId: list.householdId } },
    select: { id: true },
  })

  if (!membership) {
    notFound()
  }

  const [catalog, frequent, categories, initialShare] = await Promise.all([
    getProductCatalog(list.householdId),
    getFrequentProducts(list.householdId),
    getCategories(),
    getActiveShareForList(list.id),
  ])

  return (
    <ListView
      list={list}
      catalog={catalog}
      frequent={frequent}
      categories={categories}
      initialShare={initialShare}
    />
  )
}
