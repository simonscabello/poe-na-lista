import type { Metadata, MetadataRoute } from "next"

export const APP_ICON_PATHS = {
  favicon: "/icons/favicon.png",
  icon192: "/icons/icon-192.png",
  icon512: "/icons/icon-512.png",
  iconMaskable512: "/icons/icon-maskable-512.png",
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
