"use client"

import { UserPlus } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { GenerateInviteLink } from "@/features/households/components/generate-invite-link"

type ListCardInviteButtonProps = {
  householdId: string
}

export function ListCardInviteButton({ householdId }: ListCardInviteButtonProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Convidar para o grupo"
        className="pointer-events-auto rounded-full bg-primary-foreground/15 text-primary-foreground hover:bg-primary-foreground/25 hover:text-primary-foreground"
        onClick={() => setOpen(true)}
      >
        <UserPlus className="size-4" />
      </Button>
      {/* Monta o Dialog só quando aberto — Root fechado gera useIds do Base UI
          diferentes entre SSR e client e quebra a hidratação dos cards. */}
      {open ? (
        <Dialog open onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Convidar para o grupo</DialogTitle>
              <DialogDescription>
                A pessoa entra no grupo e passa a ver todas as listas. Para enviar só esta lista a
                quem vai comprar, use &quot;Compartilhar lista&quot;.
              </DialogDescription>
            </DialogHeader>
            <GenerateInviteLink householdId={householdId} />
          </DialogContent>
        </Dialog>
      ) : null}
    </>
  )
}
