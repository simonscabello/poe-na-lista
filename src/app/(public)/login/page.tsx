import { Suspense } from "react"
import { AppLogo } from "@/components/common/app-logo"
import { LinkButton } from "@/components/common/link-button"
import { Container } from "@/components/layout/container"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { auth, signIn } from "@/lib/auth"

type LoginPageProps = {
  searchParams: Promise<{ callbackUrl?: string }>
}

export default function LoginPage({ searchParams }: LoginPageProps) {
  return (
    <Suspense fallback={<LoginSkeleton />}>
      <LoginContent searchParams={searchParams} />
    </Suspense>
  )
}

async function LoginContent({ searchParams }: LoginPageProps) {
  const session = await auth()
  const { callbackUrl } = await searchParams

  if (session?.user) {
    return (
      <Container className="flex min-h-[calc(100vh-3.5rem)] items-center py-10">
        <Card className="mx-auto w-full max-w-md">
          <CardHeader>
            <CardTitle>Você já está autenticado</CardTitle>
            <CardDescription>Acesse o dashboard para continuar.</CardDescription>
          </CardHeader>
          <CardFooter>
            <LinkButton className="w-full" href={callbackUrl ?? "/dashboard"}>
              Ir para o dashboard
            </LinkButton>
          </CardFooter>
        </Card>
      </Container>
    )
  }

  return (
    <Container className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center gap-6 py-10">
      <AppLogo size="lg" className="size-16" />
      <Card className="mx-auto w-full max-w-md">
        <CardHeader>
          <CardTitle>Entrar no Põe na Lista</CardTitle>
          <CardDescription>
            Use sua conta Google para acessar listas compartilhadas.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Suas listas e grupos ficam disponíveis em qualquer dispositivo.
        </CardContent>
        <CardFooter>
          <form
            className="w-full"
            action={async () => {
              "use server"
              await signIn("google", { redirectTo: callbackUrl ?? "/dashboard" })
            }}
          >
            <Button type="submit" className="w-full">
              Entrar com Google
            </Button>
          </form>
        </CardFooter>
      </Card>
    </Container>
  )
}

function LoginSkeleton() {
  return (
    <Container className="flex min-h-[calc(100vh-3.5rem)] items-center py-10">
      <Card className="mx-auto w-full max-w-md">
        <CardHeader className="space-y-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-4 w-56" />
        </CardContent>
        <CardFooter>
          <Skeleton className="h-10 w-full rounded-lg" />
        </CardFooter>
      </Card>
    </Container>
  )
}
