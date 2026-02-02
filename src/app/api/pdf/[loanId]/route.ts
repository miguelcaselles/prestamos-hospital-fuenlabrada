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
    include: { hospital: true, medication: true },
  })

  if (!loan) {
    return NextResponse.json(
      { error: "Préstamo no encontrado" },
      { status: 404 }
    )
  }

  const pdfBuffer = await generateLoanPDF(loan)

  return new NextResponse(new Uint8Array(pdfBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="prestamo-${loan.referenceNumber}.pdf"`,
    },
  })
}
