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
            aria-label="Convidar pessoas"
            className="pointer-events-auto rounded-full bg-primary-foreground/15 text-primary-foreground hover:bg-primary-foreground/25 hover:text-primary-foreground"
          >
            <UserPlus className="size-4" />
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Convidar pessoas</DialogTitle>
          <DialogDescription>
            Gere um link e compartilhe com quem quiser entrar no grupo.
          </DialogDescription>
        </DialogHeader>
        <GenerateInviteLink householdId={householdId} />
      </DialogContent>
    </Dialog>
  )
}
