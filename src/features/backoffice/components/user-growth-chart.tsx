"use client"

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { AdminUserGrowthPointDTO } from "@/types/domain"
import { AdminChartTooltip } from "./admin-chart-tooltip"

type UserGrowthChartProps = {
  data: AdminUserGrowthPointDTO[]
}

export function UserGrowthChart({ data }: UserGrowthChartProps) {
  return (
    <Card className="ring-1 ring-border/70">
      <CardHeader>
        <CardTitle>Crescimento de usuários</CardTitle>
      </CardHeader>
      <CardContent className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
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
            <Tooltip content={<AdminChartTooltip />} cursor={{ stroke: "var(--color-border)" }} />
            <Area
              type="monotone"
              dataKey="cumulativeUsers"
              name="Total de usuários"
              stroke="var(--color-chart-1)"
              strokeWidth={2}
              fill="var(--color-chart-1)"
              fillOpacity={0.1}
              dot={{
                r: 4,
                fill: "var(--color-chart-1)",
                stroke: "var(--color-card)",
                strokeWidth: 2,
              }}
              activeDot={{
                r: 5,
                fill: "var(--color-chart-1)",
                stroke: "var(--color-card)",
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
