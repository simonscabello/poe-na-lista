"use client"

import { X } from "lucide-react"
import { dismissOnboardingChecklistAction } from "@/actions/onboarding.actions"

export function DismissChecklistButton() {
  return (
    <form action={dismissOnboardingChecklistAction}>
      <button
        type="submit"
        aria-label="Dispensar primeiros passos"
        className="-mr-1 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
      >
        <X className="size-4" />
      </button>
    </form>
  )
}
