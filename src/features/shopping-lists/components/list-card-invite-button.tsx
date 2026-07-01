"use client"

import { UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { GenerateInviteLink } from "@/features/households/components/generate-invite-link"

type ListCardInviteButtonProps = {
  householdId: string
}

export function ListCardInviteButton({ householdId }: ListCardInviteButtonProps) {
  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Convidar para o grupo"
            className="pointer-events-auto rounded-full bg-primary-foreground/15 text-primary-foreground hover:bg-primary-foreground/25 hover:text-primary-foreground"
          >
            <UserPlus className="size-4" />
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Convidar para o grupo</DialogTitle>
          <DialogDescription>
            A pessoa entra no grupo e passa a ver todas as listas. Para enviar só esta lista a quem
            vai comprar, use "Compartilhar lista".
          </DialogDescription>
        </DialogHeader>
        <GenerateInviteLink householdId={householdId} />
      </DialogContent>
    </Dialog>
  )
}
