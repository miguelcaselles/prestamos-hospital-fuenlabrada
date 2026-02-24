import { NextRequest, NextResponse } from "next/server"
import { getAnalytics } from "@/actions/analytics-actions"
import { subDays, subMonths, startOfYear, format } from "date-fns"
import { es } from "date-fns/locale"
import PDFDocument from "pdfkit"

// --- MedLoan Colors ---
const TEAL = "#0F766E"
const TEAL_LIGHT = "#14B8A6"
const TEAL_BG = "#F0FDFA"
const GRAY = "#666666"
const GRAY_LIGHT = "#F8F9FA"
const GRAY_BORDER = "#E5E7EB"
const BLACK = "#111827"
const WHITE = "#FFFFFF"

function drawHeader(doc: PDFKit.PDFDocument, pageWidth: number, margin: number) {
  // Top bar
  doc.rect(0, 0, pageWidth, 4).fill(TEAL)

  // Brand text
  doc
    .fontSize(16)
    .font("Helvetica-Bold")
    .fillColor(BLACK)
    .text("Med", margin, 20, { continued: true })
    .fillColor(TEAL)
    .text("Loan", { continued: false })

  doc
    .fontSize(8)
    .font("Helvetica")
    .fillColor(GRAY)
    .text("Gestión de Préstamos de Medicación", margin, 40)

  // Date right-aligned
  doc
    .fontSize(8)
    .font("Helvetica")
    .fillColor(GRAY)
    .text(
      format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: es }),
      pageWidth - margin - 200,
      24,
      { width: 200, align: "right" }
    )

  // Separator
  doc
    .moveTo(margin, 56)
    .lineTo(pageWidth - margin, 56)
    .strokeColor(TEAL)
    .lineWidth(1.5)
    .stroke()

  doc.lineWidth(1)
  return 66
}

function drawFooter(
  doc: PDFKit.PDFDocument,
  pageWidth: number,
  pageHeight: number,
  margin: number
) {
  const footerY = pageHeight - 30
  doc
    .moveTo(margin, footerY - 10)
    .lineTo(pageWidth - margin, footerY - 10)
    .strokeColor(GRAY_BORDER)
    .lineWidth(0.5)
    .stroke()

  doc
    .fontSize(7)
    .font("Helvetica")
    .fillColor(GRAY)
    .text(
      "MedLoan · Informe de Estadísticas · Desarrollado por Miguel Caselles",
      margin,
      footerY - 2,
      { align: "center", width: pageWidth - margin * 2, lineBreak: false }
    )
  doc.lineWidth(1)
}

function drawSectionTitle(
  doc: PDFKit.PDFDocument,
  title: string,
  y: number,
  margin: number,
  width: number
): number {
  doc.roundedRect(margin, y, width, 24, 3).fill(TEAL)
  doc
    .fontSize(10)
    .font("Helvetica-Bold")
    .fillColor(WHITE)
    .text(title.toUpperCase(), margin + 10, y + 7, { width: width - 20 })
  return y + 32
}

function drawTableRow(
  doc: PDFKit.PDFDocument,
  cols: { text: string; width: number; align?: "left" | "center" | "right"; bold?: boolean }[],
  y: number,
  x: number,
  rowHeight: number,
  isHeader: boolean,
  isAlt: boolean,
  tableWidth: number
) {
  if (isHeader) {
    doc.rect(x, y, tableWidth, rowHeight).fill(TEAL)
  } else if (isAlt) {
    doc.rect(x, y, tableWidth, rowHeight).fill(GRAY_LIGHT)
  }

  const fontColor = isHeader ? WHITE : BLACK
  const font = isHeader ? "Helvetica-Bold" : "Helvetica"

  let cx = x
  for (const col of cols) {
    doc
      .fontSize(8)
      .font(col.bold && !isHeader ? "Helvetica-Bold" : font)
      .fillColor(fontColor)
      .text(col.text, cx + 6, y + 5, {
        width: col.width - 12,
        align: col.align || "left",
        lineBreak: false,
      })
    cx += col.width
  }

  if (!isHeader) {
    doc
      .moveTo(x, y + rowHeight)
      .lineTo(x + tableWidth, y + rowHeight)
      .strokeColor(GRAY_BORDER)
      .lineWidth(0.3)
      .stroke()
  }

  return y + rowHeight
}

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

  const presetLabels: Record<string, string> = {
    "7d": "Últimos 7 días",
    "30d": "Últimos 30 días",
    "3m": "Últimos 3 meses",
    "1y": "Este año",
    custom: `${format(from, "dd/MM/yyyy")} - ${format(to, "dd/MM/yyyy")}`,
  }

  return new Promise<NextResponse>((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margins: { top: 20, bottom: 40, left: 50, right: 50 },
      info: {
        Title: "MedLoan - Informe de Estadísticas",
        Author: "MedLoan - Miguel Caselles",
      },
    })

    const chunks: Buffer[] = []
    doc.on("data", (chunk: Buffer) => chunks.push(chunk))
    doc.on("end", () => {
      const buf = Buffer.concat(chunks)
      const dateStr = now.toISOString().split("T")[0]
      resolve(
        new NextResponse(buf, {
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="MedLoan_Informe_${dateStr}.pdf"`,
          },
        })
      )
    })
    doc.on("error", reject)

    const pageWidth = 595.28
    const pageHeight = 841.89
    const margin = 50
    const contentWidth = pageWidth - margin * 2

    // ===== PAGE 1: Header + KPIs + Hospital Ranking =====
    let y = drawHeader(doc, pageWidth, margin)

    // Report title
    y += 4
    doc
      .fontSize(18)
      .font("Helvetica-Bold")
      .fillColor(BLACK)
      .text("Informe de Estadísticas", margin, y)

    y += 24
    doc
      .fontSize(9)
      .font("Helvetica")
      .fillColor(GRAY)
      .text(`Período: ${presetLabels[preset] || preset}`, margin, y)

    y += 12
    doc.text(
      `Generado: ${format(now, "dd/MM/yyyy 'a las' HH:mm", { locale: es })}`,
      margin,
      y
    )

    // --- KPIs ---
    y += 24
    y = drawSectionTitle(doc, "Indicadores Clave", y, margin, contentWidth)

    const kpiBoxWidth = (contentWidth - 15) / 4
    const kpiBoxHeight = 52
    const kpis = [
      { label: "Total Préstamos", value: String(data.kpis.totalLoans) },
      { label: "Total Unidades", value: String(data.kpis.totalUnits) },
      { label: "Media Uds/Préstamo", value: String(data.kpis.avgUnitsPerLoan) },
      { label: "Tasa Devolución", value: `${data.kpis.returnRate}%` },
    ]

    for (let i = 0; i < kpis.length; i++) {
      const bx = margin + i * (kpiBoxWidth + 5)
      doc.roundedRect(bx, y, kpiBoxWidth, kpiBoxHeight, 4).fill(TEAL_BG)
      doc
        .fontSize(18)
        .font("Helvetica-Bold")
        .fillColor(TEAL)
        .text(kpis[i].value, bx + 8, y + 8, {
          width: kpiBoxWidth - 16,
          align: "center",
        })
      doc
        .fontSize(7)
        .font("Helvetica")
        .fillColor(GRAY)
        .text(kpis[i].label, bx + 8, y + 32, {
          width: kpiBoxWidth - 16,
          align: "center",
        })
    }

    y += kpiBoxHeight + 16

    // --- Type Distribution ---
    y = drawSectionTitle(doc, "Distribución por Tipo", y, margin, contentWidth)
    for (const t of data.typeDistribution) {
      const pct =
        data.kpis.totalLoans > 0
          ? Math.round((t.value / data.kpis.totalLoans) * 100)
          : 0
      const barFullWidth = contentWidth - 160
      const barWidth = barFullWidth * (pct / 100)

      doc
        .fontSize(9)
        .font("Helvetica")
        .fillColor(BLACK)
        .text(t.name, margin, y + 2, { width: 100 })

      doc.roundedRect(margin + 105, y, barFullWidth, 14, 3).fill(GRAY_LIGHT)
      if (barWidth > 0) {
        doc
          .roundedRect(margin + 105, y, Math.max(barWidth, 6), 14, 3)
          .fill(t.name.includes("Solicit") ? TEAL : TEAL_LIGHT)
      }

      doc
        .fontSize(8)
        .font("Helvetica-Bold")
        .fillColor(BLACK)
        .text(`${t.value} (${pct}%)`, margin + 105 + barFullWidth + 8, y + 2)

      y += 20
    }

    y += 10

    // --- Hospital Ranking Table ---
    y = drawSectionTitle(doc, "Ranking de Hospitales", y, margin, contentWidth)

    const hospCols = [
      { text: "Hospital", width: contentWidth * 0.4, align: "left" as const },
      { text: "Préstamos", width: contentWidth * 0.18, align: "center" as const },
      { text: "Unidades", width: contentWidth * 0.18, align: "center" as const },
      { text: "Pend. Devolución", width: contentWidth * 0.24, align: "center" as const },
    ]

    const rowH = 20
    y = drawTableRow(doc, hospCols, y, margin, rowH, true, false, contentWidth)

    for (let i = 0; i < data.hospitalRanking.length; i++) {
      const h = data.hospitalRanking[i]

      if (y + rowH > pageHeight - 60) {
        drawFooter(doc, pageWidth, pageHeight, margin)
        doc.addPage()
        y = drawHeader(doc, pageWidth, margin)
      }

      const row = [
        { text: h.hospitalName, width: hospCols[0].width, align: hospCols[0].align, bold: true },
        { text: String(h.totalLoans), width: hospCols[1].width, align: hospCols[1].align },
        { text: String(h.totalUnits), width: hospCols[2].width, align: hospCols[2].align },
        { text: String(h.pendingReturns), width: hospCols[3].width, align: hospCols[3].align },
      ]
      y = drawTableRow(doc, row, y, margin, rowH, false, i % 2 === 0, contentWidth)
    }

    y += 16

    // --- Top Medications Table ---
    if (y + 60 > pageHeight - 60) {
      drawFooter(doc, pageWidth, pageHeight, margin)
      doc.addPage()
      y = drawHeader(doc, pageWidth, margin)
    }

    y = drawSectionTitle(doc, "Top Medicamentos", y, margin, contentWidth)

    const medCols = [
      { text: "Medicamento", width: contentWidth * 0.55, align: "left" as const },
      { text: "Préstamos", width: contentWidth * 0.22, align: "center" as const },
      { text: "Unidades", width: contentWidth * 0.23, align: "center" as const },
    ]

    y = drawTableRow(doc, medCols, y, margin, rowH, true, false, contentWidth)

    for (let i = 0; i < data.topMedications.length; i++) {
      const m = data.topMedications[i]

      if (y + rowH > pageHeight - 60) {
        drawFooter(doc, pageWidth, pageHeight, margin)
        doc.addPage()
        y = drawHeader(doc, pageWidth, margin)
      }

      const row = [
        { text: m.medication, width: medCols[0].width, align: medCols[0].align, bold: true },
        { text: String(m.count), width: medCols[1].width, align: medCols[1].align },
        { text: String(m.units), width: medCols[2].width, align: medCols[2].align },
      ]
      y = drawTableRow(doc, row, y, margin, rowH, false, i % 2 === 0, contentWidth)
    }

    y += 16

    // --- Overdue Loans Table ---
    if (data.overdueLoans.length > 0) {
      if (y + 80 > pageHeight - 60) {
        drawFooter(doc, pageWidth, pageHeight, margin)
        doc.addPage()
        y = drawHeader(doc, pageWidth, margin)
      }

      y = drawSectionTitle(
        doc,
        `Préstamos Vencidos (>${overdueDays} días)`,
        y,
        margin,
        contentWidth
      )

      const overdueCols = [
        { text: "Ref.", width: contentWidth * 0.12, align: "left" as const },
        { text: "Hospital", width: contentWidth * 0.26, align: "left" as const },
        { text: "Medicamento", width: contentWidth * 0.3, align: "left" as const },
        { text: "Uds.", width: contentWidth * 0.08, align: "center" as const },
        { text: "Fecha", width: contentWidth * 0.12, align: "center" as const },
        { text: "Días", width: contentWidth * 0.12, align: "center" as const },
      ]

      y = drawTableRow(doc, overdueCols, y, margin, rowH, true, false, contentWidth)

      for (let i = 0; i < data.overdueLoans.length; i++) {
        const l = data.overdueLoans[i]

        if (y + rowH > pageHeight - 60) {
          drawFooter(doc, pageWidth, pageHeight, margin)
          doc.addPage()
          y = drawHeader(doc, pageWidth, margin)
          y = drawTableRow(doc, overdueCols, y, margin, rowH, true, false, contentWidth)
        }

        const row = [
          { text: l.referenceNumber, width: overdueCols[0].width, align: overdueCols[0].align, bold: true },
          { text: l.hospitalName, width: overdueCols[1].width, align: overdueCols[1].align },
          { text: l.medicationName, width: overdueCols[2].width, align: overdueCols[2].align },
          { text: String(l.units), width: overdueCols[3].width, align: overdueCols[3].align },
          { text: l.createdAt, width: overdueCols[4].width, align: overdueCols[4].align },
          { text: String(l.daysSinceCreated), width: overdueCols[5].width, align: overdueCols[5].align },
        ]
        y = drawTableRow(doc, row, y, margin, rowH, false, i % 2 === 0, contentWidth)
      }
    }

    // Footer
    drawFooter(doc, pageWidth, pageHeight, margin)

    doc.end()
  })
}
