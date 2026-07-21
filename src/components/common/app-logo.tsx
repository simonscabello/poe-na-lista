import { cn } from "@/lib/utils"

const sizeMap = {
  sm: 20,
  md: 28,
  lg: 48,
  xl: 64,
} as const

type AppLogoProps = {
  size?: keyof typeof sizeMap
  className?: string
}

/**
 * Símbolo da marca: carrinho de mercado desconstruído, com um ponto
 * tangerina "caindo" no carrinho (o item sendo posto na lista),
 * sobre um quadrado arredondado em gradiente esmeralda.
 */
export function AppLogo({ size = "md", className }: AppLogoProps) {
  const px = sizeMap[size]
  // ID determinístico (sem useId/hooks): o logo é RSC-safe e pode aparecer
  // várias vezes na página com tamanhos diferentes sem colidir o fill url().
  const gradientId = `pnl-logo-grad-${size}`

  return (
    <svg
      width={px}
      height={px}
      viewBox="0 0 512 512"
      role="img"
      aria-label="Põe na Lista"
      className={cn("shrink-0", className)}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#1fb673" />
          <stop offset="1" stopColor="#0c7a4b" />
        </linearGradient>
      </defs>
      <rect width="512" height="512" rx="120" fill={`url(#${gradientId})`} />
      <g>
        <path
          d="M112 118 L192 154"
          fill="none"
          stroke="#ffffff"
          strokeWidth="32"
          strokeLinecap="round"
        />
        <path
          d="M150 192 L394 192 L354 352 L192 352 Z"
          fill="#ffffff"
          stroke="#ffffff"
          strokeWidth="28"
          strokeLinejoin="round"
        />
        <circle cx="224" cy="414" r="26" fill="#ffffff" />
        <circle cx="330" cy="414" r="26" fill="#ffffff" />
        <circle cx="330" cy="112" r="30" fill="#ffae4f" />
      </g>
    </svg>
  )
}
