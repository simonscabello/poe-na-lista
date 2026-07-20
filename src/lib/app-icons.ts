import type { Metadata, MetadataRoute } from "next"

// Incrementar a cada mudança na arte dos ícones: muda as URLs no manifest e
// nos metadados, invalidando caches HTTP e disparando a detecção de update
// do ícone em PWAs instaladas (Android/desktop).
const ICON_VERSION = 2

export const APP_ICON_PATHS = {
  favicon: `/icons/favicon.png?v=${ICON_VERSION}`,
  icon192: `/icons/icon-192.png?v=${ICON_VERSION}`,
  icon512: `/icons/icon-512.png?v=${ICON_VERSION}`,
  iconMaskable512: `/icons/icon-maskable-512.png?v=${ICON_VERSION}`,
} as const

export const appMetadataIcons: NonNullable<Metadata["icons"]> = {
  icon: [
    { url: APP_ICON_PATHS.favicon, type: "image/png" },
    { url: APP_ICON_PATHS.icon192, sizes: "192x192", type: "image/png" },
    { url: APP_ICON_PATHS.icon512, sizes: "512x512", type: "image/png" },
  ],
  shortcut: APP_ICON_PATHS.favicon,
  apple: APP_ICON_PATHS.icon192,
}

export const appManifestIcons: NonNullable<MetadataRoute.Manifest["icons"]> = [
  {
    src: APP_ICON_PATHS.icon192,
    sizes: "192x192",
    type: "image/png",
    purpose: "any",
  },
  {
    src: APP_ICON_PATHS.icon512,
    sizes: "512x512",
    type: "image/png",
    purpose: "any",
  },
  {
    src: APP_ICON_PATHS.iconMaskable512,
    sizes: "512x512",
    type: "image/png",
    purpose: "maskable",
  },
]
