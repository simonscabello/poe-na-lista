import { LinkButton } from "@/components/common/link-button"
import { Container } from "@/components/layout/container"

export default function NotFound() {
  return (
    <Container className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center gap-4 py-16 text-center">
      <p className="text-sm font-medium text-muted-foreground">404</p>
      <h1 className="text-page-title">Página não encontrada</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        O endereço que você acessou não existe ou foi movido.
      </p>
      <LinkButton href="/">Voltar para a home</LinkButton>
    </Container>
  )
}
