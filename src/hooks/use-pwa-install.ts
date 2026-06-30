"use client"

import { useCallback, useEffect, useRef, useState } from "react"

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

type Platform = "android" | "ios" | null

const DISMISS_KEY = "poe_na_lista:install-prompt-dismissed-at"
const DISMISS_DAYS = 7
const MOBILE_QUERY = "(max-width: 639px)"

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  )
}

function isIos() {
  const ua = navigator.userAgent
  const isIosDevice = /iPhone|iPad|iPod/i.test(ua)
  const isChromeIos = /CriOS|FxiOS/i.test(ua)
  return isIosDevice && !isChromeIos
}

function isRecentlyDismissed() {
  const raw = localStorage.getItem(DISMISS_KEY)
  if (!raw) return false
  const dismissedAt = Number(raw)
  if (Number.isNaN(dismissedAt)) return false
  const elapsedDays = (Date.now() - dismissedAt) / (1000 * 60 * 60 * 24)
  return elapsedDays < DISMISS_DAYS
}

export function usePwaInstall() {
  const deferredPrompt = useRef<BeforeInstallPromptEvent | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [platform, setPlatform] = useState<Platform>(null)
  const [canInstallAndroid, setCanInstallAndroid] = useState(false)
  const [isHidden, setIsHidden] = useState(false)

  useEffect(() => {
    if (isStandalone() || isRecentlyDismissed()) {
      setIsReady(true)
      setIsHidden(true)
      return
    }

    const mobile = window.matchMedia(MOBILE_QUERY).matches
    if (!mobile) {
      setIsReady(true)
      setIsHidden(true)
      return
    }

    if (isIos()) {
      setPlatform("ios")
    }
    setIsReady(true)

    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault()
      deferredPrompt.current = event as BeforeInstallPromptEvent
      setPlatform("android")
      setCanInstallAndroid(true)
    }

    const onAppInstalled = () => {
      deferredPrompt.current = null
      setCanInstallAndroid(false)
      setIsHidden(true)
    }

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt)
    window.addEventListener("appinstalled", onAppInstalled)

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt)
      window.removeEventListener("appinstalled", onAppInstalled)
    }
  }, [])

  const dismiss = useCallback(() => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()))
    setIsHidden(true)
  }, [])

  const install = useCallback(async () => {
    const event = deferredPrompt.current
    if (!event) return

    await event.prompt()
    const { outcome } = await event.userChoice
    deferredPrompt.current = null
    setCanInstallAndroid(false)

    if (outcome === "accepted") {
      setIsHidden(true)
      return
    }

    dismiss()
  }, [dismiss])

  const shouldShow =
    isReady && !isHidden && (platform === "ios" || (platform === "android" && canInstallAndroid))

  return { isReady, shouldShow, platform, install, dismiss }
}
