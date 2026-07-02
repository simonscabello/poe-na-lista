/// <reference lib="webworker" />
import { defaultCache, PAGES_CACHE_NAME } from "@serwist/next/worker"
import type { PrecacheEntry, RuntimeCaching, SerwistGlobalConfig } from "serwist"
import { Serwist } from "serwist"

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined
  }
}

declare const self: ServiceWorkerGlobalScope

// Listas são compartilhadas entre membros do household e o conteúdo é sempre
// dinâmico (dados de banco por requisição). Cachear a navegação/RSC dessas
// páginas nunca ajuda — o payload é único por lista — e ainda causava um
// "no-response" no clique de uma lista: o Next.js cancela o fetch de
// navegação em voo, o NetworkFirst do defaultCache não tinha cache nem
// timeout para cair de volta, e a troca de tela parecia travar até um
// segundo clique. Por isso removemos as entradas de navegação/RSC/HTML e o
// catch-all genérico do defaultCache, deixando essas requisições passarem
// direto pela rede sem o service worker interceptá-las.
const EXCLUDED_NAVIGATION_CACHE_NAMES: string[] = [
  PAGES_CACHE_NAME.rscPrefetch,
  PAGES_CACHE_NAME.rsc,
  PAGES_CACHE_NAME.html,
  "others",
  "cross-origin",
]

function isNavigationCacheEntry(entry: RuntimeCaching): boolean {
  const cacheName = (entry.handler as { cacheName?: string }).cacheName
  if (cacheName && EXCLUDED_NAVIGATION_CACHE_NAMES.includes(cacheName)) return true
  return entry.matcher instanceof RegExp && entry.matcher.source === ".*"
}

const runtimeCaching = defaultCache.filter((entry) => !isNavigationCacheEntry(entry))

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching,
})

serwist.addEventListeners()
