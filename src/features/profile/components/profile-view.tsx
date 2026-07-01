import { ChevronRight, HelpCircle, LogIn, Users } from "lucide-react"
import Link from "next/link"
import { Container } from "@/components/layout/container"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { JoinHouseholdForm } from "@/features/households/components/join-household-form"
import { HelpFaqSection } from "@/features/profile/components/help-faq-section"
import { ProfileHeader } from "@/features/profile/components/profile-header"
import { RecommendFriendSheet } from "@/features/profile/components/recommend-friend-sheet"
import { SignOutButton } from "@/features/profile/components/sign-out-button"

type ProfileViewProps = {
  name: string | null
  email: string | null
  image: string | null
}

export function ProfileView({ name, email, image }: ProfileViewProps) {
  return (
    <Container size="narrow" className="space-y-6 py-6">
      <ProfileHeader name={name} email={email} image={image} />

      <Link
        href="/dashboard/household"
        className="flex items-center gap-3 rounded-2xl bg-card p-4 ring-1 ring-border/70 transition-colors hover:bg-muted/40 active:scale-[0.99]"
      >
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Users className="size-5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-medium">Meu grupo</span>
          <span className="block text-xs text-muted-foreground">Membros e convites</span>
        </span>
        <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
      </Link>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LogIn className="size-4 text-primary" />
            Entrar com convite
          </CardTitle>
          <CardDescription>
            Recebeu um convite para outro grupo? Cole o link ou código aqui.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <JoinHouseholdForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="size-4 text-primary" />
            Ajuda e Dicas
          </CardTitle>
          <CardDescription>Perguntas frequentes sobre o Põe na Lista.</CardDescription>
        </CardHeader>
        <CardContent>
          <HelpFaqSection />
        </CardContent>
      </Card>

      <RecommendFriendSheet />

      <SignOutButton />
    </Container>
  )
}
