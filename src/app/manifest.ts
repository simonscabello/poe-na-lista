import type { MetadataRoute } from "next"
import { appManifestIcons } from "@/lib/app-icons"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Põe na Lista",
    short_name: "Põe Lista",
    description: "Organize suas compras em grupo com quem você quiser",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#16a34a",
    orientation: "portrait-primary",
    icons: appManifestIcons,
  }
}
