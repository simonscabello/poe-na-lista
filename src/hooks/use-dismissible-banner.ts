"use client"

import { useEffect, useState } from "react"

const DEFAULT_DISMISS_DAYS = 7

/** Banner/card dispensável com TTL em localStorage (some até hidratar). */
export function useDismissibleBanner(
  storageKey: string,
  dismissDays = DEFAULT_DISMISS_DAYS,
): { visible: boolean; dismiss: () => void } {
  const [dismissed, setDismissed] = useState(true)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setHydrated(true)
    const raw = localStorage.getItem(storageKey)
    if (!raw) {
      setDismissed(false)
      return
    }
    const dismissedAt = Number(raw)
    if (Number.isNaN(dismissedAt)) {
      setDismissed(false)
      return
    }
    const elapsedDays = (Date.now() - dismissedAt) / (1000 * 60 * 60 * 24)
    setDismissed(elapsedDays < dismissDays)
  }, [storageKey, dismissDays])

  function dismiss() {
    localStorage.setItem(storageKey, String(Date.now()))
    setDismissed(true)
  }

  return { visible: hydrated && !dismissed, dismiss }
}
