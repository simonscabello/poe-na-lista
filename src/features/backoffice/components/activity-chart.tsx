"use client"

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { AdminActivityPointDTO } from "@/types/domain"
import { AdminChartTooltip } from "./admin-chart-tooltip"

type ActivityChartProps = {
  data: AdminActivityPointDTO[]
}

export function ActivityChart({ data }: ActivityChartProps) {
  return (
    <Card className="ring-1 ring-border/70">
      <CardHeader>
        <CardTitle>Atividade mensal</CardTitle>
      </CardHeader>
      <CardContent className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }} barGap={2}>
            <CartesianGrid vertical={false} stroke="var(--color-border)" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
            />
            <YAxis
              allowDecimals={false}
              tickLine={false}
              axisLine={false}
              width={32}
              tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
            />
            <Tooltip content={<AdminChartTooltip />} cursor={{ fill: "var(--color-muted)" }} />
            <Legend wrapperStyle={{ fontSize: 12, color: "var(--color-muted-foreground)" }} />
            <Bar
              dataKey="listsCreated"
              name="Listas criadas"
              fill="var(--color-chart-1)"
              radius={[4, 4, 0, 0]}
              maxBarSize={24}
            />
            <Bar
              dataKey="purchasesFinalized"
              name="Compras finalizadas"
              fill="var(--color-chart-2)"
              radius={[4, 4, 0, 0]}
              maxBarSize={24}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
