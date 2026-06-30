"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

function extractToken(value: string): string {
  const trimmed = value.trim()
  const match = trimmed.match(/invite\/([^/?#]+)/)
  return match ? match[1] : trimmed
}

export function JoinHouseholdForm() {
  const router = useRouter()
  const [value, setValue] = useState("")

  function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    const token = extractToken(value)
    if (!token) {
      return
    }
    router.push(`/invite/${token}`)
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Input
        placeholder="Cole o link ou código do convite"
        value={value}
        onChange={(event) => setValue(event.target.value)}
      />
      <Button type="submit" variant="outline" className="w-full" disabled={!value.trim()}>
        Entrar com convite
      </Button>
    </form>
  )
}
