"use client"

import { Copy, X } from "lucide-react"
import { useTransition } from "react"
import { toast } from "sonner"
import { revokeInvitationAction } from "@/actions/invitation.actions"
import { Button } from "@/components/ui/button"
import type { InvitationDTO } from "@/types/domain"

type PendingInvitationsProps = {
  householdId: string
  invitations: InvitationDTO[]
}

function formatExpiry(expiresAt: string) {
  const date = new Date(expiresAt)
  if (date < new Date()) {
    return "Expirado"
  }
  return `Expira em ${date.toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}`
}

export function PendingInvitations({ householdId, invitations }: PendingInvitationsProps) {
  const [isPending, startTransition] = useTransition()

  function copyLink(token: string) {
    const url = `${window.location.origin}/invite/${token}`
    navigator.clipboard.writeText(url)
    toast.success("Link copiado")
  }

  function revoke(invitationId: string) {
    startTransition(async () => {
      const result = await revokeInvitationAction(householdId, invitationId)
      if (!result.success) {
        toast.error(result.error)
        return
      }
      toast.success("Convite cancelado")
    })
  }

  if (invitations.length === 0) {
    return <p className="text-sm text-muted-foreground">Nenhum convite pendente.</p>
  }

  return (
    <ul className="divide-y">
      {invitations.map((invitation) => (
        <li key={invitation.id} className="flex items-center gap-2 py-3">
          <span className="min-w-0 flex-1 truncate text-sm text-muted-foreground">
            {formatExpiry(invitation.expiresAt)}
          </span>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Copiar link"
            onClick={() => copyLink(invitation.token)}
          >
            <Copy className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Cancelar convite"
            disabled={isPending}
            onClick={() => revoke(invitation.id)}
          >
            <X className="size-4 text-destructive" />
          </Button>
        </li>
      ))}
    </ul>
  )
}
