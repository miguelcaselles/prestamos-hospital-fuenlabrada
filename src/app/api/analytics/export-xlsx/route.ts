"use server"

import { NextRequest, NextResponse } from "next/server"
import { getAnalytics } from "@/actions/analytics-actions"
import { subDays, subMonths, startOfYear } from "date-fns"
import * as XLSX from "xlsx"

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const preset = searchParams.get("preset") || "30d"
  const overdueDays = parseInt(searchParams.get("overdueDays") || "30")

  const now = new Date()
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
      from = searchParams.get("from")
        ? new Date(searchParams.get("from")!)
        : subDays(now, 30)
      to = searchParams.get("to")
        ? new Date(searchParams.get("to")!)
        : now
      break
    case "30d":
    default:
      from = subDays(now, 30)
      break
  }

  const data = await getAnalytics({ from, to }, overdueDays)

  const wb = XLSX.utils.book_new()

  // Sheet 1: KPIs
  const kpiRows = [
    ["Indicador", "Valor"],
    ["Total Préstamos", data.kpis.totalLoans],
    ["Total Unidades", data.kpis.totalUnits],
    ["Media Uds/Préstamo", data.kpis.avgUnitsPerLoan],
    ["Tasa de Devolución (%)", data.kpis.returnRate],
  ]
  const wsKpis = XLSX.utils.aoa_to_sheet(kpiRows)
  wsKpis["!cols"] = [{ wch: 25 }, { wch: 15 }]
  XLSX.utils.book_append_sheet(wb, wsKpis, "Resumen")

  // Sheet 2: Volumen por período
  const volumeHeader = ["Período", "Solicitados", "Prestados", "Total"]
  const volumeRows = data.loanVolumeOverTime.map((v) => [
    v.date,
    v.solicitado,
    v.prestado,
    v.solicitado + v.prestado,
  ])
  const wsVolume = XLSX.utils.aoa_to_sheet([volumeHeader, ...volumeRows])
  wsVolume["!cols"] = [{ wch: 15 }, { wch: 12 }, { wch: 12 }, { wch: 10 }]
  XLSX.utils.book_append_sheet(wb, wsVolume, "Volumen")

  // Sheet 3: Hospitales
  const hospHeader = [
    "Hospital",
    "N.º Préstamos",
    "Total Unidades",
    "Pendientes Devolución",
  ]
  const hospRows = data.hospitalRanking.map((h) => [
    h.hospitalName,
    h.totalLoans,
    h.totalUnits,
    h.pendingReturns,
  ])
  const wsHosp = XLSX.utils.aoa_to_sheet([hospHeader, ...hospRows])
  wsHosp["!cols"] = [{ wch: 35 }, { wch: 15 }, { wch: 15 }, { wch: 22 }]
  XLSX.utils.book_append_sheet(wb, wsHosp, "Hospitales")

  // Sheet 4: Medicamentos
  const medHeader = ["Medicamento", "N.º Préstamos", "Total Unidades"]
  const medRows = data.topMedications.map((m) => [
    m.medication,
    m.count,
    m.units,
  ])
  const wsMed = XLSX.utils.aoa_to_sheet([medHeader, ...medRows])
  wsMed["!cols"] = [{ wch: 40 }, { wch: 15 }, { wch: 15 }]
  XLSX.utils.book_append_sheet(wb, wsMed, "Medicamentos")

  // Sheet 5: Distribución por tipo
  const typeHeader = ["Tipo", "Cantidad"]
  const typeRows = data.typeDistribution.map((t) => [t.name, t.value])
  const wsType = XLSX.utils.aoa_to_sheet([typeHeader, ...typeRows])
  wsType["!cols"] = [{ wch: 20 }, { wch: 12 }]
  XLSX.utils.book_append_sheet(wb, wsType, "Distribución")

  // Sheet 6: Préstamos vencidos
  if (data.overdueLoans.length > 0) {
    const overdueHeader = [
      "Referencia",
      "Hospital",
      "Medicamento",
      "Uds.",
      "Tipo",
      "Fecha",
      "Días transcurridos",
    ]
    const overdueRows = data.overdueLoans.map((l) => [
      l.referenceNumber,
      l.hospitalName,
      l.medicationName,
      l.units,
      l.type,
      l.createdAt,
      l.daysSinceCreated,
    ])
    const wsOverdue = XLSX.utils.aoa_to_sheet([overdueHeader, ...overdueRows])
    wsOverdue["!cols"] = [
      { wch: 14 },
      { wch: 30 },
      { wch: 35 },
      { wch: 8 },
      { wch: 15 },
      { wch: 12 },
      { wch: 18 },
    ]
    XLSX.utils.book_append_sheet(wb, wsOverdue, "Vencidos")
  }

  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" })

  const dateStr = now.toISOString().split("T")[0]
  return new NextResponse(buf, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="MedLoan_Estadisticas_${dateStr}.xlsx"`,
    },
  })
}
