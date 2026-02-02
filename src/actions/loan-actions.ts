"use server"

import { prisma } from "@/lib/prisma"
import { generateReferenceNumber } from "@/lib/reference"
import { generateLoanPDF } from "@/lib/pdf"
import { sendLoanEmail } from "@/lib/email"
import { loanFormSchema, LoanFormValues } from "@/lib/validators"
import { LOAN_TYPE_LABELS } from "@/lib/constants"
import { revalidatePath } from "next/cache"

export async function createLoan(data: LoanFormValues) {
  const validated = loanFormSchema.parse(data)

  const referenceNumber = await generateReferenceNumber()

  const loan = await prisma.loan.create({
    data: {
      referenceNumber,
      type: validated.type,
      hospitalId: validated.hospitalId,
      medicationId: validated.medicationId,
      units: validated.units,
      emailSentTo: validated.emailSentTo,
      notes: validated.notes || null,
    },
    include: { hospital: true, medication: true },
  })

  // Generate PDF and send email
  try {
    const pdfBuffer = await generateLoanPDF(loan)

    await sendLoanEmail({
      to: loan.emailSentTo!,
      referenceNumber: loan.referenceNumber,
      loanType: LOAN_TYPE_LABELS[loan.type],
      hospitalName: loan.hospital.name,
      medicationName: loan.medication.name,
      units: loan.units,
      pdfBuffer,
    })
  } catch (error) {
    console.error("Error generating PDF or sending email:", error)
  }

  revalidatePath("/prestamos")
  revalidatePath("/dashboard")
  revalidatePath("/pendientes")

  return { success: true, referenceNumber: loan.referenceNumber, id: loan.id }
}

export async function toggleFarmatools(id: string, gestionado: boolean) {
  const loan = await prisma.loan.update({
    where: { id },
    data: { farmatoolsGestionado: gestionado },
  })

  revalidatePath("/prestamos")
  revalidatePath("/dashboard")
  revalidatePath(`/prestamos/${id}`)

  return loan
}

export async function toggleDevuelto(id: string, devuelto: boolean) {
  const loan = await prisma.loan.update({
    where: { id },
    data: { devuelto },
  })

  revalidatePath("/prestamos")
  revalidatePath("/dashboard")
  revalidatePath("/pendientes")
  revalidatePath(`/prestamos/${id}`)

  return loan
}

export async function bulkMarkReturned(loanIds: string[]) {
  await prisma.loan.updateMany({
    where: { id: { in: loanIds } },
    data: { devuelto: true },
  })

  revalidatePath("/prestamos")
  revalidatePath("/dashboard")
  revalidatePath("/pendientes")
}

export async function updateLoanNotes(id: string, notes: string) {
  const loan = await prisma.loan.update({
    where: { id },
    data: { notes },
  })

  revalidatePath(`/prestamos/${id}`)
  return loan
}

export async function getLoans(filters?: {
  farmatools?: string
  devuelto?: string
  type?: string
  hospitalId?: string
  search?: string
}) {
  const where: Record<string, unknown> = {}

  if (filters?.farmatools === "true") {
    where.farmatoolsGestionado = true
  } else if (filters?.farmatools === "false") {
    where.farmatoolsGestionado = false
  }
  if (filters?.devuelto === "true") {
    where.devuelto = true
  } else if (filters?.devuelto === "false") {
    where.devuelto = false
  }
  if (filters?.type) {
    where.type = filters.type
  }
  if (filters?.hospitalId) {
    where.hospitalId = filters.hospitalId
  }
  if (filters?.search) {
    where.medication = {
      name: { contains: filters.search, mode: "insensitive" },
    }
  }

  return prisma.loan.findMany({
    where,
    include: { hospital: true, medication: true },
    orderBy: { createdAt: "desc" },
  })
}

export async function getLoan(id: string) {
  return prisma.loan.findUnique({
    where: { id },
    include: { hospital: true, medication: true },
  })
}
