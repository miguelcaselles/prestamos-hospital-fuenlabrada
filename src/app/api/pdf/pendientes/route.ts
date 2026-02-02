import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { generatePendingListPDF } from "@/lib/pdf"

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { loanIds, listType } = body as {
    loanIds: string[]
    listType: "devolver" | "que-devuelvan"
  }

  if (!loanIds || loanIds.length === 0) {
    return NextResponse.json(
      { error: "No se han seleccionado préstamos" },
      { status: 400 }
    )
  }

  const loans = await prisma.loan.findMany({
    where: { id: { in: loanIds } },
    include: { hospital: true, medication: true },
    orderBy: [{ hospital: { name: "asc" } }, { medication: { name: "asc" } }],
  })

  if (loans.length === 0) {
    return NextResponse.json(
      { error: "No se encontraron préstamos" },
      { status: 404 }
    )
  }

  const pdfBuffer = await generatePendingListPDF(loans, listType)

  const filename =
    listType === "devolver"
      ? "pendientes-devolver"
      : "pendientes-que-devuelvan"

  return new NextResponse(new Uint8Array(pdfBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${filename}-${new Date().toISOString().slice(0, 10)}.pdf"`,
    },
  })
}
