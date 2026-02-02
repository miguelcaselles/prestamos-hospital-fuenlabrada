import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import {
  LOAN_TYPE_LABELS,
  getFarmatoolsLabel,
  getDevolucionLabel,
} from "@/lib/constants"
import { format } from "date-fns"
import { es } from "date-fns/locale"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const type = searchParams.get("type")
  const hospitalId = searchParams.get("hospitalId")
  const farmatools = searchParams.get("farmatools")
  const devuelto = searchParams.get("devuelto")

  const where: Record<string, unknown> = {}
  if (type) where.type = type
  if (hospitalId) where.hospitalId = hospitalId
  if (farmatools === "true") where.farmatoolsGestionado = true
  else if (farmatools === "false") where.farmatoolsGestionado = false
  if (devuelto === "true") where.devuelto = true
  else if (devuelto === "false") where.devuelto = false

  const loans = await prisma.loan.findMany({
    where,
    include: { hospital: true, medication: true },
    orderBy: { createdAt: "desc" },
  })

  const headers = [
    "Referencia",
    "Fecha",
    "Tipo",
    "Hospital",
    "Medicamento",
    "Unidades",
    "Farmatools",
    "Devolución",
    "Email",
  ]

  const rows = loans.map((loan) => [
    loan.referenceNumber,
    format(new Date(loan.createdAt), "dd/MM/yyyy", { locale: es }),
    LOAN_TYPE_LABELS[loan.type] || loan.type,
    loan.hospital.name,
    loan.medication.name,
    String(loan.units),
    getFarmatoolsLabel(loan.farmatoolsGestionado),
    getDevolucionLabel(loan.devuelto, loan.type),
    loan.emailSentTo || "",
  ])

  const csv = [
    headers.join(";"),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(";")),
  ].join("\n")

  // BOM for Excel compatibility
  const bom = "\uFEFF"

  return new NextResponse(bom + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="prestamos-${format(new Date(), "yyyy-MM-dd")}.csv"`,
    },
  })
}
