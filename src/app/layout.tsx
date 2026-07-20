import type { Metadata, Viewport } from "next"
import { Bricolage_Grotesque, Geist, Geist_Mono } from "next/font/google"
import { Providers } from "@/components/layout/providers"
import { appMetadataIcons } from "@/lib/app-icons"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

// Voz tipográfica da marca: títulos em Bricolage Grotesque, corpo em Geist.
const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin", "latin-ext"],
})

// Not used by any visible text yet (only wired as a CSS variable), so it
// shouldn't be eagerly preloaded — that trips the browser's unused-preload warning.
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  preload: false,
})

export const metadata: Metadata = {
  title: {
    default: "Põe na Lista",
    template: "%s | Põe na Lista",
  },
  description:
    "Lista de compras compartilhada com modo mercado, controle de gastos e despensa automática — para a família ou qualquer grupo",
  applicationName: "Põe na Lista",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Põe na Lista",
  },
  formatDetection: {
    telephone: false,
  },
  icons: appMetadataIcons,
  openGraph: {
    title: "Põe na Lista",
    description:
      "Lista de compras compartilhada com modo mercado, controle de gastos e despensa automática — para a família ou qualquer grupo",
    type: "website",
    locale: "pt_BR",
    siteName: "Põe na Lista",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Põe na Lista" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Põe na Lista",
    description:
      "Lista de compras compartilhada com modo mercado, controle de gastos e despensa automática",
    images: ["/og-image.png"],
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0e7a50" },
    { media: "(prefers-color-scheme: dark)", color: "#111b16" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} ${bricolage.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body
        className="flex min-h-full flex-col bg-background font-sans text-foreground"
        suppressHydrationWarning
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
