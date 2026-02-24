"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts"

interface MonthlyTrendProps {
  loansThisMonth: number
  trendPercent: number
  sparklineData: Array<{
    date: string
    total: number
    solicitado: number
    prestado: number
  }>
}

export function MonthlyTrend({
  loansThisMonth,
  trendPercent,
  sparklineData,
}: MonthlyTrendProps) {
  const TrendIcon =
    trendPercent > 0 ? TrendingUp : trendPercent < 0 ? TrendingDown : Minus
  const trendColor =
    trendPercent > 0
      ? "text-teal-600"
      : trendPercent < 0
        ? "text-red-500"
        : "text-gray-400"
  const trendBg =
    trendPercent > 0
      ? "bg-teal-50"
      : trendPercent < 0
        ? "bg-red-50"
        : "bg-gray-50"

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">
          Préstamos este mes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-3xl font-bold text-gray-900">
              {loansThisMonth}
            </p>
            <div className="flex items-center gap-1.5 mt-1">
              <span
                className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium ${trendColor} ${trendBg}`}
              >
                <TrendIcon className="h-3 w-3" />
                {trendPercent > 0 ? "+" : ""}
                {trendPercent}%
              </span>
              <span className="text-xs text-gray-400">vs mes anterior</span>
            </div>
          </div>
        </div>

        {sparklineData.length > 1 && (
          <div className="mt-4 h-[80px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sparklineData}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14B8A6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#14B8A6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" hide />
                <Tooltip
                  contentStyle={{
                    fontSize: "12px",
                    borderRadius: "8px",
                    border: "1px solid #e5e7eb",
                  }}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  labelFormatter={(label: any) => {
                    const d = new Date(String(label) + "T00:00:00")
                    return d.toLocaleDateString("es-ES", {
                      day: "2-digit",
                      month: "short",
                    })
                  }}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  formatter={(value: any) => [value, "Préstamos"]}
                />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="#14B8A6"
                  strokeWidth={2}
                  fill="url(#colorTotal)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
