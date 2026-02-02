"use server"

import { prisma } from "@/lib/prisma"
import { medicationFormSchema, MedicationFormValues } from "@/lib/validators"
import { revalidatePath } from "next/cache"

export async function getMedications() {
  return prisma.medication.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
  })
}

export async function createMedication(data: MedicationFormValues) {
  const validated = medicationFormSchema.parse(data)

  const medication = await prisma.medication.create({
    data: {
      name: validated.name,
      nationalCode: validated.nationalCode || null,
      presentation: validated.presentation || null,
      activeIngredient: validated.activeIngredient || null,
    },
  })

  revalidatePath("/medicamentos")
  revalidatePath("/prestamos/nuevo")
  return medication
}

export async function updateMedication(id: string, data: MedicationFormValues) {
  const validated = medicationFormSchema.parse(data)

  const medication = await prisma.medication.update({
    where: { id },
    data: {
      name: validated.name,
      nationalCode: validated.nationalCode || null,
      presentation: validated.presentation || null,
      activeIngredient: validated.activeIngredient || null,
    },
  })

  revalidatePath("/medicamentos")
  revalidatePath("/prestamos/nuevo")
  return medication
}

export async function deleteMedication(id: string) {
  await prisma.medication.update({
    where: { id },
    data: { active: false },
  })

  revalidatePath("/medicamentos")
  revalidatePath("/prestamos/nuevo")
}
