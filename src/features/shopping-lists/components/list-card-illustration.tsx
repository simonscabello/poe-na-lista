import { cn } from "@/lib/utils"

type ListCardIllustrationProps = {
  seed: string
  className?: string
}

const variants = ["cart", "house", "list"] as const

function pickVariant(seed: string): (typeof variants)[number] {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0
  }
  return variants[Math.abs(hash) % variants.length]
}

export function ListCardIllustration({ seed, className }: ListCardIllustrationProps) {
  const variant = pickVariant(seed)

  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute right-0 bottom-0 size-32 text-primary-foreground opacity-[0.18] sm:size-36",
        className,
      )}
    >
      {variant === "cart" && (
        <g stroke="currentColor" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 26h10l8 34h34l8-24H32" />
          <circle cx={42} cy={74} r={5} />
          <circle cx={68} cy={74} r={5} />
        </g>
      )}
      {variant === "house" && (
        <g stroke="currentColor" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 50 50 24l28 26" />
          <path d="M30 46v34h40V46" />
          <path d="M44 80V60h12v20" />
        </g>
      )}
      {variant === "list" && (
        <g stroke="currentColor" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round">
          <rect x={28} y={20} width={44} height={60} rx={6} />
          <path d="M38 38h24M38 50h24M38 62h14" />
        </g>
      )}
    </svg>
  )
}
