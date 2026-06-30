import type { NextAuthConfig } from "next-auth"
import Google from "next-auth/providers/google"

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
