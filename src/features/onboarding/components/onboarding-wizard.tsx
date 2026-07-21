"use client"

import {
  ArrowLeft,
  ArrowRight,
  type LucideIcon,
  PiggyBank,
  ShoppingCart,
  Sparkles,
  Users,
} from "lucide-react"
import { useState, useTransition } from "react"
import { toast } from "sonner"
import { completeOnboardingAction } from "@/actions/onboarding.actions"
import { AppLogo } from "@/components/common/app-logo"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type Slide = {
  icon: LucideIcon
  title: string
  description: string
  points: string[]
}

const SLIDES: Slide[] = [
  {
    icon: Sparkles,
    title: "Bem-vindo ao Põe na Lista",
    description:
      "As compras da casa, organizadas e compartilhadas com quem mora com você. Vamos dar uma volta rápida pelo que dá para fazer.",
    points: [
      "Listas que todo mundo do grupo edita junto",
      "Preços no mercado e controle de gastos",
      "Tudo sincronizado entre celular e computador",
    ],
  },
  {
    icon: Users,
    title: "Grupos e convites",
    description:
      "Tudo acontece dentro de um grupo. Crie o seu (família, república, igreja) e convide as pessoas por um link.",
    points: [
      "Você é o dono e gerencia quem entra",
      "Convide por link — cada um usa a própria conta",
      "Dá para participar de vários grupos e alternar entre eles",
    ],
  },
  {
    icon: ShoppingCart,
    title: "Listas e produtos",
    description:
      "Crie listas de compras e adicione produtos do catálogo do grupo. Não achou o item? Crie na hora.",
    points: [
      "Lista de compras do dia a dia ou projeto com teto de gasto",
      "Catálogo compartilhado que cresce com o uso",
      "Marque itens como comprados com um toque ou deslizando",
    ],
  },
  {
    icon: PiggyBank,
    title: "No mercado e nos gastos",
    description:
      "Use o modo mercado para anotar preços enquanto compra, finalize a compra e acompanhe para onde vai o dinheiro.",
    points: [
      "Total do carrinho somado em tempo real",
      "Despensa avisa quando algo está acabando",
      "Orçamento do mês e gastos por categoria e mercado",
    ],
  },
]

type OnboardingWizardProps = {
  /** Se o usuário já pertence a um grupo (ex.: entrou por convite). */
  hasHousehold: boolean
}

export function OnboardingWizard({ hasHousehold }: OnboardingWizardProps) {
  const [index, setIndex] = useState(0)
  const [finishing, startFinishing] = useTransition()

  const isLast = index === SLIDES.length - 1

  function finishTour() {
    startFinishing(async () => {
      const result = await completeOnboardingAction()
      if (!result.success) {
        toast.error(result.error)
        return
      }
      // Sem grupo: /dashboard/lists mostra OnboardingView (criar/entrar).
      // Com grupo: dashboard normal.
      window.location.assign("/dashboard/lists")
    })
  }

  function next() {
    if (isLast) {
      finishTour()
      return
    }
    setIndex((current) => current + 1)
  }

  function back() {
    setIndex((current) => Math.max(0, current - 1))
  }

  const slide = SLIDES[index]
  const Icon = slide.icon

  return (
    <div className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-background safe-bottom">
      <div className="flex items-center justify-between px-4 py-4 sm:px-6">
        <AppLogo size="sm" />
        <Button variant="ghost" size="sm" onClick={finishTour} disabled={finishing}>
          Pular
        </Button>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-6 pb-10">
        <div key={index} className="animate-fade-up w-full max-w-md space-y-6 text-center">
          <span className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Icon className="size-8" />
          </span>

          <div className="space-y-2">
            <h1 className="text-page-title font-heading">{slide.title}</h1>
            <p className="text-sm text-muted-foreground">{slide.description}</p>
          </div>

          <ul className="mx-auto max-w-sm space-y-2 text-left">
            {slide.points.map((point) => (
              <li key={point} className="flex items-start gap-2 text-sm">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                <span className="text-foreground">{point}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mx-auto w-full max-w-md space-y-4 px-6 pb-8">
        <div className="flex items-center justify-center gap-1.5" aria-hidden>
          {SLIDES.map((item, dotIndex) => (
            <span
              key={item.title}
              className={cn(
                "h-1.5 rounded-full transition-all duration-[var(--duration-normal)]",
                dotIndex === index ? "w-5 bg-primary" : "w-1.5 bg-muted",
              )}
            />
          ))}
        </div>

        <div className="flex items-center gap-3">
          {index > 0 ? (
            <Button variant="outline" onClick={back} disabled={finishing} className="flex-1">
              <ArrowLeft className="size-4" />
              Voltar
            </Button>
          ) : null}
          <Button onClick={next} loading={finishing} className="flex-1">
            {isLast ? (hasHousehold ? "Começar a usar" : "Criar meu grupo") : "Próximo"}
            {!isLast ? <ArrowRight className="size-4" /> : null}
          </Button>
        </div>
      </div>
    </div>
  )
}
