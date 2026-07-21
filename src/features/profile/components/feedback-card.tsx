"use client"

import { Check, Copy, Heart, Star } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { submitFeedbackAction } from "@/actions/feedback.actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { DONATION_PIX_PAYLOAD } from "@/lib/pix"
import { cn } from "@/lib/utils"
import type { FeedbackDTO } from "@/types/domain"

const STARS = [1, 2, 3, 4, 5] as const
const MAX_COMMENT = 500

type FeedbackCardProps = {
  initialFeedback: FeedbackDTO | null
}

export function FeedbackCard({ initialFeedback }: FeedbackCardProps) {
  const [rating, setRating] = useState(initialFeedback?.rating ?? 0)
  const [hover, setHover] = useState(0)
  const [comment, setComment] = useState(initialFeedback?.comment ?? "")
  const [submitting, setSubmitting] = useState(false)
  // Revela o PIX após avaliar; se já avaliou antes, começa revelado.
  const [showPix, setShowPix] = useState(initialFeedback !== null)
  const [copied, setCopied] = useState(false)

  const highlighted = hover || rating

  async function submit() {
    if (rating < 1) {
      toast.error("Escolha de 1 a 5 estrelas")
      return
    }

    setSubmitting(true)
    const result = await submitFeedbackAction({
      rating,
      comment: comment.trim() || undefined,
    })
    setSubmitting(false)

    if (!result.success) {
      toast.error(result.error)
      return
    }

    setShowPix(true)
    toast.success("Obrigado pela avaliação!")
  }

  async function copyPixCode() {
    try {
      await navigator.clipboard.writeText(DONATION_PIX_PAYLOAD)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      toast.success("Código PIX copiado — cole no app do banco")
    } catch {
      toast.error("Não foi possível copiar o código PIX")
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="size-4 text-primary" />
          Avalie o Põe na Lista
        </CardTitle>
        <CardDescription>
          Sua opinião ajuda a melhorar o app. Conte o que achou e deixe uma sugestão.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-1">
          {STARS.map((value) => (
            <button
              key={value}
              type="button"
              aria-label={`${value} ${value === 1 ? "estrela" : "estrelas"}`}
              aria-pressed={rating === value}
              className="rounded-md p-1 transition-transform active:scale-90"
              onMouseEnter={() => setHover(value)}
              onMouseLeave={() => setHover(0)}
              onFocus={() => setHover(value)}
              onBlur={() => setHover(0)}
              onClick={() => setRating(value)}
            >
              <Star
                className={cn(
                  "size-7 transition-colors",
                  value <= highlighted
                    ? "fill-primary text-primary"
                    : "fill-transparent text-muted-foreground/40",
                )}
              />
            </button>
          ))}
        </div>

        <div className="space-y-1">
          <Textarea
            value={comment}
            onChange={(event) => setComment(event.target.value.slice(0, MAX_COMMENT))}
            placeholder="O que você mais gosta? O que poderia melhorar? (opcional)"
            rows={3}
          />
          <p className="text-right text-xs text-muted-foreground">
            {comment.length}/{MAX_COMMENT}
          </p>
        </div>

        <Button className="w-full" disabled={submitting || rating < 1} onClick={submit}>
          {initialFeedback ? "Atualizar avaliação" : "Enviar avaliação"}
        </Button>

        {showPix && (
          <div className="space-y-2 rounded-xl bg-primary/5 p-4 ring-1 ring-primary/20">
            <p className="flex items-center gap-2 text-sm font-medium">
              <Heart className="size-4 text-primary" />
              Curtiu o app? Ajude o desenvolvedor
            </p>
            <p className="text-xs text-muted-foreground">
              Doe via PIX. Qualquer valor ajuda a manter o Põe na Lista no ar.
            </p>
            <Button variant="outline" className="w-full" onClick={copyPixCode}>
              {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
              {copied ? "Código copiado" : "Copiar código PIX"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
