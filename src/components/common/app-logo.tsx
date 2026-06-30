import Image from "next/image"
import { cn } from "@/lib/utils"

const sizeMap = {
  sm: 20,
  md: 28,
  lg: 48,
} as const

type AppLogoProps = {
  size?: keyof typeof sizeMap
  className?: string
}

export function AppLogo({ size = "md", className }: AppLogoProps) {
  const px = sizeMap[size]

  return (
    <Image
      src="/icons/icon-192.png"
      alt="Põe na Lista"
      width={px}
      height={px}
      priority
      className={cn("rounded-[22%]", className)}
    />
  )
}
