import { ChevronDown } from "lucide-react"
import { faqCategoryLabels, faqCategoryOrder, faqItems } from "@/features/profile/data/faq"

export function HelpFaqSection() {
  const sections = faqCategoryOrder
    .map((category) => ({
      category,
      label: faqCategoryLabels[category],
      items: faqItems.filter((item) => item.category === category),
    }))
    .filter((section) => section.items.length > 0)

  return (
    <div className="space-y-5">
      {sections.map((section) => (
        <section key={section.category} className="space-y-1">
          <h3 className="text-section-label">{section.label}</h3>
          <ul className="divide-y divide-border/70">
            {section.items.map((item) => (
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
        </section>
      ))}
    </div>
  )
}
