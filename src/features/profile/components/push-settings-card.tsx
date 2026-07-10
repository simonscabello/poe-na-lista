"use client"

import { Bell, BellOff } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { usePushSubscription } from "@/hooks/use-push-subscription"

export function PushSettingsCard() {
  const {
    isReady,
    supported,
    needsIosInstall,
    permission,
    isSubscribed,
    isBusy,
    subscribe,
    unsubscribe,
  } = usePushSubscription()

  async function enable() {
    const ok = await subscribe()
    if (ok) {
      toast.success("Notificações ativadas")
    } else if (Notification.permission !== "denied") {
      toast.error("Não foi possível ativar as notificações")
    }
  }

  async function disable() {
    await unsubscribe()
    toast.success("Notificações desativadas neste dispositivo")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="size-4 text-primary" />
          Notificações
        </CardTitle>
        <CardDescription>
          Receba um aviso quando alguém criar uma lista, adicionar itens ou finalizar uma compra.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!isReady ? null : needsIosInstall ? (
          <p className="text-sm text-muted-foreground">
            No iPhone, instale o app na tela de início para receber notificações.
          </p>
        ) : !supported ? (
          <p className="text-sm text-muted-foreground">
            Este navegador não suporta notificações push.
          </p>
        ) : permission === "denied" ? (
          <p className="text-sm text-muted-foreground">
            Permissão bloqueada — habilite as notificações nas configurações do navegador para este
            site.
          </p>
        ) : isSubscribed ? (
          <Button variant="outline" onClick={disable} loading={isBusy}>
            <BellOff className="size-4" />
            Desativar neste dispositivo
          </Button>
        ) : (
          <Button onClick={enable} loading={isBusy}>
            <Bell className="size-4" />
            Ativar notificações
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
