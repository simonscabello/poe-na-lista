"use client"

import { LogOut } from "lucide-react"
import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"

export function SignOutButton() {
  return (
    <Button variant="destructive" className="w-full" onClick={() => signOut({ callbackUrl: "/" })}>
      <LogOut className="size-4" />
      Sair
    </Button>
  )
}
