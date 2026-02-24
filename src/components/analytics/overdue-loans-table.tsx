import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle } from "lucide-react"
import type { AnalyticsData } from "@/actions/analytics-actions"

interface OverdueLoansTableProps {
  data: AnalyticsData["overdueLoans"]
  overdueDays: number
}

export function OverdueLoansTable({ data, overdueDays }: OverdueLoansTableProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Préstamos Vencidos ({">"}
            {overdueDays} días sin devolver)
          </CardTitle>
          {data.length > 0 && (
            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
              {data.length} préstamo(s)
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        {data.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-6">
            No hay préstamos vencidos. Todos los préstamos con más de {overdueDays}{" "}
            días han sido devueltos.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Referencia</TableHead>
                <TableHead>Hospital</TableHead>
                <TableHead>Medicamento</TableHead>
                <TableHead className="text-right">Uds.</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead className="text-right">Días</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((loan) => (
                <TableRow key={loan.id}>
                  <TableCell>
                    <Link
                      href={`/prestamos/${loan.id}`}
                      className="font-medium text-teal-700 hover:underline"
                    >
                      {loan.referenceNumber}
                    </Link>
                  </TableCell>
                  <TableCell>{loan.hospitalName}</TableCell>
                  <TableCell>{loan.medicationName}</TableCell>
                  <TableCell className="text-right font-medium">
                    {loan.units}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {loan.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-500">
                    {new Date(loan.createdAt).toLocaleString("es-ES", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <span
                      className={
                        loan.daysSinceCreated > overdueDays * 2
                          ? "text-red-600 font-bold"
                          : "text-orange-600 font-medium"
                      }
                    >
                      {loan.daysSinceCreated}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
