import { Check } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DismissChecklistButton } from "@/features/onboarding/components/dismiss-checklist-button"
import { cn } from "@/lib/utils"

export type OnboardingProgress = {
  hasHousehold: boolean
  hasInvited: boolean
  hasList: boolean
  hasProduct: boolean
  hasPurchase: boolean
}

type Step = {
  key: keyof OnboardingProgress
  label: string
  hint: string
}

const STEPS: Step[] = [
  { key: "hasHousehold", label: "Criar seu grupo", hint: "Feito! Você já tem um grupo." },
  {
    key: "hasInvited",
    label: "Convidar alguém",
    hint: "Na aba Grupo, gere um link de convite e compartilhe.",
  },
  {
    key: "hasList",
    label: "Criar sua primeira lista",
    hint: 'Toque em "Nova lista" aqui em cima.',
  },
  {
    key: "hasProduct",
    label: "Adicionar um produto",
    hint: 'Abra a lista e use "Adicionar produtos".',
  },
  {
    key: "hasPurchase",
    label: "Finalizar sua primeira compra",
    hint: 'Marque os itens e toque em "Finalizar compra".',
  },
]

type OnboardingChecklistProps = {
  progress: OnboardingProgress
  dismissed: boolean
}

/** Checklist de primeiros passos (Server Component; dismiss fica em Client Component). */
export function OnboardingChecklist({ progress, dismissed }: OnboardingChecklistProps) {
  const doneCount = STEPS.filter((step) => progress[step.key]).length
  const allDone = doneCount === STEPS.length

  if (allDone || dismissed) {
    return null
  }

  const nextStepKey = STEPS.find((step) => !progress[step.key])?.key

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="text-base">Primeiros passos</CardTitle>
            <p className="text-xs text-muted-foreground">
              {doneCount} de {STEPS.length} concluídos
            </p>
          </div>
          <DismissChecklistButton />
        </div>
      </CardHeader>
      <CardContent>
        <ol className="space-y-2.5">
          {STEPS.map((step) => {
            const done = progress[step.key]
            const isNext = step.key === nextStepKey
            return (
              <li key={step.key} className="flex items-start gap-3">
                <span
                  className={cn(
                    "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full text-xs",
                    done
                      ? "bg-primary text-primary-foreground"
                      : "border border-border text-muted-foreground",
                  )}
                >
                  {done ? <Check className="size-3" /> : null}
                </span>
                <div className="min-w-0 space-y-0.5">
                  <p
                    className={cn(
                      "text-sm font-medium",
                      done ? "text-muted-foreground line-through" : "text-foreground",
                    )}
                  >
                    {step.label}
                  </p>
                  {!done && isNext ? (
                    <p className="text-xs text-muted-foreground">{step.hint}</p>
                  ) : null}
                </div>
              </li>
            )
          })}
        </ol>
      </CardContent>
    </Card>
  )
}
