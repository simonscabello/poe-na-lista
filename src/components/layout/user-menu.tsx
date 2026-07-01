"use client"

import { LogOut, Shield, User } from "lucide-react"
import Link from "next/link"
import { signOut } from "next-auth/react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type UserMenuProps = {
  name: string | null
  email: string | null
  image: string | null
  isAdmin?: boolean
}

export function UserMenu({ name, email, image, isAdmin = false }: UserMenuProps) {
  const initials = (name ?? email ?? "U").slice(0, 1).toUpperCase()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon" className="rounded-full" aria-label="Conta">
            <Avatar size="sm">
              {image && <AvatarImage src={image} alt={name ?? "Usuário"} />}
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex flex-col gap-0.5">
            <span className="truncate font-medium text-foreground">{name ?? "Usuário"}</span>
            {email && <span className="truncate text-xs">{email}</span>}
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem render={<Link href="/dashboard/profile" />}>
          <User className="size-4" />
          Perfil
        </DropdownMenuItem>
        {isAdmin && (
          <DropdownMenuItem render={<Link href="/backoffice" />}>
            <Shield className="size-4" />
            Backoffice
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={() => signOut({ callbackUrl: "/" })}>
          <LogOut className="size-4" />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
