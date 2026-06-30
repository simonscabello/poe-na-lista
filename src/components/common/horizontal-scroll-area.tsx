"use client"

import { type PointerEvent, type ReactNode, useRef } from "react"
import { cn } from "@/lib/utils"

const DRAG_THRESHOLD = 5

type HorizontalScrollAreaProps = {
  children: ReactNode
  className?: string
}

export function HorizontalScrollArea({ children, className }: HorizontalScrollAreaProps) {
  const ref = useRef<HTMLDivElement>(null)
  const drag = useRef({ active: false, moved: false, startX: 0, startScroll: 0 })

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== "mouse") return
    const el = ref.current
    if (!el) return
    drag.current = { active: true, moved: false, startX: event.clientX, startScroll: el.scrollLeft }
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    const el = ref.current
    if (!el || !drag.current.active) return
    const delta = event.clientX - drag.current.startX
    if (!drag.current.moved && Math.abs(delta) < DRAG_THRESHOLD) return
    if (!drag.current.moved) {
      drag.current.moved = true
      el.setPointerCapture(event.pointerId)
    }
    el.scrollLeft = drag.current.startScroll - delta
  }

  function endDrag() {
    drag.current.active = false
  }

  function handleClickCapture(event: React.MouseEvent<HTMLDivElement>) {
    if (drag.current.moved) {
      event.preventDefault()
      event.stopPropagation()
      drag.current.moved = false
    }
  }

  return (
    <div
      ref={ref}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onClickCapture={handleClickCapture}
      className={cn(
        "flex gap-2 overflow-x-auto px-4 select-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:cursor-grab sm:[scrollbar-width:thin] sm:active:cursor-grabbing sm:[&::-webkit-scrollbar]:h-1.5 sm:[&::-webkit-scrollbar-thumb]:rounded-full sm:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/30",
        className,
      )}
    >
      {children}
    </div>
  )
}
