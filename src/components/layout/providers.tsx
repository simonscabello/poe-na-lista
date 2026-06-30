"use client"

import { QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { Provider as JotaiProvider } from "jotai"
import { SessionProvider } from "next-auth/react"
import { ThemeProvider } from "next-themes"
import { Suspense, useState } from "react"
import { InstallPrompt } from "@/components/pwa/install-prompt"
import { Toaster } from "@/components/ui/sonner"
import { createQueryClient } from "@/lib/query-client"

type ProvidersProps = {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(() => createQueryClient())

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <JotaiProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Suspense fallback={null}>
              <InstallPrompt />
            </Suspense>
            <Toaster closeButton position="top-center" />
          </ThemeProvider>
        </JotaiProvider>
        <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
      </QueryClientProvider>
    </SessionProvider>
  )
}
