/**
 * Remontado a cada navegação dentro do dashboard: dá a transição
 * de entrada suave entre páginas sem JS extra.
 */
export default function DashboardTemplate({ children }: { children: React.ReactNode }) {
  return <div className="animate-page-in motion-reduce:animate-none">{children}</div>
}
