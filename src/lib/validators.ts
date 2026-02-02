import { z } from "zod"

export const loanFormSchema = z.object({
  type: z.enum(["SOLICITADO", "PRESTADO"]),
  hospitalId: z.string().min(1, "Seleccione un hospital"),
  medicationId: z.string().min(1, "Seleccione un medicamento"),
  units: z.coerce.number().int().positive("Las unidades deben ser un número positivo"),
  emailSentTo: z.string().email("Introduzca un email válido"),
  notes: z.string().optional(),
})

export const hospitalFormSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  email: z.string().email("Email no válido").optional().or(z.literal("")),
  address: z.string().optional(),
  phone: z.string().optional(),
})

export const medicationFormSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  nationalCode: z.string().optional(),
  presentation: z.string().optional(),
  activeIngredient: z.string().optional(),
})

export const smtpSettingsSchema = z.object({
  host: z.string().min(1, "El host es obligatorio"),
  port: z.coerce.number().int().positive(),
  secure: z.boolean(),
  user: z.string().min(1, "El usuario es obligatorio"),
  password: z.string().min(1, "La contraseña es obligatoria"),
  fromName: z.string().min(1, "El nombre del remitente es obligatorio"),
  fromEmail: z.string().email("Email del remitente no válido"),
})

export type LoanFormValues = z.infer<typeof loanFormSchema>
export type HospitalFormValues = z.infer<typeof hospitalFormSchema>
export type MedicationFormValues = z.infer<typeof medicationFormSchema>
export type SmtpSettingsValues = z.infer<typeof smtpSettingsSchema>
