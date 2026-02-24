import { getAnalytics } from "@/actions/analytics-actions"
import { subDays, subMonths, startOfYear } from "date-fns"
import { AnalyticsFilters } from "@/components/analytics/analytics-filters"
import { AnalyticsKPIs } from "@/components/analytics/analytics-kpis"
import { LoanVolumeChart } from "@/components/analytics/loan-volume-chart"
import { HospitalBarChart } from "@/components/analytics/hospital-bar-chart"
import { TypeDistributionChart } from "@/components/analytics/type-distribution-chart"
import { MedicationBarChart } from "@/components/analytics/medication-bar-chart"
import { HospitalRankingTable } from "@/components/analytics/hospital-ranking-table"
import { OverdueLoansTable } from "@/components/analytics/overdue-loans-table"

interface PageProps {
  searchParams: Promise<{
    preset?: string
    from?: string
    to?: string
    overdueDays?: string
  }>
}

export default async function EstadisticasPage({ searchParams }: PageProps) {
  const params = await searchParams
  const now = new Date()
  const preset = params.preset || "30d"

  let from: Date
  let to: Date = now

  switch (preset) {
    case "7d":
      from = subDays(now, 7)
      break
    case "3m":
      from = subMonths(now, 3)
      break
    case "1y":
      from = startOfYear(now)
      break
    case "custom":
      from = params.from ? new Date(params.from) : subDays(now, 30)
      to = params.to ? new Date(params.to) : now
      break
    case "30d":
    default:
      from = subDays(now, 30)
      break
  }

  const overdueDays = parseInt(params.overdueDays || "30")
  const data = await getAnalytics({ from, to }, overdueDays)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Estadísticas</h1>
        <p className="text-sm text-gray-500 mt-1">
          Análisis de la actividad de préstamos de medicamentos
        </p>
      </div>

      <AnalyticsFilters
        currentPreset={preset}
        from={from}
        to={to}
        overdueDays={overdueDays}
      />

      <AnalyticsKPIs kpis={data.kpis} />

      <div className="grid gap-6 lg:grid-cols-2">
        <LoanVolumeChart data={data.loanVolumeOverTime} />
        <TypeDistributionChart data={data.typeDistribution} />
        <HospitalBarChart data={data.loansByHospital} />
        <MedicationBarChart data={data.topMedications} />
      </div>

      <HospitalRankingTable data={data.hospitalRanking} />
      <OverdueLoansTable data={data.overdueLoans} overdueDays={overdueDays} />
    </div>
  )
}
