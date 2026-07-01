import { Unlink } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"
import { Suspense } from "react"
import { EmptyState } from "@/components/common/empty-state"
import { PublicListView } from "@/features/list-sharing/components/public-list-view"
import { getPublicListByToken } from "@/services/list-share.service"

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

type PublicSharePageProps = {
  params: Promise<{ token: string }>
}

export default function PublicSharePage({ params }: PublicSharePageProps) {
  return (
    <Suspense fallback={null}>
      {params.then(({ token }) => (
        <PublicShareContent token={token} />
      ))}
    </Suspense>
  )
}

async function PublicShareContent({ token }: { token: string }) {
  const list = await getPublicListByToken(token)

  if (!list) {
    return (
      <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-col items-center justify-center px-4 py-8">
        <EmptyState
          icon={Unlink}
          title="Link indisponível"
          description="Este link de compartilhamento expirou ou foi revogado. Peça um novo link para quem criou a lista."
          action={
            <Link href="/" className="text-sm font-medium text-primary hover:underline">
              Conhecer o Põe na Lista
            </Link>
          }
        />
      </div>
    )
  }

  return <PublicListView list={list} />
}
