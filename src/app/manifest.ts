import type { MetadataRoute } from "next"
import { appManifestIcons } from "@/lib/app-icons"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Põe na Lista",
    short_name: "Põe na Lista",
    description: "Lista de compras compartilhada com controle de gastos e despensa automática",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#f7f8f3",
    theme_color: "#0e7a50",
    orientation: "portrait-primary",
    icons: appManifestIcons,
  }
}
