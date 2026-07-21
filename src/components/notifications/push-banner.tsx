"use client"

import { BellRing, X } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { usePushSubscription } from "@/hooks/use-push-subscription"

const DISMISS_KEY = "poe_na_lista:push-prompt-dismissed-at"
const DISMISS_DAYS = 7

export function PushBanner() {
  const { isReady, supported, permission, isSubscribed, isBusy, subscribe } = usePushSubscription()
  const [dismissed, setDismissed] = useState(true)
  // Só decide exibir após mount: evita inserir nós (e useIds do Base UI) entre
  // o HTML do SSR e a primeira pintura do client.
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setHydrated(true)
    const raw = localStorage.getItem(DISMISS_KEY)
    if (!raw) {
      setDismissed(false)
      return
    }
    const dismissedAt = Number(raw)
    if (Number.isNaN(dismissedAt)) {
      setDismissed(false)
      return
    }
    const elapsedDays = (Date.now() - dismissedAt) / (1000 * 60 * 60 * 24)
    setDismissed(elapsedDays < DISMISS_DAYS)
  }, [])

  if (
    !hydrated ||
    !isReady ||
    !supported ||
    dismissed ||
    isSubscribed ||
    permission !== "default"
  ) {
    return null
  }

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, String(Date.now()))
    setDismissed(true)
  }

  async function enable() {
    const ok = await subscribe()
    if (ok) {
      toast.success("Notificações ativadas")
      return
    }
    // Se a permissão foi negada o banner some sozinho; outros erros só fecham.
    dismiss()
  }

  return (
    <div className="flex items-start gap-3 rounded-2xl bg-card p-4 ring-1 ring-border/70">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <BellRing className="size-5" />
      </span>
      <div className="min-w-0 flex-1 space-y-2">
        <div>
          <p className="text-sm font-medium">Ative as notificações</p>
          <p className="text-xs text-muted-foreground">
            Saiba na hora quando alguém adicionar itens ou finalizar uma compra.
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={enable} loading={isBusy}>
            Ativar
          </Button>
          <Button size="sm" variant="ghost" onClick={dismiss}>
            Agora não
          </Button>
        </div>
      </div>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dispensar"
        className="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
      >
        <X className="size-4" />
      </button>
    </div>
  )
}
