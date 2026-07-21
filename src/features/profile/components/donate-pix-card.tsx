"use client"

import { Check, Copy, Heart } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DONATION_PIX_PAYLOAD } from "@/lib/pix"

export function DonatePixCard() {
  const [copied, setCopied] = useState(false)

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
          <Heart className="size-4 text-primary" />
          Ajude o desenvolvedor
        </CardTitle>
        <CardDescription>
          Doe via PIX. Qualquer valor ajuda a manter o Põe na Lista no ar.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <Button variant="outline" className="w-full" onClick={copyPixCode}>
          {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
          {copied ? "Código copiado" : "Copiar código PIX"}
        </Button>
        <p className="text-xs text-muted-foreground">
          No celular, o banco pode sugerir o pagamento assim que o código for copiado.
        </p>
      </CardContent>
    </Card>
  )
}
