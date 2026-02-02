import { prisma } from "@/lib/prisma"
import { SummaryCards } from "@/components/dashboard/summary-cards"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"

export default async function DashboardPage() {
  const [totalActive, pendingFarmatools, pendingReturn, pendingTheirReturn, recentLoans] =
    await Promise.all([
      prisma.loan.count({ where: { devuelto: false } }),
      prisma.loan.count({ where: { farmatoolsGestionado: false } }),
      prisma.loan.count({
        where: { devuelto: false, type: "SOLICITADO" },
      }),
      prisma.loan.count({
        where: { devuelto: false, type: "PRESTADO" },
      }),
      prisma.loan.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: { hospital: true, medication: true },
      }),
    ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Resumen de la gestión de préstamos de medicamentos
          </p>
        </div>
        <Link href="/prestamos/nuevo">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Nuevo Préstamo
          </Button>
        </Link>
      </div>

      <SummaryCards
        totalActive={totalActive}
        pendingFarmatools={pendingFarmatools}
        pendingReturn={pendingReturn}
        pendingTheirReturn={pendingTheirReturn}
      />

      <RecentActivity loans={recentLoans} />
    </div>
  )
}
