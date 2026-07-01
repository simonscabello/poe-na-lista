"use client"

import { Check, Copy, Link2, Share2, Trash2 } from "lucide-react"
import { useEffect, useMemo, useState, useTransition } from "react"
import { toast } from "sonner"
import { createShareLinkAction, revokeShareLinkAction } from "@/actions/list-share.actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { formatListShareText } from "@/lib/format-list-share"
import { cn } from "@/lib/utils"
import type { ShoppingListItemDTO, ShoppingListShareDTO } from "@/types/domain"

type ExpiryOption = { label: string; days: number | null }

const EXPIRY_OPTIONS: ExpiryOption[] = [
  { label: "7 dias", days: 7 },
  { label: "30 dias", days: 30 },
  { label: "Sem expiração", days: null },
]

type ShareListSheetProps = {
  listId: string
  listName: string
  items: ShoppingListItemDTO[]
  initialShare: ShoppingListShareDTO | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ShareListSheet({
  listId,
  listName,
  items,
  initialShare,
  open,
  onOpenChange,
}: ShareListSheetProps) {
  const [share, setShare] = useState<ShoppingListShareDTO | null>(initialShare)
  const [origin, setOrigin] = useState("")
  const [expiryDays, setExpiryDays] = useState<number | null>(30)
  const [copied, setCopied] = useState(false)
  const [canShare, setCanShare] = useState(false)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    setShare(initialShare)
  }, [initialShare])

  useEffect(() => {
    setOrigin(window.location.origin)
    setCanShare(typeof navigator.share === "function")
  }, [])

  const publicUrl = share ? `${origin}/share/${share.token}` : null

  // Compartilha o que ainda falta comprar; se tudo estiver marcado, usa a lista toda.
  const shareableItems = useMemo(() => {
    const pending = items.filter((item) => !item.checked)
    return pending.length > 0 ? pending : items
  }, [items])

  const shareText = useMemo(
    () =>
      formatListShareText({
        listName,
        items: shareableItems,
        appUrl: publicUrl ?? (origin || null),
      }),
    [listName, shareableItems, publicUrl, origin],
  )

  async function copyToClipboard(value: string, message: string) {
    try {
      await navigator.clipboard.writeText(value)
      toast.success(message)
      return true
    } catch {
      toast.error("Não foi possível copiar")
      return false
    }
  }

  async function shareViaSystem() {
    try {
      await navigator.share({ title: listName, text: shareText })
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return
      }
      toast.error("Não foi possível compartilhar")
    }
  }

  function generateLink() {
    startTransition(async () => {
      const result = await createShareLinkAction(listId, { expiresInDays: expiryDays })
      if (!result.success) {
        toast.error(result.error)
        return
      }
      setShare(result.data)
      toast.success("Link público gerado")
    })
  }

  function revokeLink() {
    startTransition(async () => {
      const result = await revokeShareLinkAction(listId)
      if (!result.success) {
        toast.error(result.error)
        return
      }
      setShare(null)
      toast.success("Link revogado")
    })
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[92dvh] overflow-y-auto safe-bottom">
        <SheetHeader>
          <SheetTitle>Compartilhar lista</SheetTitle>
          <SheetDescription>
            Envie os itens para quem vai fazer a compra. Isso não adiciona a pessoa ao grupo.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-5 px-4 pb-6">
          <div className="space-y-3">
            <pre className="max-h-48 overflow-y-auto whitespace-pre-wrap rounded-xl bg-muted/60 p-3 font-sans text-sm text-foreground ring-1 ring-border/60">
              {shareText}
            </pre>
            <div className="flex flex-col gap-2 sm:flex-row">
              {canShare && (
                <Button onClick={shareViaSystem} className="flex-1">
                  <Share2 className="size-4" />
                  Compartilhar
                </Button>
              )}
              <Button
                variant={canShare ? "outline" : "default"}
                onClick={() => copyToClipboard(shareText, "Texto copiado")}
                className="flex-1"
              >
                <Copy className="size-4" />
                Copiar texto
              </Button>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="space-y-1">
              <p className="text-sm font-medium">Link público</p>
              <p className="text-xs text-muted-foreground">
                Qualquer pessoa com o link vê os itens em modo somente leitura, sem precisar entrar
                no app.
              </p>
            </div>

            {share && publicUrl ? (
              <div className="space-y-2">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <Input
                    readOnly
                    value={publicUrl}
                    className="flex-1"
                    onFocus={(event) => event.target.select()}
                  />
                  <Button
                    variant="outline"
                    className="shrink-0"
                    onClick={() =>
                      copyToClipboard(publicUrl, "Link copiado").then((ok) => {
                        if (ok) {
                          setCopied(true)
                          setTimeout(() => setCopied(false), 2000)
                        }
                      })
                    }
                  >
                    {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                    {copied ? "Copiado" : "Copiar"}
                  </Button>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs text-muted-foreground">
                    {share.expiresAt
                      ? `Expira em ${new Date(share.expiresAt).toLocaleDateString("pt-BR")}`
                      : "Sem data de expiração"}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={revokeLink}
                    disabled={isPending}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                    Revogar
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {EXPIRY_OPTIONS.map((option) => (
                    <button
                      key={option.label}
                      type="button"
                      onClick={() => setExpiryDays(option.days)}
                      className={cn(
                        "rounded-full px-3 py-1.5 text-xs font-medium ring-1 transition-colors",
                        expiryDays === option.days
                          ? "bg-primary text-primary-foreground ring-primary"
                          : "bg-muted/60 text-muted-foreground ring-border/60 hover:bg-muted",
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                <Button onClick={generateLink} disabled={isPending} className="w-full">
                  <Link2 className="size-4" />
                  Gerar link público
                </Button>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
