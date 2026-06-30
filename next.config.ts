import withSerwistInit from "@serwist/next"
import type { NextConfig } from "next"
import { APP_ICON_PATHS } from "./src/lib/app-icons"

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
})

const nextConfig: NextConfig = {
  // Cache Components (Next 16): serve a static shell instantly and stream dynamic,
  // request-time data (auth/DB) behind <Suspense>. Data stays dynamic/fresh by default.
  cacheComponents: true,
  // Serwist injects a webpack config; this silences the Next 16 Turbopack default warning.
  // Production builds still use webpack via `next build --webpack` (required for the SW bundle).
  turbopack: {},
  serverExternalPackages: ["@prisma/client", "mariadb", "@prisma/adapter-mariadb"],
  async redirects() {
    return [
      {
        source: "/favicon.ico",
        destination: APP_ICON_PATHS.favicon,
        permanent: true,
      },
    ]
  },
}

export default withSerwist(nextConfig)
