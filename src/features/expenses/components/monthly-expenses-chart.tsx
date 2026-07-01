"use client"

import { Bar, BarChart, Cell, ResponsiveContainer, XAxis } from "recharts"
import { formatCurrency } from "@/lib/format-currency"
import type { MonthlyExpensePointDTO } from "@/types/domain"

export function MonthlyExpensesChart({ data }: { data: MonthlyExpensePointDTO[] }) {
  const lastIndex = data.length - 1

  return (
    <div className="rounded-2xl bg-card p-5 ring-1 ring-border/70">
      <div className="flex items-baseline justify-between">
        <p className="text-section-label">Evolução mensal</p>
        <p className="text-xs text-muted-foreground">Últimos {data.length} meses</p>
      </div>
      <div className="mt-4 h-40 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 0, bottom: 0, left: 0 }}>
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
            />
            <Bar dataKey="total" radius={[6, 6, 0, 0]} maxBarSize={40}>
              {data.map((point, index) => (
                <Cell
                  key={point.month}
                  fill={index === lastIndex ? "var(--primary)" : "var(--muted-foreground)"}
                  fillOpacity={index === lastIndex ? 1 : 0.35}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 flex justify-between text-xs text-muted-foreground tabular-nums">
        <span>{formatCurrency(Math.min(...data.map((point) => point.total)))}</span>
        <span>{formatCurrency(Math.max(...data.map((point) => point.total)))}</span>
      </div>
    </div>
  )
}
