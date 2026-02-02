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

  return prisma.smtpSettings.upsert({
    where: { id: "default" },
    update: validated,
    create: {
      id: "default",
      ...validated,
    },
  })
}

export async function sendSmtpTestEmail(to: string) {
  await sendTestEmail(to)
  return { success: true }
}
