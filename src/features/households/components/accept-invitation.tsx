"use client"

import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useRef } from "react"
import { toast } from "sonner"
import { setActiveHouseholdAction } from "@/actions/active-household.actions"
import { acceptInvitationAction } from "@/actions/invitation.actions"

type AcceptInvitationProps = {
  token: string
}

export function AcceptInvitation({ token }: AcceptInvitationProps) {
  const router = useRouter()
  const hasRun = useRef(false)

  useEffect(() => {
    if (hasRun.current) {
      return
    }
    hasRun.current = true

    async function accept() {
      const result = await acceptInvitationAction(token)
      if (!result.success) {
        toast.error(result.error)
        router.replace("/dashboard")
        return
      }
      await setActiveHouseholdAction(result.data.householdId)
      toast.success("Você entrou no grupo")
      router.replace("/dashboard")
    }

    accept()
  }, [token, router])

  return (
    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
      <Loader2 className="size-4 animate-spin" />
      Entrando no grupo...
    </div>
  )
}
