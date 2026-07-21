import { redirect } from "next/navigation"
import { Container } from "@/components/layout/container"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CreateHouseholdForm } from "@/features/households/components/create-household-form"
import { auth } from "@/lib/auth"
import { requireOnboardingCompleted } from "@/lib/onboarding"

export default async function NewHouseholdPage() {
  const session = await auth()
  if (!session?.user) {
    redirect("/login?callbackUrl=/dashboard/household/new")
  }
  await requireOnboardingCompleted(session.user.id)

  return (
    <Container size="narrow" className="py-10">
      <Card>
        <CardHeader>
          <CardTitle>Novo grupo</CardTitle>
          <CardDescription>Crie outro grupo para organizar listas separadas.</CardDescription>
        </CardHeader>
        <CardContent>
          <CreateHouseholdForm />
        </CardContent>
      </Card>
    </Container>
  )
}
