import { redirect } from "next/navigation"
import { Suspense } from "react"
import { ProfileSkeleton } from "@/features/profile/components/profile-skeleton"
import { ProfileView } from "@/features/profile/components/profile-view"
import { auth } from "@/lib/auth"
import { requireOnboardingCompleted } from "@/lib/onboarding"

export default function ProfilePage() {
  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <ProfileContent />
    </Suspense>
  )
}

async function ProfileContent() {
  const session = await auth()
  if (!session?.user) {
    redirect("/login?callbackUrl=/dashboard/profile")
  }
  await requireOnboardingCompleted(session.user.id)

  const { name, email, image } = session.user

  return <ProfileView name={name ?? null} email={email ?? null} image={image ?? null} />
}
