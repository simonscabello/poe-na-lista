import { redirect } from "next/navigation"
import { Suspense } from "react"
import { LinkButton } from "@/components/common/link-button"
import { Container } from "@/components/layout/container"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { AcceptInvitation } from "@/features/households/components/accept-invitation"
import { InvitationStatus } from "@/generated/prisma/enums"
import { auth } from "@/lib/auth"
import { getInvitationByToken } from "@/services/invitation.service"

type InvitePageProps = {
  params: Promise<{ token: string }>
}

export default function InvitePage({ params }: InvitePageProps) {
  return (
    <Suspense fallback={<InviteSkeleton />}>
      {params.then(({ token }) => (
        <InviteContent token={token} />
      ))}
    </Suspense>
  )
}

async function InviteContent({ token }: { token: string }) {
  const session = await auth()

  if (!session?.user) {
    redirect(`/login?callbackUrl=/invite/${token}`)
  }

  const invitation = await getInvitationByToken(token)
  const isExpired = invitation && invitation.expiresAt < new Date()
  const isInvalid = !invitation || invitation.status !== InvitationStatus.PENDING || isExpired

  return (
    <Container size="narrow" className="flex min-h-screen items-center py-10">
      <Card className="mx-auto w-full max-w-md">
        <CardHeader>
          <CardTitle>Convite para grupo</CardTitle>
          <CardDescription>
            {isInvalid
              ? "Este convite não é mais válido."
              : `Você foi convidado para "${invitation.household.name}".`}
          </CardDescription>
        </CardHeader>

        {isInvalid ? (
          <CardFooter>
            <LinkButton href="/dashboard" variant="outline" className="w-full">
              Ir para o dashboard
            </LinkButton>
          </CardFooter>
        ) : (
          <CardContent>
            <AcceptInvitation token={token} />
          </CardContent>
        )}
      </Card>
    </Container>
  )
}

function InviteSkeleton() {
  return (
    <Container size="narrow" className="flex min-h-screen items-center py-10">
      <Card className="mx-auto w-full max-w-md">
        <CardHeader className="space-y-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-56" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-4 w-48" />
        </CardContent>
        <CardFooter>
          <Skeleton className="h-10 w-full rounded-lg" />
        </CardFooter>
      </Card>
    </Container>
  )
}
