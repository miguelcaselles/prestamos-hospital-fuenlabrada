import PDFDocument from "pdfkit"
import path from "path"
import fs from "fs"
import { LOAN_TYPE_LABELS } from "./constants"

interface LoanForPDF {
  referenceNumber: string
  type: "SOLICITADO" | "PRESTADO"
  units: number
  notes: string | null
  createdAt: Date
  hospital: {
    name: string
  }
  medication: {
    name: string
    nationalCode: string | null
    presentation: string | null
    activeIngredient: string | null
  }
}

export async function generateLoanPDF(loan: LoanForPDF): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margin: 50,
      info: {
        Title: `Préstamo ${loan.referenceNumber}`,
        Author: "Hospital Universitario de Fuenlabrada",
      },
    })

    const chunks: Buffer[] = []
    doc.on("data", (chunk: Buffer) => chunks.push(chunk))
    doc.on("end", () => resolve(Buffer.concat(chunks)))
    doc.on("error", reject)

    // --- HEADER ---
    const logoPath = path.join(process.cwd(), "public", "logo-fuenlabrada.png")
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, 50, 30, { width: 80 })
    }

    doc
      .fontSize(16)
      .font("Helvetica-Bold")
      .text("HOSPITAL UNIVERSITARIO DE FUENLABRADA", 140, 45, { width: 400 })
    doc.fontSize(10).font("Helvetica").text("Servicio de Farmacia", 140, 68)

    doc.moveTo(50, 100).lineTo(545, 100).stroke()

    // --- DOCUMENT TITLE ---
    doc.moveDown(2)
    doc
      .fontSize(14)
      .font("Helvetica-Bold")
      .text("DOCUMENTO DE PRESTAMO DE MEDICAMENTOS", { align: "center" })

    doc.moveDown(1)
    doc
      .fontSize(11)
      .font("Helvetica")
      .text(`Referencia: ${loan.referenceNumber}`, { align: "center" })
    doc.text(
      `Fecha: ${loan.createdAt.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })}`,
      { align: "center" }
    )

    // --- LOAN TYPE ---
    doc.moveDown(1.5)
    const typeLabel = LOAN_TYPE_LABELS[loan.type]
    doc.fontSize(12).font("Helvetica-Bold").text(`Tipo: ${typeLabel}`, 50)

    // --- DETAILS TABLE ---
    doc.moveDown(1)
    const col1 = 50
    const col2 = 220

    const rows = [
      ["Hospital:", loan.hospital.name],
      ["Medicamento:", loan.medication.name],
      ["Codigo Nacional:", loan.medication.nationalCode || "N/A"],
      ["Presentacion:", loan.medication.presentation || "N/A"],
      ["Principio Activo:", loan.medication.activeIngredient || "N/A"],
      ["Unidades:", String(loan.units)],
    ]

    let y = doc.y
    for (const [label, value] of rows) {
      doc.fontSize(10).font("Helvetica-Bold").text(label, col1, y)
      doc.font("Helvetica").text(value, col2, y)
      y += 24
    }

    // --- NOTES ---
    if (loan.notes) {
      doc.moveDown(1)
      y = doc.y > y ? doc.y : y + 10
      doc.fontSize(10).font("Helvetica-Bold").text("Observaciones:", col1, y)
      doc
        .font("Helvetica")
        .text(loan.notes, col1, y + 16, { width: 495 })
    }

    // --- SIGNATURE AREAS ---
    const sigY = 620
    doc.moveTo(50, sigY).lineTo(250, sigY).stroke()
    doc
      .fontSize(9)
      .text("Firma Farmacia Solicitante", 50, sigY + 5, {
        width: 200,
        align: "center",
      })

    doc.moveTo(320, sigY).lineTo(545, sigY).stroke()
    doc.text("Firma Farmacia Prestadora", 320, sigY + 5, {
      width: 225,
      align: "center",
    })

    // --- FOOTER ---
    doc
      .fontSize(8)
      .font("Helvetica")
      .text(
        "Hospital Universitario de Fuenlabrada - Camino del Molino, 2 - 28942 Fuenlabrada (Madrid)",
        50,
        750,
        { align: "center", width: 495 }
      )

    doc.end()
  })
}

interface PendingLoanForPDF {
  referenceNumber: string
  type: "SOLICITADO" | "PRESTADO"
  units: number
  createdAt: Date
  hospital: { name: string }
  medication: { name: string }
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
      margin: 50,
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

    // --- HEADER ---
    const logoPath = path.join(process.cwd(), "public", "logo-fuenlabrada.png")
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, 50, 30, { width: 60 })
    }

    doc
      .fontSize(14)
      .font("Helvetica-Bold")
      .text("HOSPITAL UNIVERSITARIO DE FUENLABRADA", 120, 40, { width: 400 })
    doc.fontSize(9).font("Helvetica").text("Servicio de Farmacia", 120, 60)

    doc.moveTo(50, 85).lineTo(792 - 50, 85).stroke()

    // --- TITLE ---
    doc.moveDown(1)
    doc
      .fontSize(13)
      .font("Helvetica-Bold")
      .text(`LISTADO DE PRÉSTAMOS ${title}`, 50, 95, {
        align: "center",
        width: 792 - 100,
      })

    doc
      .fontSize(9)
      .font("Helvetica")
      .text(
        `Fecha de generación: ${new Date().toLocaleDateString("es-ES", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        })}  —  Total: ${loans.length} préstamo(s)`,
        50,
        115,
        { align: "center", width: 792 - 100 }
      )

    // --- TABLE HEADER ---
    const tableTop = 145
    const colX = [50, 150, 260, 520, 640]
    const colW = [95, 105, 255, 115, 100]
    const headers = ["Referencia", "Fecha", "Medicamento", "Hospital", "Uds."]

    // Header background
    doc.rect(50, tableTop - 4, 792 - 100, 20).fill("#2563eb")
    doc.fontSize(9).font("Helvetica-Bold").fillColor("#ffffff")
    headers.forEach((h, i) => {
      doc.text(h, colX[i] + 4, tableTop, { width: colW[i], align: i === 4 ? "center" : "left" })
    })

    // --- TABLE ROWS ---
    let y = tableTop + 22
    doc.fillColor("#000000")

    for (let i = 0; i < loans.length; i++) {
      const loan = loans[i]

      // Alternate row background
      if (i % 2 === 0) {
        doc.rect(50, y - 4, 792 - 100, 20).fill("#f0f4ff")
        doc.fillColor("#000000")
      }

      doc.fontSize(8).font("Helvetica-Bold").text(loan.referenceNumber, colX[0] + 4, y, { width: colW[0] })
      doc.font("Helvetica")
      doc.text(
        new Date(loan.createdAt).toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" }),
        colX[1] + 4, y, { width: colW[1] }
      )
      doc.text(loan.medication.name, colX[2] + 4, y, { width: colW[2] })
      doc.text(loan.hospital.name, colX[3] + 4, y, { width: colW[3] })
      doc.font("Helvetica-Bold").text(String(loan.units), colX[4] + 4, y, { width: colW[4], align: "center" })

      y += 20

      // New page if needed
      if (y > 792 - 50 - 40) {
        doc.addPage()
        y = 50
      }
    }

    // --- TOTAL ROW ---
    const totalUnits = loans.reduce((sum, l) => sum + l.units, 0)
    doc.rect(50, y, 792 - 100, 22).fill("#e0e7ff")
    doc.fillColor("#000000")
    doc.fontSize(9).font("Helvetica-Bold").text("TOTAL", colX[0] + 4, y + 4, { width: colW[0] })
    doc.text(String(totalUnits), colX[4] + 4, y + 4, { width: colW[4], align: "center" })

    // --- FOOTER ---
    doc
      .fontSize(7)
      .font("Helvetica")
      .fillColor("#666666")
      .text(
        "Hospital Universitario de Fuenlabrada - Camino del Molino, 2 - 28942 Fuenlabrada (Madrid)",
        50,
        792 - 50 - 15,
        { align: "center", width: 792 - 100 }
      )

    doc.end()
  })
}
