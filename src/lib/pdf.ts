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
