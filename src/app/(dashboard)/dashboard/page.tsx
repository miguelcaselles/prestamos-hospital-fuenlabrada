import { prisma } from "@/lib/prisma"
import { SummaryCards } from "@/components/dashboard/summary-cards"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { MonthlyTrend } from "@/components/dashboard/monthly-trend"
import { startOfMonth, subMonths } from "date-fns"

export default async function DashboardPage() {
  const now = new Date()
  const startOfCurrentMonth = startOfMonth(now)
  const startOfLastMonth = startOfMonth(subMonths(now, 1))

  const [
    totalActive,
    pendingFarmatools,
    pendingReturn,
    pendingTheirReturn,
    recentLoans,
    loansThisMonth,
    loansLastMonth,
    last7DaysLoans,
  ] = await Promise.all([
    prisma.loan.count({ where: { devuelto: false } }),
    prisma.loan.count({ where: { farmatoolsGestionado: false } }),
    prisma.loan.count({
      where: { devuelto: false, type: "SOLICITADO" },
    }),
    prisma.loan.count({
      where: { devuelto: false, type: "PRESTADO" },
    }),
    prisma.loan.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      include: { hospital: true, items: { include: { medication: true } } },
    }),
    prisma.loan.count({
      where: { createdAt: { gte: startOfCurrentMonth } },
    }),
    prisma.loan.count({
      where: {
        createdAt: { gte: startOfLastMonth, lt: startOfCurrentMonth },
      },
    }),
    prisma.loan.findMany({
      where: { createdAt: { gte: subMonths(now, 1) } },
      select: { createdAt: true, type: true },
      orderBy: { createdAt: "asc" },
    }),
  ])

  // Build sparkline data: loans per day over last 30 days
  const dailyCounts: Record<string, { solicitado: number; prestado: number }> =
    {}
  for (const loan of last7DaysLoans) {
    const day = new Date(loan.createdAt).toISOString().split("T")[0]
    if (!dailyCounts[day]) dailyCounts[day] = { solicitado: 0, prestado: 0 }
    if (loan.type === "SOLICITADO") dailyCounts[day].solicitado++
    else dailyCounts[day].prestado++
  }

  const sparklineData = Object.entries(dailyCounts)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-14)
    .map(([date, counts]) => ({
      date,
      total: counts.solicitado + counts.prestado,
      solicitado: counts.solicitado,
      prestado: counts.prestado,
    }))

  const trendPercent =
    loansLastMonth > 0
      ? Math.round(
          ((loansThisMonth - loansLastMonth) / loansLastMonth) * 100
        )
      : loansThisMonth > 0
        ? 100
        : 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          Resumen de la gestión de préstamos de medicamentos
        </p>
      </div>

      <SummaryCards
        totalActive={totalActive}
        pendingFarmatools={pendingFarmatools}
        pendingReturn={pendingReturn}
        pendingTheirReturn={pendingTheirReturn}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-6">
          <MonthlyTrend
            loansThisMonth={loansThisMonth}
            trendPercent={trendPercent}
            sparklineData={sparklineData}
          />
          <QuickActions />
        </div>
        <div className="lg:col-span-2">
          <RecentActivity loans={recentLoans} />
        </div>
      </div>
    </div>
  )
}
