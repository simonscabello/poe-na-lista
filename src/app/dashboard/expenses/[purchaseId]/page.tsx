import { ArrowLeft, CalendarDays, Store } from "lucide-react"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { Suspense } from "react"
import { Container } from "@/components/layout/container"
import { Button } from "@/components/ui/button"
import { BuyAgainButton } from "@/features/expenses/components/buy-again-button"
import { auth } from "@/lib/auth"
import { formatCalendarDateLong } from "@/lib/calendar-date"
import { formatCurrency } from "@/lib/format-currency"
import { prisma } from "@/lib/prisma"
import { getPurchaseDetail, getPurchaseHouseholdId } from "@/services/purchase.service"

type PurchaseDetailPageProps = {
  params: Promise<{ purchaseId: string }>
}

export default function PurchaseDetailPage({ params }: PurchaseDetailPageProps) {
  return (
    <Suspense fallback={null}>
      {params.then(({ purchaseId }) => (
        <PurchaseDetailContent purchaseId={purchaseId} />
      ))}
    </Suspense>
  )
}

async function PurchaseDetailContent({ purchaseId }: { purchaseId: string }) {
  const session = await auth()
  if (!session?.user) {
    redirect(`/login?callbackUrl=/dashboard/expenses/${purchaseId}`)
  }

  const householdId = await getPurchaseHouseholdId(purchaseId)
  if (!householdId) {
    notFound()
  }

  const membership = await prisma.householdMember.findUnique({
    where: { userId_householdId: { userId: session.user.id, householdId } },
    select: { id: true },
  })
  if (!membership) {
    notFound()
  }

  const purchase = await getPurchaseDetail(purchaseId)
  if (!purchase) {
    notFound()
  }

  return (
    <Container size="wide" className="space-y-6 py-6">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Voltar"
          render={<Link href="/dashboard/expenses" />}
        >
          <ArrowLeft className="size-4" />
        </Button>
        <h1 className="text-page-title min-w-0 flex-1 truncate text-xl">
          {purchase.listName ?? "Compra avulsa"}
        </h1>
      </div>

      <div className="rounded-2xl bg-card p-5 ring-1 ring-border/70">
        <p className="font-heading text-3xl font-semibold tabular-nums">
          {formatCurrency(purchase.totalAmount)}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <CalendarDays className="size-3.5" />
            {formatCalendarDateLong(purchase.purchasedAt)}
          </span>
          {purchase.storeName && (
            <span className="inline-flex items-center gap-1">
              <Store className="size-3.5" />
              {purchase.storeName}
            </span>
          )}
        </div>
        {purchase.notes && <p className="mt-3 text-sm text-muted-foreground">{purchase.notes}</p>}
        {purchase.items.length > 0 && (
          <div className="mt-4">
            <BuyAgainButton purchaseId={purchase.id} />
          </div>
        )}
      </div>

      {purchase.items.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-section-label px-0.5">Itens</h2>
          <ul className="divide-y divide-border/60 overflow-hidden rounded-2xl bg-card ring-1 ring-border/70">
            {purchase.items.map((item) => (
              <li key={item.id} className="flex items-center gap-3 px-4 py-3">
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{item.productName}</span>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {Number.isInteger(item.quantity) ? item.quantity : item.quantity.toFixed(2)}
                    {item.unit ? ` ${item.unit}` : ""}
                    {item.unitPrice != null ? ` · ${formatCurrency(item.unitPrice)}` : ""}
                  </span>
                </span>
                {item.totalPrice != null && (
                  <span className="shrink-0 text-sm font-medium tabular-nums">
                    {formatCurrency(item.totalPrice)}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </Container>
  )
}
