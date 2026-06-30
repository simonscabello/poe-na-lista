import {
  Apple,
  Baby,
  Beef,
  Cookie,
  Croissant,
  CupSoda,
  HeartHandshake,
  type LucideIcon,
  Milk,
  Package,
  PawPrint,
  Snowflake,
  Sparkles,
} from "lucide-react"

const ICONS: Record<string, LucideIcon> = {
  Package,
  Milk,
  Beef,
  Apple,
  Croissant,
  Snowflake,
  Cookie,
  CupSoda,
  HeartHandshake,
  Sparkles,
  Baby,
  PawPrint,
}

/** Lucide component for a persisted category icon name (fallback: Package). */
export function categoryIcon(name: string | null | undefined): LucideIcon {
  if (!name) return Package
  return ICONS[name] ?? Package
}
