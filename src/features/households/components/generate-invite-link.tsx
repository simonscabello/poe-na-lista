"use client"

import { Check, Copy, Link2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { toast } from "sonner"
import { createInviteLinkAction } from "@/actions/invitation.actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type GenerateInviteLinkProps = {
  householdId: string
}

function buildInviteUrl(token: string) {
  return `${window.location.origin}/invite/${token}`
}

export function GenerateInviteLink({ householdId }: GenerateInviteLinkProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [inviteUrl, setInviteUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  async function copyToClipboard(url: string) {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      return true
    } catch {
      return false
    }
  }

  function generate() {
    startTransition(async () => {
      const result = await createInviteLinkAction(householdId)
      if (!result.success) {
        toast.error(result.error)
        return
      }
      const url = buildInviteUrl(result.data.token)
      setInviteUrl(url)
      const didCopy = await copyToClipboard(url)
      toast.success(didCopy ? "Link gerado e copiado" : "Link gerado")
      router.refresh()
    })
  }

  return (
    <div className="space-y-3">
      <Button onClick={generate} disabled={isPending} className="w-full sm:w-auto">
        <Link2 className="size-4" />
        Gerar link de convite
      </Button>

      {inviteUrl && (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Input readOnly value={inviteUrl} className="flex-1" onFocus={(e) => e.target.select()} />
          <Button
            variant="outline"
            onClick={() => copyToClipboard(inviteUrl).then(() => toast.success("Link copiado"))}
            className="shrink-0"
          >
            {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
            {copied ? "Copiado" : "Copiar"}
          </Button>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        O link é de uso único e expira em 1 dia. Após usado ou expirado, gere um novo.
      </p>
    </div>
  )
}
