"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import type { AnalyticsData } from "@/actions/analytics-actions"

interface MedicationBarChartProps {
  data: AnalyticsData["topMedications"]
}

export function MedicationBarChart({ data }: MedicationBarChartProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Top Medicamentos</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[280px] text-gray-400 text-sm">
          No hay datos para el periodo seleccionado
        </CardContent>
      </Card>
    )
  }

  const chartData = data.map((d) => ({
    ...d,
    medication:
      d.medication.length > 20
        ? d.medication.slice(0, 17) + "..."
        : d.medication,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Top Medicamentos</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 12 }} allowDecimals={false} />
            <YAxis
              type="category"
              dataKey="medication"
              tick={{ fontSize: 10 }}
              width={120}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(value: any, name: any) => [
                value,
                name === "count" ? "Préstamos" : "Unidades",
              ]}
              contentStyle={{
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              }}
            />
            <Bar dataKey="count" name="Préstamos" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
