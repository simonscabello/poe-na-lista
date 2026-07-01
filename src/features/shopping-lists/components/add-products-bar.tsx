"use client"

import { Plus } from "lucide-react"
import { useState } from "react"
import { Container } from "@/components/layout/container"
import { Button } from "@/components/ui/button"
import { ProductCatalogSheet } from "@/features/products/components/product-catalog-sheet"
import type { CategoryDTO, ProductDTO } from "@/types/domain"

type AddProductsBarProps = {
  householdId: string
  catalog: ProductDTO[]
  frequent: ProductDTO[]
  categories: CategoryDTO[]
  /** productId → quantity currently in the list, for live badges in the sheet. */
  inList: Map<string, number>
  onAdd: (product: ProductDTO) => void
  onAddOne: (product: ProductDTO) => void
  onRemoveOne: (product: ProductDTO) => void
}

export function AddProductsBar({
  householdId,
  catalog,
  frequent,
  categories,
  inList,
  onAdd,
  onAddOne,
  onRemoveOne,
}: AddProductsBarProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/*
        Sits just above the global mobile tab bar (BottomNav, ~4rem + safe area) so
        the action stays visible while scrolling a long list without the nav
        covering it. The small overlap hides behind the nav (z-40 > z-30); pt/pb
        keep the button clear of it. On sm+ the nav is hidden, so it drops to the
        bottom edge with the device safe area.
      */}
      <div className="sticky bottom-[calc(4rem_+_env(safe-area-inset-bottom))] z-30 border-t bg-background/85 pt-3 pb-3 backdrop-blur-xl sm:bottom-0 sm:pb-[calc(0.75rem_+_env(safe-area-inset-bottom))]">
        <Container size="wide">
          <Button
            type="button"
            onClick={() => setOpen(true)}
            className="h-13 w-full rounded-2xl text-base font-semibold shadow-sm active:scale-[0.99]"
          >
            <Plus className="size-5" />
            Adicionar produtos
          </Button>
        </Container>
      </div>

      <ProductCatalogSheet
        open={open}
        onOpenChange={setOpen}
        householdId={householdId}
        catalog={catalog}
        frequent={frequent}
        categories={categories}
        inList={inList}
        onAdd={onAdd}
        onAddOne={onAddOne}
        onRemoveOne={onRemoveOne}
      />
    </>
  )
}
