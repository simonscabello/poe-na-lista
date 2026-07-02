"use client"

import { LogOut } from "lucide-react"
import { signOut } from "next-auth/react"
import { useState } from "react"
import { Button } from "@/components/ui/button"

export function SignOutButton() {
  const [isPending, setIsPending] = useState(false)

  function handleSignOut() {
    setIsPending(true)
    signOut({ callbackUrl: "/" })
  }

  return (
    <Button variant="destructive" className="w-full" loading={isPending} onClick={handleSignOut}>
      {!isPending && <LogOut className="size-4" />}
      Sair
    </Button>
  )
}
