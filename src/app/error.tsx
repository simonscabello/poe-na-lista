"use client"

import { TriangleAlert } from "lucide-react"
import { useEffect } from "react"
import { EmptyState } from "@/components/common/empty-state"
import { Container } from "@/components/layout/container"
import { Button } from "@/components/ui/button"

type ErrorPageProps = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <Container className="flex min-h-[calc(100vh-3.5rem)] items-center py-16">
      <EmptyState
        className="mx-auto w-full max-w-md"
        icon={TriangleAlert}
        title="Algo deu errado"
        description="Ocorreu um erro inesperado. Tente novamente ou volte mais tarde."
        action={<Button onClick={reset}>Tentar novamente</Button>}
      />
    </Container>
  )
}
