"use client"

import { useCallback, useEffect, useState } from "react"
import { deletePushSubscriptionAction, savePushSubscriptionAction } from "@/actions/push.actions"

// Duplicado de use-pwa-install (funções privadas de módulo lá).
function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  )
}

function isIos() {
  return /iPhone|iPad|iPod/i.test(navigator.userAgent)
}

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")
  const rawData = window.atob(base64)
  const output = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; i += 1) {
    output[i] = rawData.charCodeAt(i)
  }
  return output
}

export function usePushSubscription() {
  const [isReady, setIsReady] = useState(false)
  const [supported, setSupported] = useState(false)
  /** Push existe no iOS (16.4+), mas só com o app instalado na tela de início. */
  const [needsIosInstall, setNeedsIosInstall] = useState(false)
  const [permission, setPermission] = useState<NotificationPermission | null>(null)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isBusy, setIsBusy] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function detect() {
      const hasApis =
        "serviceWorker" in navigator && "PushManager" in window && "Notification" in window

      if (isIos() && !isStandalone()) {
        setNeedsIosInstall(true)
        setIsReady(true)
        return
      }

      if (!hasApis) {
        setIsReady(true)
        return
      }

      // Sem registration (SW desabilitado em dev, ou ainda registrando) não há
      // como assinar push — tratamos como não suportado neste carregamento.
      const registration = await navigator.serviceWorker.getRegistration()
      if (cancelled) return
      if (!registration) {
        setIsReady(true)
        return
      }

      const subscription = await registration.pushManager.getSubscription()
      if (cancelled) return

      setSupported(true)
      setPermission(Notification.permission)
      setIsSubscribed(subscription != null)
      setIsReady(true)
    }

    detect()
    return () => {
      cancelled = true
    }
  }, [])

  const subscribe = useCallback(async (): Promise<boolean> => {
    setIsBusy(true)
    try {
      const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      if (!publicKey) return false

      const permissionResult = await Notification.requestPermission()
      setPermission(permissionResult)
      if (permissionResult !== "granted") return false

      const registration = await navigator.serviceWorker.getRegistration()
      if (!registration) return false

      const subscription =
        (await registration.pushManager.getSubscription()) ??
        (await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey),
        }))

      const json = subscription.toJSON()
      if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) return false

      const result = await savePushSubscriptionAction({
        endpoint: json.endpoint,
        keys: { p256dh: json.keys.p256dh, auth: json.keys.auth },
      })
      if (!result.success) return false

      setIsSubscribed(true)
      return true
    } catch {
      return false
    } finally {
      setIsBusy(false)
    }
  }, [])

  const unsubscribe = useCallback(async (): Promise<void> => {
    setIsBusy(true)
    try {
      const registration = await navigator.serviceWorker.getRegistration()
      const subscription = await registration?.pushManager.getSubscription()
      if (subscription) {
        const endpoint = subscription.endpoint
        await subscription.unsubscribe()
        await deletePushSubscriptionAction(endpoint)
      }
      setIsSubscribed(false)
    } finally {
      setIsBusy(false)
    }
  }, [])

  return {
    isReady,
    supported,
    needsIosInstall,
    permission,
    isSubscribed,
    isBusy,
    subscribe,
    unsubscribe,
  }
}
