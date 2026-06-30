"use client"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="pt-BR">
      <body className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background p-6 text-center text-foreground">
        <h1 className="text-2xl font-semibold">Erro crítico</h1>
        <p className="max-w-md text-sm text-muted-foreground">
          {error.message || "Não foi possível carregar a aplicação."}
        </p>
        <button
          type="button"
          onClick={reset}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Recarregar
        </button>
      </body>
    </html>
  )
}
