import { redirect } from "next/navigation"
import { Suspense } from "react"
import { Container } from "@/components/layout/container"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { GenerateInviteLink } from "@/features/households/components/generate-invite-link"
import { MembersList } from "@/features/households/components/members-list"
import { PendingInvitations } from "@/features/households/components/pending-invitations"
import { HouseholdRole } from "@/generated/prisma/enums"
import { resolveActiveHousehold } from "@/lib/active-household"
import { auth } from "@/lib/auth"
import { getHouseholdMembers, getUserHouseholds } from "@/services/household.service"
import { getPendingInvitations } from "@/services/invitation.service"

export default function HouseholdPage() {
  return (
    <Suspense fallback={<HouseholdSkeleton />}>
      <HouseholdContent />
    </Suspense>
  )
}

async function HouseholdContent() {
  const session = await auth()
  if (!session?.user) {
    redirect("/login?callbackUrl=/dashboard/household")
  }

  const households = await getUserHouseholds(session.user.id)
  const active = await resolveActiveHousehold(households)

  if (!active) {
    redirect("/dashboard")
  }

  const canManage = active.role === HouseholdRole.OWNER || active.role === HouseholdRole.ADMIN
  const [members, invitations] = await Promise.all([
    getHouseholdMembers(active.id),
    canManage ? getPendingInvitations(active.id) : Promise.resolve([]),
  ])

  return (
    <Container size="wide" className="space-y-6 py-6">
      <div className="space-y-1">
        <h1 className="text-page-title">{active.name}</h1>
        <p className="text-sm text-muted-foreground">Gerencie membros e convites do grupo.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Membros</CardTitle>
          <CardDescription>{members.length} pessoa(s) neste grupo</CardDescription>
        </CardHeader>
        <CardContent>
          <MembersList householdId={active.id} members={members} canManage={canManage} />
        </CardContent>
      </Card>

      {canManage && (
        <Card>
          <CardHeader>
            <CardTitle>Convidar pessoas</CardTitle>
            <CardDescription>
              Gere um link e compartilhe com quem quiser entrar no grupo.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <GenerateInviteLink householdId={active.id} />
            <PendingInvitations householdId={active.id} invitations={invitations} />
          </CardContent>
        </Card>
      )}
    </Container>
  )
}

function HouseholdSkeleton() {
  return (
    <Container size="wide" className="space-y-6 py-6">
      <div className="space-y-2">
        <Skeleton className="h-7 w-44" />
        <Skeleton className="h-4 w-56" />
      </div>
      <div className="space-y-3 rounded-xl bg-card p-4 ring-1 ring-foreground/10">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-4 w-32" />
        <div className="space-y-3 pt-2">
          {Array.from({ length: 2 }).map((_, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: static placeholder list
            <div key={index} className="flex items-center gap-3">
              <Skeleton className="size-9 rounded-full" />
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-40" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </Container>
  )
}
