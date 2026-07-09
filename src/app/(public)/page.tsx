import { ArrowRight, ListChecks, Users } from "lucide-react"
import { redirect } from "next/navigation"
import { Suspense } from "react"
import { AppLogo } from "@/components/common/app-logo"
import { LinkButton } from "@/components/common/link-button"
import { Container } from "@/components/layout/container"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { auth } from "@/lib/auth"

export default function HomePage() {
  return (
    <Suspense fallback={<HomeSkeleton />}>
      <HomeContent />
    </Suspense>
  )
}

async function HomeContent() {
  const session = await auth()

  if (session?.user) {
    redirect("/dashboard")
  }

  return <HomeLanding />
}

function HomeLanding() {
  return (
    <Container className="py-10 sm:py-16">
      <section className="mx-auto flex max-w-2xl flex-col items-center space-y-6 text-center">
        <AppLogo size="xl" />
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Listas de compras compartilhadas com quem você quiser
        </h1>
        <p className="text-base text-muted-foreground sm:text-lg">
          Organize as compras em grupo, convide membros e mantenha tudo sincronizado no celular.
        </p>
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <LinkButton size="lg" href="/dashboard">
            Começar agora
            <ArrowRight className="size-4" />
          </LinkButton>
          <LinkButton size="lg" variant="outline" href="/login">
            Entrar
          </LinkButton>
        </div>
      </section>

      <section className="mt-12 grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="size-4 text-primary" />
              Grupos colaborativos
            </CardTitle>
            <CardDescription>Convide quem quiser e gerencie listas em conjunto.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Cada grupo tem seus membros, produtos e listas próprias.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ListChecks className="size-4 text-primary" />
              Listas inteligentes
            </CardTitle>
            <CardDescription>Produtos globais e por grupo, com itens vinculados.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Marque itens conforme compra e acompanhe o progresso em tempo real.
          </CardContent>
        </Card>
      </section>
    </Container>
  )
}

function HomeSkeleton() {
  return (
    <Container className="py-10 sm:py-16">
      <section className="mx-auto flex max-w-2xl flex-col items-center space-y-6 text-center">
        <Skeleton className="size-16 rounded-2xl" />
        <Skeleton className="h-10 w-full max-w-lg" />
        <Skeleton className="h-6 w-full max-w-md" />
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Skeleton className="h-11 w-40 rounded-lg" />
          <Skeleton className="h-11 w-28 rounded-lg" />
        </div>
      </section>
      <section className="mt-12 grid gap-4 sm:grid-cols-2">
        <Skeleton className="h-36 rounded-xl" />
        <Skeleton className="h-36 rounded-xl" />
      </section>
    </Container>
  )
}
