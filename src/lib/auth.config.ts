import type { NextAuthConfig } from "next-auth"
import Google from "next-auth/providers/google"

const authUrl = process.env.AUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL
const useSecureCookies = authUrl?.startsWith("https://") ?? false

export const authConfig = {
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  trustHost: true,
  useSecureCookies,
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user
      const isProtected = request.nextUrl.pathname.startsWith("/dashboard")

      if (isProtected) {
        return isLoggedIn
      }

      return true
    },
    session({ session, token }) {
      if (token.sub) {
        session.user.id = token.sub
      }
      return session
    },
  },
} satisfies NextAuthConfig
