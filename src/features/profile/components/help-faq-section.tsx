import { ChevronDown } from "lucide-react"
import { faqItems } from "@/features/profile/data/faq"

export function HelpFaqSection() {
  return (
    <ul className="divide-y divide-border/70">
      {faqItems.map((item) => (
        <li key={item.question}>
          <details className="group">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 py-3 text-sm font-medium text-foreground [&::-webkit-details-marker]:hidden">
              {item.question}
              <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform duration-[var(--duration-normal)] group-open:rotate-180" />
            </summary>
            <p className="pb-3 text-sm text-muted-foreground">{item.answer}</p>
          </details>
        </li>
      ))}
    </ul>
  )
}
