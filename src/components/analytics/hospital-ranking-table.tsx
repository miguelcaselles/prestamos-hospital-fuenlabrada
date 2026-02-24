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
import type { AnalyticsData } from "@/actions/analytics-actions"

interface HospitalRankingTableProps {
  data: AnalyticsData["hospitalRanking"]
}

export function HospitalRankingTable({ data }: HospitalRankingTableProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Ranking de Hospitales</CardTitle>
        </CardHeader>
        <CardContent className="text-center text-gray-400 text-sm py-8">
          No hay datos para el periodo seleccionado
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Ranking de Hospitales</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]">#</TableHead>
              <TableHead>Hospital</TableHead>
              <TableHead className="text-right">Préstamos</TableHead>
              <TableHead className="text-right">Unidades</TableHead>
              <TableHead className="text-right">Pendientes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, index) => (
              <TableRow key={row.hospitalName}>
                <TableCell className="font-medium text-gray-500">
                  {index + 1}
                </TableCell>
                <TableCell className="font-medium">{row.hospitalName}</TableCell>
                <TableCell className="text-right">{row.totalLoans}</TableCell>
                <TableCell className="text-right">{row.totalUnits}</TableCell>
                <TableCell className="text-right">
                  {row.pendingReturns > 0 ? (
                    <Badge
                      variant="outline"
                      className="bg-orange-50 text-orange-700 border-orange-200"
                    >
                      {row.pendingReturns}
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="bg-green-50 text-green-700 border-green-200"
                    >
                      0
                    </Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
