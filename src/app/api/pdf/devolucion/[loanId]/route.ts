import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { generateReturnPDF, ReturnItem } from "@/lib/pdf"
import { getUnitTypeLabel } from "@/lib/constants"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface ReturnRequestItem {
  loanItemId: string
  unitsToReturn: number
}

interface ReturnRequest {
  items: ReturnRequestItem[]
  save: boolean
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ loanId: string }> }
) {
  const { loanId } = await params

  const loan = await prisma.loan.findUnique({
    where: { id: loanId },
    include: {
      hospital: true,
      items: { include: { medication: true } },
    },
  })

  if (!loan) {
    return NextResponse.json({ error: "Préstamo no encontrado" }, { status: 404 })
  }

  const body: ReturnRequest = await request.json()
  const { items: returnItems, save } = body

  if (!returnItems || returnItems.length === 0) {
    return NextResponse.json({ error: "No se han seleccionado medicamentos a devolver" }, { status: 400 })
  }

  // Validate quantities
  for (const ri of returnItems) {
    const loanItem = loan.items.find((i) => i.id === ri.loanItemId)
    if (!loanItem) {
      return NextResponse.json({ error: `Ítem ${ri.loanItemId} no encontrado` }, { status: 400 })
    }
    const maxReturnable = loanItem.units - loanItem.unitsReturned
    if (ri.unitsToReturn <= 0 || ri.unitsToReturn > maxReturnable) {
      return NextResponse.json(
        { error: `Cantidad inválida para ${loanItem.medication.name}: máximo ${maxReturnable}` },
        { status: 400 }
      )
    }
  }

  // Save to DB if requested
  if (save) {
    await prisma.$transaction(async (tx) => {
      for (const ri of returnItems) {
        const loanItem = loan.items.find((i) => i.id === ri.loanItemId)!
        await tx.loanItem.update({
          where: { id: ri.loanItemId },
          data: { unitsReturned: loanItem.unitsReturned + ri.unitsToReturn },
        })
      }

      // Auto-mark as devuelto if all items fully returned
      const updatedItems = loan.items.map((item) => {
        const ri = returnItems.find((r) => r.loanItemId === item.id)
        return {
          ...item,
          unitsReturned: item.unitsReturned + (ri?.unitsToReturn ?? 0),
        }
      })
      const allReturned = updatedItems.every((i) => i.unitsReturned >= i.units)
      if (allReturned) {
        await tx.loan.update({ where: { id: loanId }, data: { devuelto: true } })
      }
    })
  }

  // Build PDF data
  const returnDate = new Date()
  const pdfItems: ReturnItem[] = returnItems.map((ri) => {
    const loanItem = loan.items.find((i) => i.id === ri.loanItemId)!
    return {
      loanItemId: ri.loanItemId,
      medicationName: loanItem.medication.name,
      presentation: loanItem.medication.presentation,
      activeIngredient: loanItem.medication.activeIngredient,
      unitType: loanItem.unitType,
      originalUnits: loanItem.units,
      alreadyReturned: loanItem.unitsReturned,
      unitsToReturn: ri.unitsToReturn,
    }
  })

  const pdfBuffer = await generateReturnPDF({
    referenceNumber: loan.referenceNumber,
    type: loan.type,
    hospitalName: loan.hospital.name,
    pharmacistName: loan.pharmacistName,
    returnDate,
    items: pdfItems,
    notes: loan.notes,
  })

  const dateStr = format(returnDate, "yyyyMMdd", { locale: es })
  const hospitalSlug = loan.hospital.name.replace(/\s+/g, "_").slice(0, 20)
  const filename = `devolucion_${loan.referenceNumber}_${hospitalSlug}_${dateStr}.pdf`

  return new NextResponse(new Uint8Array(pdfBuffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  })
}
