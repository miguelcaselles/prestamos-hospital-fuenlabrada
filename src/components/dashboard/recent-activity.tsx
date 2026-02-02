import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  LOAN_TYPE_LABELS,
  LOAN_STATUS_LABELS,
  LOAN_STATUS_COLORS,
} from "@/lib/constants"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import type { LoanWithRelations } from "@/types"

interface RecentActivityProps {
  loans: LoanWithRelations[]
}

export function RecentActivity({ loans }: RecentActivityProps) {
  if (loans.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Actividad Reciente</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 text-center py-8">
            No hay préstamos registrados aún.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Actividad Reciente</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {loans.map((loan) => (
            <Link
              key={loan.id}
              href={`/prestamos/${loan.id}`}
              className="flex items-center justify-between rounded-lg border p-3 hover:bg-gray-50 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-blue-600">
                    {loan.referenceNumber}
                  </span>
                  <Badge
                    variant="outline"
                    className={
                      loan.type === "SOLICITADO"
                        ? "bg-purple-50 text-purple-700 border-purple-200"
                        : "bg-teal-50 text-teal-700 border-teal-200"
                    }
                  >
                    {LOAN_TYPE_LABELS[loan.type]}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mt-1 truncate">
                  {loan.medication.name} - {loan.hospital.name}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1 ml-4">
                <Badge
                  variant="outline"
                  className={LOAN_STATUS_COLORS[loan.status]}
                >
                  {LOAN_STATUS_LABELS[loan.status]}
                </Badge>
                <span className="text-xs text-gray-400">
                  {formatDistanceToNow(new Date(loan.createdAt), {
                    addSuffix: true,
                    locale: es,
                  })}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
