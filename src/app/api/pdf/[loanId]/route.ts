import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { generateLoanPDF } from "@/lib/pdf"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ loanId: string }> }
) {
  const { loanId } = await params

  const loan = await prisma.loan.findUnique({
    where: { id: loanId },
    include: { hospital: true, items: { include: { medication: true } } },
  })

  if (!loan) {
    return NextResponse.json(
      { error: "Préstamo no encontrado" },
      { status: 404 }
    )
  }

  const pdfBuffer = await generateLoanPDF(loan)

  // Filename: FECHA_HOSPITAL_FARMACOS.pdf
  const fecha = new Date(loan.createdAt)
    .toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" })
    .replace(/\//g, "-")
  const hospital = loan.hospital.name
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .trim()
    .replace(/\s+/g, "_")
  const farmacos = loan.items
    .map((i: { medication: { name: string } }) =>
      i.medication.name
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9 ]/g, "")
        .trim()
        .replace(/\s+/g, "_")
    )
    .join("_")
  const filename = `${fecha}_${hospital}_${farmacos}.pdf`

  return new NextResponse(new Uint8Array(pdfBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${encodeURIComponent(filename)}"`,
    },
  })
}
