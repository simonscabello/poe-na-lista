"use client"

import { useRouter } from "next/navigation"
import { useEffect, useRef } from "react"

const DEFAULT_INTERVAL_MS = 4000

/**
 * Sincronização quase em tempo real por polling leve: consulta uma assinatura
 * de versão da lista e só dispara router.refresh() quando ela muda — o
 * payload RSC completo só trafega quando há mudança de verdade.
 *
 * Pausas: aba oculta (economia de bateria/servidor) e input focado (um
 * refresh no meio da digitação de preço perderia o que o usuário digitou).
 * Erros de rede são silenciosos — polling nunca pode quebrar a lista.
 */
export function useListSync(
  fetchVersion: () => Promise<string | null>,
  intervalMs = DEFAULT_INTERVAL_MS,
) {
  const router = useRouter()
  const lastVersionRef = useRef<string | null>(null)
  const inFlightRef = useRef(false)
  const fetchRef = useRef(fetchVersion)
  fetchRef.current = fetchVersion

  useEffect(() => {
    let stopped = false

    async function tick() {
      if (stopped || inFlightRef.current) return
      if (document.visibilityState === "hidden") return
      const active = document.activeElement
      if (active instanceof HTMLInputElement || active instanceof HTMLTextAreaElement) return

      inFlightRef.current = true
      try {
        const version = await fetchRef.current()
        if (stopped || version == null) return
        if (lastVersionRef.current == null) {
          lastVersionRef.current = version
          return
        }
        if (version !== lastVersionRef.current) {
          lastVersionRef.current = version
          router.refresh()
        }
      } catch {
        // rede instável não pode derrubar a página
      } finally {
        inFlightRef.current = false
      }
    }

    tick()
    const intervalId = setInterval(tick, intervalMs)

    function onVisibilityChange() {
      if (document.visibilityState === "visible") tick()
    }
    document.addEventListener("visibilitychange", onVisibilityChange)

    return () => {
      stopped = true
      clearInterval(intervalId)
      document.removeEventListener("visibilitychange", onVisibilityChange)
    }
  }, [intervalMs, router])
}
