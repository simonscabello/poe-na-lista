import { LinkButton } from "@/components/common/link-button"
import { Skeleton } from "@/components/ui/skeleton"
import { auth } from "@/lib/auth"

export async function HeaderAuthActions() {
  const session = await auth()

  if (session?.user) {
    return (
      <LinkButton size="sm" href="/dashboard">
        Dashboard
      </LinkButton>
    )
  }

  return (
    <>
      <LinkButton variant="ghost" size="sm" href="/login">
        Entrar
      </LinkButton>
      <LinkButton size="sm" className="hidden sm:inline-flex" href="/dashboard">
        Dashboard
      </LinkButton>
    </>
  )
}

export function HeaderAuthActionsFallback() {
  return (
    <>
      <Skeleton className="h-8 w-14 rounded-lg" />
      <Skeleton className="hidden h-8 w-24 rounded-lg sm:inline-flex" />
    </>
  )
}
