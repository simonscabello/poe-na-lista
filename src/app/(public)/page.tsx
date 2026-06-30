import { ArrowRight, ListChecks, Users } from "lucide-react"
import { AppLogo } from "@/components/common/app-logo"
import { LinkButton } from "@/components/common/link-button"
import { Container } from "@/components/layout/container"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function HomePage() {
  return (
    <Container className="py-10 sm:py-16">
      <section className="mx-auto flex max-w-2xl flex-col items-center space-y-6 text-center">
        <AppLogo size="xl" />
        <div className="inline-flex items-center rounded-full border border-border/70 bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
          PWA · Mobile-first · Para qualquer grupo
        </div>
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
