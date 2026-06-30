"use client"

import { Smartphone, X } from "lucide-react"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { usePwaInstall } from "@/hooks/use-pwa-install"
import { cn } from "@/lib/utils"

export function InstallPrompt() {
  const pathname = usePathname()
  const { shouldShow, platform, install, dismiss } = usePwaInstall()

  if (!shouldShow) return null

  const isDashboard = pathname.startsWith("/dashboard")

  return (
    <section
      aria-label="Sugestão de instalação do app"
      className={cn(
        "fixed inset-x-0 z-[45] px-4 sm:hidden",
        isDashboard
          ? "bottom-[calc(4rem_+_env(safe-area-inset-bottom)_+_0.5rem)]"
          : "bottom-[calc(0.75rem_+_env(safe-area-inset-bottom))]",
      )}
    >
      <div className="mx-auto max-w-md rounded-2xl border bg-card/95 p-4 shadow-lg ring-1 ring-foreground/10 backdrop-blur-xl">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Smartphone className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-foreground">
              Instale o Põe na Lista no seu celular
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Abra suas listas mais rápido, direto da tela inicial.
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={dismiss}
            aria-label="Fechar"
            className="-mr-1 -mt-1 shrink-0 text-muted-foreground"
          >
            <X />
          </Button>
        </div>

        {platform === "ios" ? (
          <p className="mt-3 text-xs text-muted-foreground">
            Para instalar: toque em Compartilhar e depois em Adicionar à Tela de Início.
          </p>
        ) : (
          <div className="mt-3 flex items-center gap-2">
            <Button onClick={install} className="flex-1">
              Instalar
            </Button>
            <Button variant="ghost" onClick={dismiss}>
              Agora não
            </Button>
          </div>
        )}
      </div>
    </section>
  )
}
