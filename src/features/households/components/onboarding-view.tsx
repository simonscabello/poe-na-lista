import { Users } from "lucide-react"
import { AppLogo } from "@/components/common/app-logo"
import { Container } from "@/components/layout/container"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CreateHouseholdForm } from "@/features/households/components/create-household-form"
import { JoinHouseholdForm } from "@/features/households/components/join-household-form"

export function OnboardingView() {
  return (
    <Container size="narrow" className="space-y-6 py-10">
      <div className="flex flex-col items-center gap-3 text-center">
        <AppLogo size="lg" />
        <div className="space-y-2">
          <h1 className="text-page-title">Bem-vindo ao Põe na Lista</h1>
          <p className="text-sm text-muted-foreground">
            Crie seu primeiro grupo ou entre em um existente com um convite.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="size-4 text-primary" />
            Criar um grupo
          </CardTitle>
          <CardDescription>
            Você será o dono e poderá convidar outras pessoas depois.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CreateHouseholdForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="size-4 text-primary" />
            Entrar com convite
          </CardTitle>
          <CardDescription>Recebeu um convite? Use o link ou código aqui.</CardDescription>
        </CardHeader>
        <CardContent>
          <JoinHouseholdForm />
        </CardContent>
      </Card>
    </Container>
  )
}
