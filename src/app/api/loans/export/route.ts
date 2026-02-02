import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { LOAN_TYPE_LABELS, LOAN_STATUS_LABELS } from "@/lib/constants"
import { format } from "date-fns"
import { es } from "date-fns/locale"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const status = searchParams.get("status")
  const type = searchParams.get("type")
  const hospitalId = searchParams.get("hospitalId")

  const where: Record<string, unknown> = {}
  if (status) where.status = status
  if (type) where.type = type
  if (hospitalId) where.hospitalId = hospitalId

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
    "Estado",
    "Email",
  ]

  const rows = loans.map((loan: { referenceNumber: string; createdAt: Date; type: string; hospital: { name: string }; medication: { name: string }; units: number; status: string; emailSentTo: string | null }) => [
    loan.referenceNumber,
    format(new Date(loan.createdAt), "dd/MM/yyyy", { locale: es }),
    LOAN_TYPE_LABELS[loan.type] || loan.type,
    loan.hospital.name,
    loan.medication.name,
    String(loan.units),
    LOAN_STATUS_LABELS[loan.status] || loan.status,
    loan.emailSentTo || "",
  ])

  const csv = [
    headers.join(";"),
    ...rows.map((row: string[]) => row.map((cell: string) => `"${cell}"`).join(";")),
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
