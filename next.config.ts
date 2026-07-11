import { withSentryConfig } from "@sentry/nextjs"
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

export default withSentryConfig(withSerwist(nextConfig), {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: "simon-scabello",

  project: "javascript-nextjs",

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  tunnelRoute: "/monitoring",

  webpack: {
    // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
    // See the following for more information:
    // https://docs.sentry.io/product/crons/
    // https://vercel.com/docs/cron-jobs
    automaticVercelMonitors: true,

    // Tree-shaking options for reducing bundle size
    treeshake: {
      // Automatically tree-shake Sentry logger statements to reduce bundle size
      removeDebugLogging: true,
    },
  },
})
