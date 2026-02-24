import { Card, CardContent } from "@/components/ui/card"
import { FileText, Package, Calculator, RotateCcw } from "lucide-react"
import type { AnalyticsData } from "@/actions/analytics-actions"

interface AnalyticsKPIsProps {
  kpis: AnalyticsData["kpis"]
}

const kpiConfig = [
  {
    key: "totalLoans" as const,
    label: "Total Préstamos",
    icon: FileText,
    color: "text-teal-600 bg-teal-100",
    format: (v: number) => v.toLocaleString("es-ES"),
  },
  {
    key: "totalUnits" as const,
    label: "Total Unidades",
    icon: Package,
    color: "text-teal-600 bg-teal-100",
    format: (v: number) => v.toLocaleString("es-ES"),
  },
  {
    key: "avgUnitsPerLoan" as const,
    label: "Media Uds/Préstamo",
    icon: Calculator,
    color: "text-purple-600 bg-purple-100",
    format: (v: number) => v.toLocaleString("es-ES", { maximumFractionDigits: 1 }),
  },
  {
    key: "returnRate" as const,
    label: "Tasa de Devolución",
    icon: RotateCcw,
    color: "text-green-600 bg-green-100",
    format: (v: number) => `${v}%`,
  },
]

export function AnalyticsKPIs({ kpis }: AnalyticsKPIsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {kpiConfig.map((config) => {
        const Icon = config.icon
        return (
          <Card key={config.key}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    {config.label}
                  </p>
                  <p className="text-2xl font-bold mt-1">
                    {config.format(kpis[config.key])}
                  </p>
                </div>
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-full ${config.color}`}
                >
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
