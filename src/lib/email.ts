import nodemailer from "nodemailer"
import { prisma } from "./prisma"

async function getTransporter() {
  const settings = await prisma.smtpSettings.findUnique({
    where: { id: "default" },
  })

  if (settings) {
    return nodemailer.createTransport({
      host: settings.host,
      port: settings.port,
      secure: settings.secure,
      auth: { user: settings.user, pass: settings.password },
    })
  }

  // Fallback to env vars
  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  }

  return null
}

interface SendLoanEmailParams {
  to: string
  referenceNumber: string
  loanType: string
  hospitalName: string
  itemCount: number
  medicationNames: string[]
  pdfBuffer: Buffer
}

function getSpainGreeting(): string {
  const now = new Date()
  const spainHour = Number(
    new Intl.DateTimeFormat("es-ES", {
      timeZone: "Europe/Madrid",
      hour: "numeric",
      hour12: false,
    }).format(now)
  )
  return spainHour < 14 ? "Buenos días" : "Buenas tardes"
}

export async function sendLoanEmail(params: SendLoanEmailParams) {
  const transporter = await getTransporter()

  if (!transporter) {
    console.warn("SMTP no configurado. No se pudo enviar el email.")
    return { sent: false, reason: "SMTP no configurado" }
  }

  const settings = await prisma.smtpSettings.findUnique({
    where: { id: "default" },
  })

  const fromName =
    settings?.fromName ||
    process.env.SMTP_FROM_NAME ||
    "Farmacia - H.U. Fuenlabrada"
  const fromEmail =
    settings?.fromEmail || process.env.SMTP_FROM_EMAIL || "noreply@example.com"

  const greeting = getSpainGreeting()

  const ccEmail = settings?.ccEmail || undefined

  await transporter.sendMail({
    from: `"${fromName}" <${fromEmail}>`,
    to: params.to,
    ...(ccEmail && { cc: ccEmail }),
    subject: `Préstamo de medicamento${params.itemCount > 1 ? "s" : ""} - ${params.referenceNumber} - ${params.medicationNames.join(", ")}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <p>${greeting},</p>
        <p>Les envío el impreso del préstamo acordado por teléfono.</p>
        <p>Un saludo</p>
        <p style="color: #666; font-size: 12px; margin-top: 24px; border-top: 1px solid #eee; padding-top: 12px;">
          Este mensaje ha sido generado automáticamente por el sistema de gestión de préstamos
          del Hospital Universitario de Fuenlabrada.
        </p>
      </div>
    `,
    attachments: [
      {
        filename: `prestamo-${params.referenceNumber}-${params.medicationNames.join("_").replace(/\s+/g, "_")}.pdf`,
        content: params.pdfBuffer,
        contentType: "application/pdf",
      },
    ],
  })

  return { sent: true }
}

export async function sendTestEmail(to: string) {
  const transporter = await getTransporter()

  if (!transporter) {
    throw new Error("SMTP no configurado")
  }

  const settings = await prisma.smtpSettings.findUnique({
    where: { id: "default" },
  })

  const fromName =
    settings?.fromName ||
    process.env.SMTP_FROM_NAME ||
    "Farmacia - H.U. Fuenlabrada"
  const fromEmail =
    settings?.fromEmail || process.env.SMTP_FROM_EMAIL || "noreply@example.com"

  await transporter.sendMail({
    from: `"${fromName}" <${fromEmail}>`,
    to,
    subject: "Email de prueba - Sistema de Préstamos",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1e40af;">Email de Prueba</h2>
        <p>Si recibes este email, la configuración SMTP es correcta.</p>
        <p style="color: #666; font-size: 12px;">
          Sistema de Gestión de Préstamos - Hospital Universitario de Fuenlabrada
        </p>
      </div>
    `,
  })
}
