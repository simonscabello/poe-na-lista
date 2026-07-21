"use client"

import { Check, Copy, Share2 } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"

const SHARE_TITLE = "Põe na Lista"

function buildMessage(url: string) {
  return `Chega de lista no papel e mensagem perdida no zap. Uso o Põe na Lista pra organizar as compras da casa com todo mundo — entra aí: ${url}`
}

export function RecommendFriendSheet() {
  const [open, setOpen] = useState(false)
  const [url, setUrl] = useState("")
  const [copied, setCopied] = useState(false)
  const [canShare, setCanShare] = useState(false)

  useEffect(() => {
    setUrl(window.location.origin)
    setCanShare(typeof navigator.share === "function")
  }, [])

  const message = buildMessage(url)

  async function copyMessage() {
    try {
      await navigator.clipboard.writeText(message)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      toast.success("Mensagem copiada")
    } catch {
      toast.error("Não foi possível copiar a mensagem")
    }
  }

  async function share() {
    try {
      // Não passar `url` junto: a mensagem já inclui o link e apps concatenam os dois.
      await navigator.share({ title: SHARE_TITLE, text: message })
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return
      }
      toast.error("Não foi possível compartilhar")
    }
  }

  return (
    <>
      <Button variant="outline" className="w-full" onClick={() => setOpen(true)}>
        <Share2 className="size-4" />
        Recomendar para um amigo
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" className="gap-0">
          <SheetHeader>
            <SheetTitle>Recomendar para um amigo</SheetTitle>
            <SheetDescription>
              Compartilhe o Põe na Lista com quem você quer organizar as compras.
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-4 p-4 pt-0 safe-bottom">
            <Textarea
              readOnly
              value={message}
              rows={3}
              onFocus={(event) => event.target.select()}
            />

            <div className="flex flex-col gap-2 sm:flex-row">
              {canShare && (
                <Button className="flex-1" onClick={share}>
                  <Share2 className="size-4" />
                  Compartilhar
                </Button>
              )}
              <Button variant="outline" className="flex-1" onClick={copyMessage}>
                {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                {copied ? "Copiado" : "Copiar mensagem"}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
