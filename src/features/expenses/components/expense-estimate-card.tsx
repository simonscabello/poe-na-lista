"use client"

import { Info, TrendingUp } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { formatCurrency } from "@/lib/format-currency"
import type { ExpenseEstimateDTO } from "@/types/domain"

export function ExpenseEstimateCard({ estimate }: { estimate: ExpenseEstimateDTO }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <div className="rounded-2xl bg-primary/5 p-5 ring-1 ring-primary/20">
        <div className="flex items-center justify-between gap-2">
          <p className="text-section-label flex items-center gap-1.5 text-primary">
            <TrendingUp className="size-4" />
            Estimativa da próxima compra
          </p>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Como calculamos"
            onClick={() => setOpen(true)}
          >
            <Info className="size-4" />
          </Button>
        </div>
        <p className="mt-1 font-heading text-2xl font-semibold tracking-tight tabular-nums">
          {formatCurrency(estimate.min)} a {formatCurrency(estimate.max)}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">Valor aproximado, não é uma garantia.</p>
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" className="safe-bottom">
          <SheetHeader>
            <SheetTitle>Como calculamos</SheetTitle>
            <SheetDescription>A estimativa é uma aproximação, nunca uma garantia.</SheetDescription>
          </SheetHeader>
          <div className="space-y-3 px-4 pb-6 text-sm text-muted-foreground">
            <p>{estimate.method}</p>
            <p>
              Consideramos a média das suas {estimate.basedOnPurchases}{" "}
              {estimate.basedOnPurchases === 1 ? "última compra" : "últimas compras"}
              {estimate.hasItemPricing
                ? " e os últimos preços conhecidos dos produtos da sua lista atual."
                : "."}
            </p>
            <p>
              A faixa aplica uma margem de 10% para cima e para baixo sobre esse valor-base, porque
              preços e quantidades variam a cada compra.
            </p>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
