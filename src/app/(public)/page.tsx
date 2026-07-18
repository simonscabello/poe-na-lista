import { Archive, ArrowRight, Receipt, ShoppingCart, Users } from "lucide-react"
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
          A compra da casa em um só lugar: lista, gastos e despensa
        </h1>
        <p className="text-base text-muted-foreground sm:text-lg">
          Monte a lista com quem divide a casa, marque os itens no mercado e finalize: o app lembra
          os preços que você pagou, acompanha o orçamento do mês e mantém a despensa em dia.
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
              Compras em grupo
            </CardTitle>
            <CardDescription>Uma lista só, sincronizada no celular de todos.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Convide a família ou quem divide a casa: todo mundo adiciona, marca e acompanha em tempo
            real.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="size-4 text-primary" />
              Modo mercado
            </CardTitle>
            <CardDescription>Feito para a mão que empurra o carrinho.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Itens agrupados por categoria, total do carrinho e estimativa do que falta — com os
            últimos preços que você pagou.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="size-4 text-primary" />
              Gastos e orçamento
            </CardTitle>
            <CardDescription>Cada compra finalizada vira histórico.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Veja o gasto do mês por categoria e por mercado, defina um teto e receba alerta antes de
            estourar.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Archive className="size-4 text-primary" />
              Despensa automática
            </CardTitle>
            <CardDescription>O estoque da casa se atualiza sozinho.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            O que você compra entra na despensa; quando algo está acabando ou vencendo, volta para a
            lista em um toque.
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
        <Skeleton className="h-36 rounded-xl" />
        <Skeleton className="h-36 rounded-xl" />
      </section>
    </Container>
  )
}
