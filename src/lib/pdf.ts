import PDFDocument from "pdfkit"
import path from "path"
import fs from "fs"
import { LOAN_TYPE_LABELS, getUnitTypeLabel } from "./constants"

// --- Colors ---
const BLUE = "#009AD7"
const BLUE_DARK = "#00729E"
const BLUE_LIGHT = "#E8F4FA"
const BLUE_TABLE_HEADER = "#009AD7"
const GRAY = "#666666"
const GRAY_LIGHT = "#F5F5F5"
const GRAY_BORDER = "#DDDDDD"
const BLACK = "#1A1A1A"
const WHITE = "#FFFFFF"

// --- Logo helper ---
function getLogoPath(): string {
  return path.join(process.cwd(), "public", "logo_HUF.png")
}

function drawLogo(doc: PDFKit.PDFDocument, x: number, y: number, width: number) {
  const logoPath = getLogoPath()
  if (fs.existsSync(logoPath)) {
    doc.image(logoPath, x, y, { width })
  }
}

// --- Shared header for portrait PDFs ---
function drawPortraitHeader(doc: PDFKit.PDFDocument) {
  const pageWidth = 595.28 // A4 portrait width in points
  const margin = 50

  // Logo centered
  const logoWidth = 260
  const logoHeight = logoWidth * (229 / 1155) // maintain aspect ratio
  const logoX = (pageWidth - logoWidth) / 2
  drawLogo(doc, logoX, 35, logoWidth)

  // "Servicio de Farmacia" subtitle
  const subtitleY = 35 + logoHeight + 6
  doc
    .fontSize(10)
    .font("Helvetica")
    .fillColor(GRAY)
    .text("Servicio de Farmacia", margin, subtitleY, {
      width: pageWidth - margin * 2,
      align: "center",
    })

  // Separator line
  const lineY = subtitleY + 18
  doc
    .moveTo(margin, lineY)
    .lineTo(pageWidth - margin, lineY)
    .strokeColor(BLUE)
    .lineWidth(1.5)
    .stroke()

  doc.lineWidth(1) // reset

  return lineY + 10
}

// --- Shared header for landscape PDFs ---
function drawLandscapeHeader(doc: PDFKit.PDFDocument) {
  const pageWidth = 841.89 // A4 landscape width in points
  const margin = 50

  // Logo on the left
  const logoWidth = 200
  const logoHeight = logoWidth * (229 / 1155)
  drawLogo(doc, margin, 30, logoWidth)

  // "Servicio de Farmacia" right-aligned
  const textX = pageWidth - margin - 200
  doc
    .fontSize(9)
    .font("Helvetica")
    .fillColor(GRAY)
    .text("Servicio de Farmacia", textX, 38, {
      width: 200,
      align: "right",
    })

  // Date right-aligned
  doc
    .fontSize(8)
    .text(
      new Date().toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }),
      textX,
      52,
      { width: 200, align: "right" }
    )

  // Separator
  const lineY = 30 + logoHeight + 10
  doc
    .moveTo(margin, lineY)
    .lineTo(pageWidth - margin, lineY)
    .strokeColor(BLUE)
    .lineWidth(1.5)
    .stroke()

  doc.lineWidth(1)

  return lineY + 10
}

// --- Shared footer ---
function drawFooter(
  doc: PDFKit.PDFDocument,
  pageWidth: number,
  pageHeight: number,
  margin: number
) {
  const footerY = pageHeight - margin
  doc
    .moveTo(margin, footerY - 12)
    .lineTo(pageWidth - margin, footerY - 12)
    .strokeColor(GRAY_BORDER)
    .lineWidth(0.5)
    .stroke()

  doc
    .fontSize(7)
    .font("Helvetica")
    .fillColor(GRAY)
    .text(
      "Hospital Universitario de Fuenlabrada  ·  Camino del Molino, 2  ·  28942 Fuenlabrada (Madrid)",
      margin,
      footerY - 4,
      { align: "center", width: pageWidth - margin * 2, height: 10, lineBreak: false }
    )

  doc.lineWidth(1)
}

// =============================================
// INDIVIDUAL LOAN PDF
// =============================================

interface LoanForPDF {
  referenceNumber: string
  type: "SOLICITADO" | "PRESTADO"
  notes: string | null
  pharmacistName: string | null
  createdAt: Date
  hospital: {
    name: string
  }
  items: Array<{
    units: number
    unitType: string
    medication: {
      name: string
      nationalCode: string | null
      presentation: string | null
      activeIngredient: string | null
    }
  }>
}

export async function generateLoanPDF(loan: LoanForPDF): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margins: { top: 50, bottom: 30, left: 50, right: 50 },
      info: {
        Title: `Préstamo ${loan.referenceNumber}`,
        Author: "Hospital Universitario de Fuenlabrada",
      },
    })

    const chunks: Buffer[] = []
    doc.on("data", (chunk: Buffer) => chunks.push(chunk))
    doc.on("end", () => resolve(Buffer.concat(chunks)))
    doc.on("error", reject)

    const pageWidth = 595.28
    const margin = 50
    const contentWidth = pageWidth - margin * 2

    // --- HEADER ---
    let y = drawPortraitHeader(doc)

    // --- DOCUMENT TITLE ---
    y += 12
    // Title background box
    doc
      .roundedRect(margin, y, contentWidth, 36, 4)
      .fill(BLUE)

    doc
      .fontSize(14)
      .font("Helvetica-Bold")
      .fillColor(WHITE)
      .text("DOCUMENTO DE PRÉSTAMO DE MEDICAMENTOS", margin, y + 10, {
        width: contentWidth,
        align: "center",
      })

    // --- REFERENCE & DATE ROW ---
    y += 50
    doc.fillColor(BLACK)

    // Loan type badge
    const typeLabel = LOAN_TYPE_LABELS[loan.type]
    const badgeColor = loan.type === "SOLICITADO" ? "#7C3AED" : "#0891B2"
    const badgeWidth = 200
    const badgeX = margin
    doc.roundedRect(badgeX, y, badgeWidth, 22, 3).fill(badgeColor)
    doc
      .fontSize(9)
      .font("Helvetica-Bold")
      .fillColor(WHITE)
      .text(typeLabel.toUpperCase(), badgeX, y + 6, {
        width: badgeWidth,
        align: "center",
      })

    // Reference on the right
    doc
      .fontSize(10)
      .font("Helvetica-Bold")
      .fillColor(BLUE_DARK)
      .text(loan.referenceNumber, margin, y + 4, {
        width: contentWidth,
        align: "right",
      })

    // Date
    y += 30
    doc
      .fontSize(9)
      .font("Helvetica")
      .fillColor(GRAY)
      .text(
        `Fecha: ${loan.createdAt.toLocaleDateString("es-ES", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        })} a las ${loan.createdAt.toLocaleTimeString("es-ES", {
          hour: "2-digit",
          minute: "2-digit",
        })}`,
        margin,
        y,
        { width: contentWidth, align: "right" }
      )

    // --- DETAILS TABLE ---
    y += 28
    const col1 = margin
    const labelWidth = 150
    const col2 = margin + labelWidth
    const valueWidth = contentWidth - labelWidth
    const rowHeight = 28

    if (loan.items.length === 1) {
      const med = loan.items[0].medication
      const rows: [string, string][] = [
        ["Hospital", loan.hospital.name],
        ...(loan.pharmacistName ? [["Farmacéutico", loan.pharmacistName] as [string, string]] : []),
        ["Medicamento", med.name],
        ["Código Nacional", med.nationalCode || "—"],
        ["Presentación", med.presentation || "—"],
        ["Principio Activo", med.activeIngredient || "—"],
        ["Cantidad", `${loan.items[0].units} ${getUnitTypeLabel(loan.items[0].unitType)}`],
      ]

      for (let i = 0; i < rows.length; i++) {
        const [label, value] = rows[i]
        const rowY = y + i * rowHeight

        if (i % 2 === 0) {
          doc.rect(col1, rowY, contentWidth, rowHeight).fill(GRAY_LIGHT)
        }

        doc
          .moveTo(col1, rowY + rowHeight)
          .lineTo(col1 + contentWidth, rowY + rowHeight)
          .strokeColor(GRAY_BORDER)
          .lineWidth(0.5)
          .stroke()

        doc
          .fontSize(9)
          .font("Helvetica-Bold")
          .fillColor(BLUE_DARK)
          .text(label, col1 + 10, rowY + 8, { width: labelWidth - 10 })

        if (label === "Cantidad") {
          doc
            .fontSize(11)
            .font("Helvetica-Bold")
            .fillColor(BLACK)
            .text(value, col2, rowY + 7, { width: valueWidth })
        } else {
          doc
            .fontSize(9)
            .font("Helvetica")
            .fillColor(BLACK)
            .text(value, col2, rowY + 8, { width: valueWidth })
        }
      }

      doc.lineWidth(1)
      y += rows.length * rowHeight + 16
    } else {
      // Multiple items — Hospital row
      doc.rect(col1, y, contentWidth, rowHeight).fill(GRAY_LIGHT)
      doc
        .moveTo(col1, y + rowHeight)
        .lineTo(col1 + contentWidth, y + rowHeight)
        .strokeColor(GRAY_BORDER)
        .lineWidth(0.5)
        .stroke()
      doc
        .fontSize(9)
        .font("Helvetica-Bold")
        .fillColor(BLUE_DARK)
        .text("Hospital", col1 + 10, y + 8, { width: labelWidth - 10 })
      doc
        .fontSize(9)
        .font("Helvetica")
        .fillColor(BLACK)
        .text(loan.hospital.name, col2, y + 8, { width: valueWidth })

      y += rowHeight

      // Pharmacist row (if present)
      if (loan.pharmacistName) {
        doc
          .moveTo(col1, y + rowHeight)
          .lineTo(col1 + contentWidth, y + rowHeight)
          .strokeColor(GRAY_BORDER)
          .lineWidth(0.5)
          .stroke()
        doc
          .fontSize(9)
          .font("Helvetica-Bold")
          .fillColor(BLUE_DARK)
          .text("Farmacéutico", col1 + 10, y + 8, { width: labelWidth - 10 })
        doc
          .fontSize(9)
          .font("Helvetica")
          .fillColor(BLACK)
          .text(loan.pharmacistName, col2, y + 8, { width: valueWidth })
        y += rowHeight
      }

      y += 12

      // Medications sub-table
      doc
        .fontSize(10)
        .font("Helvetica-Bold")
        .fillColor(BLUE_DARK)
        .text("Medicamentos", col1, y)
      y += 18

      const medCols = [
        { header: "Medicamento", width: 160 },
        { header: "Presentación", width: 120 },
        { header: "P. Activo", width: 110 },
        { header: "Cantidad", width: contentWidth - 160 - 120 - 110 },
      ]

      doc.roundedRect(col1, y, contentWidth, 22, 3).fill(BLUE_TABLE_HEADER)
      doc.fontSize(8).font("Helvetica-Bold").fillColor(WHITE)
      let hx = col1
      for (const mc of medCols) {
        doc.text(mc.header, hx + 6, y + 6, { width: mc.width - 12 })
        hx += mc.width
      }
      y += 24

      for (let i = 0; i < loan.items.length; i++) {
        const item = loan.items[i]
        if (i % 2 === 0) {
          doc.rect(col1, y, contentWidth, rowHeight).fill(GRAY_LIGHT)
        }
        doc
          .moveTo(col1, y + rowHeight)
          .lineTo(col1 + contentWidth, y + rowHeight)
          .strokeColor(GRAY_BORDER)
          .lineWidth(0.3)
          .stroke()

        let rx = col1
        doc.fontSize(8).font("Helvetica").fillColor(BLACK)
        doc.text(item.medication.name, rx + 6, y + 8, { width: medCols[0].width - 12 })
        rx += medCols[0].width
        doc.text(item.medication.presentation || "—", rx + 6, y + 8, { width: medCols[1].width - 12 })
        rx += medCols[1].width
        doc.text(item.medication.activeIngredient || "—", rx + 6, y + 8, { width: medCols[2].width - 12 })
        rx += medCols[2].width
        doc.font("Helvetica-Bold").text(`${item.units} ${getUnitTypeLabel(item.unitType)}`, rx + 6, y + 8, { width: medCols[3].width - 12, align: "center" })

        y += rowHeight
      }

      // Total row
      const totalByType: Record<string, number> = {}
      for (const it of loan.items) {
        const label = getUnitTypeLabel(it.unitType)
        totalByType[label] = (totalByType[label] || 0) + it.units
      }
      const totalText = Object.entries(totalByType).map(([label, total]) => `${total} ${label}`).join(" + ")
      doc.roundedRect(col1, y + 2, contentWidth, 22, 3).fill(BLUE_LIGHT)
      doc
        .fontSize(9)
        .font("Helvetica-Bold")
        .fillColor(BLUE_DARK)
        .text("TOTAL", col1 + 6, y + 7)
      const totalColX = col1 + medCols[0].width + medCols[1].width + medCols[2].width
      doc.text(totalText, totalColX + 6, y + 7, { width: medCols[3].width - 12, align: "center" })

      y += 30
      doc.lineWidth(1)
    }

    // --- NOTES ---
    if (loan.notes) {
      doc
        .roundedRect(margin, y, contentWidth, 20, 3)
        .fill(BLUE_LIGHT)

      doc
        .fontSize(9)
        .font("Helvetica-Bold")
        .fillColor(BLUE_DARK)
        .text("Observaciones", margin + 10, y + 5)

      y += 24
      doc
        .fontSize(9)
        .font("Helvetica")
        .fillColor(BLACK)
        .text(loan.notes, margin + 10, y, {
          width: contentWidth - 20,
        })

      y = doc.y + 10
    }

    // --- SIGNATURE AREAS ---
    const sigY = Math.max(y + 60, 560)
    const sigWidth = (contentWidth - 40) / 2

    // Left signature
    doc
      .moveTo(margin, sigY)
      .lineTo(margin + sigWidth, sigY)
      .strokeColor(GRAY_BORDER)
      .stroke()
    doc
      .fontSize(8)
      .font("Helvetica")
      .fillColor(GRAY)
      .text("Firma Farmacia Solicitante", margin, sigY + 6, {
        width: sigWidth,
        align: "center",
        lineBreak: false,
      })

    // Right signature
    const rightSigX = pageWidth - margin - sigWidth
    doc
      .moveTo(rightSigX, sigY)
      .lineTo(pageWidth - margin, sigY)
      .strokeColor(GRAY_BORDER)
      .stroke()
    doc.text("Firma Farmacia Prestadora", rightSigX, sigY + 6, {
      width: sigWidth,
      align: "center",
      lineBreak: false,
    })

    // --- FOOTER ---
    drawFooter(doc, pageWidth, 841.89, margin) // A4 portrait height

    doc.end()
  })
}

// =============================================
// PENDING LOANS LIST PDF
// =============================================

interface PendingLoanForPDF {
  referenceNumber: string
  type: "SOLICITADO" | "PRESTADO"
  createdAt: Date
  hospital: { name: string }
  items: Array<{
    units: number
    unitType: string
    medication: { name: string }
  }>
}

export async function generatePendingListPDF(
  loans: PendingLoanForPDF[],
  listType: "devolver" | "que-devuelvan"
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const title =
      listType === "devolver"
        ? "PENDIENTES DE DEVOLVER"
        : "PENDIENTES DE QUE NOS DEVUELVAN"

    const doc = new PDFDocument({
      size: "A4",
      margins: { top: 50, bottom: 30, left: 50, right: 50 },
      layout: "landscape",
      info: {
        Title: `Préstamos ${title}`,
        Author: "Hospital Universitario de Fuenlabrada",
      },
    })

    const chunks: Buffer[] = []
    doc.on("data", (chunk: Buffer) => chunks.push(chunk))
    doc.on("end", () => resolve(Buffer.concat(chunks)))
    doc.on("error", reject)

    const pageWidth = 841.89
    const pageHeight = 595.28
    const margin = 50
    const tableWidth = pageWidth - margin * 2

    // --- HEADER ---
    let contentY = drawLandscapeHeader(doc)

    // --- TITLE ---
    contentY += 4
    doc
      .roundedRect(margin, contentY, tableWidth, 30, 4)
      .fill(BLUE)

    doc
      .fontSize(11)
      .font("Helvetica-Bold")
      .fillColor(WHITE)
      .text(`LISTADO DE PRÉSTAMOS ${title}`, margin, contentY + 9, {
        align: "center",
        width: tableWidth,
      })

    contentY += 38
    doc
      .fontSize(8)
      .font("Helvetica")
      .fillColor(GRAY)
      .text(
        `Fecha de generación: ${new Date().toLocaleDateString("es-ES", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        })}  —  Total: ${loans.length} préstamo(s)`,
        margin,
        contentY,
        { align: "center", width: tableWidth }
      )

    // --- TABLE CONFIGURATION ---
    const colDefs = [
      { header: "Referencia", width: 110, align: "left" as const },
      { header: "Fecha", width: 80, align: "left" as const },
      { header: "Medicamento", width: 270, align: "left" as const },
      { header: "Hospital", width: 200, align: "left" as const },
      { header: "Cantidad", width: tableWidth - 110 - 80 - 270 - 200, align: "center" as const },
    ]

    const rowHeight = 22
    const cellPadding = 6

    function drawTableHeader(startY: number) {
      // Header background
      doc.roundedRect(margin, startY, tableWidth, rowHeight + 2, 3).fill(BLUE_TABLE_HEADER)
      doc.fontSize(8).font("Helvetica-Bold").fillColor(WHITE)

      let x = margin
      for (const col of colDefs) {
        doc.text(col.header, x + cellPadding, startY + 6, {
          width: col.width - cellPadding * 2,
          align: col.align,
        })
        x += col.width
      }

      return startY + rowHeight + 4
    }

    // --- INITIAL TABLE HEADER ---
    contentY += 18
    let y = drawTableHeader(contentY)

    // --- TABLE ROWS ---
    doc.fillColor(BLACK)

    for (let i = 0; i < loans.length; i++) {
      const loan = loans[i]

      // Check for page break
      if (y + rowHeight > pageHeight - margin - 40) {
        drawFooter(doc, pageWidth, pageHeight, margin)
        doc.addPage()
        const newContentY = drawLandscapeHeader(doc)
        y = drawTableHeader(newContentY + 4)
      }

      // Alternate row background
      if (i % 2 === 0) {
        doc.rect(margin, y, tableWidth, rowHeight).fill(GRAY_LIGHT)
        doc.fillColor(BLACK)
      }

      // Row bottom border
      doc
        .moveTo(margin, y + rowHeight)
        .lineTo(margin + tableWidth, y + rowHeight)
        .strokeColor(GRAY_BORDER)
        .lineWidth(0.3)
        .stroke()

      let x = margin

      // Reference
      doc.fontSize(8).font("Helvetica-Bold").fillColor(BLUE_DARK)
      doc.text(loan.referenceNumber, x + cellPadding, y + 6, {
        width: colDefs[0].width - cellPadding * 2,
      })
      x += colDefs[0].width

      doc.font("Helvetica").fillColor(BLACK)

      // Date
      doc.text(
        `${new Date(loan.createdAt).toLocaleDateString("es-ES", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })} ${new Date(loan.createdAt).toLocaleTimeString("es-ES", {
          hour: "2-digit",
          minute: "2-digit",
        })}`,
        x + cellPadding,
        y + 6,
        { width: colDefs[1].width - cellPadding * 2 }
      )
      x += colDefs[1].width

      // Medication
      const medText = loan.items.length === 0 ? "—" : loan.items.length === 1 ? loan.items[0].medication.name : `${loan.items[0].medication.name} (+${loan.items.length - 1})`
      doc.text(medText, x + cellPadding, y + 6, {
        width: colDefs[2].width - cellPadding * 2,
      })
      x += colDefs[2].width

      // Hospital
      doc.text(loan.hospital.name, x + cellPadding, y + 6, {
        width: colDefs[3].width - cellPadding * 2,
      })
      x += colDefs[3].width

      // Units
      const pendingTotalByType: Record<string, number> = {}
      for (const it of loan.items) {
        const label = getUnitTypeLabel(it.unitType)
        pendingTotalByType[label] = (pendingTotalByType[label] || 0) + it.units
      }
      const unitsText = Object.entries(pendingTotalByType).map(([label, total]) => `${total} ${label}`).join(" + ")
      doc.font("Helvetica-Bold").fillColor(BLACK)
      doc.text(unitsText, x + cellPadding, y + 6, {
        width: colDefs[4].width - cellPadding * 2,
        align: "center",
      })

      y += rowHeight
    }

    // --- TOTAL ROW ---
    const grandTotalByType: Record<string, number> = {}
    for (const l of loans) {
      for (const it of l.items) {
        const label = getUnitTypeLabel(it.unitType)
        grandTotalByType[label] = (grandTotalByType[label] || 0) + it.units
      }
    }
    const grandTotalText = Object.entries(grandTotalByType).map(([label, total]) => `${total} ${label}`).join(" + ")
    doc.roundedRect(margin, y + 2, tableWidth, rowHeight + 2, 3).fill(BLUE_LIGHT)
    doc.fillColor(BLUE_DARK)
    doc
      .fontSize(9)
      .font("Helvetica-Bold")
      .text("TOTAL", margin + cellPadding, y + 8, {
        width: colDefs[0].width - cellPadding * 2,
      })

    const totalX = margin + colDefs[0].width + colDefs[1].width + colDefs[2].width + colDefs[3].width
    doc.text(grandTotalText, totalX + cellPadding, y + 8, {
      width: colDefs[4].width - cellPadding * 2,
      align: "center",
    })

    // --- FOOTER ---
    drawFooter(doc, pageWidth, pageHeight, margin)

    doc.end()
  })
}
