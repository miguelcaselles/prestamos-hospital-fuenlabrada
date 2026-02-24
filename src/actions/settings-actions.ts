"use server"

import { prisma } from "@/lib/prisma"
import { smtpSettingsSchema, SmtpSettingsValues } from "@/lib/validators"
import { sendTestEmail } from "@/lib/email"

export async function getSmtpSettings() {
  return prisma.smtpSettings.findUnique({
    where: { id: "default" },
  })
}

export async function updateSmtpSettings(data: SmtpSettingsValues) {
  const validated = smtpSettingsSchema.parse(data)
  const dbData = { ...validated, ccEmail: validated.ccEmail || null }

  return prisma.smtpSettings.upsert({
    where: { id: "default" },
    update: dbData,
    create: {
      id: "default",
      ...dbData,
    },
  })
}

export async function sendSmtpTestEmail(to: string) {
  try {
    await sendTestEmail(to)
    return { success: true, error: null }
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Error desconocido al enviar email"
    return { success: false, error: message }
  }
}
