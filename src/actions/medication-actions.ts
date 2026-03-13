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

export async function createMedicationQuick(name: string) {
  if (!name || name.trim().length === 0) {
    throw new Error("El nombre del medicamento es obligatorio")
  }

  const trimmed = name.trim()

  const existing = await prisma.medication.findFirst({
    where: { name: { equals: trimmed, mode: "insensitive" } },
    orderBy: { createdAt: "asc" },
  })

  if (existing) {
    if (!existing.active) {
      const reactivated = await prisma.medication.update({
        where: { id: existing.id },
        data: { active: true },
      })
      revalidatePath("/medicamentos")
      revalidatePath("/prestamos/nuevo")
      return reactivated
    }
    return existing
  }

  const medication = await prisma.medication.create({
    data: {
      name: trimmed,
      isAutoCreated: true,
    },
  })

  revalidatePath("/medicamentos")
  revalidatePath("/prestamos/nuevo")
  return medication
}

export async function createMedicationFromCima(nregistro: string) {
  const res = await fetch(
    `https://cima.aemps.es/cima/rest/medicamento?nregistro=${encodeURIComponent(nregistro)}`
  )

  if (!res.ok) {
    throw new Error("Error al consultar CIMA")
  }

  const data = await res.json()
  const name = data.nombre?.trim()
  if (!name) throw new Error("Medicamento no encontrado en CIMA")

  const activeIngredient = data.vtm?.nombre?.trim() || null
  const presentation = data.formaFarmaceutica?.nombre?.trim() || null
  const cn =
    data.presentaciones?.[0]?.cn?.trim() || null

  // Check if already exists by CN — always update name/details from CIMA (authoritative source)
  if (cn) {
    const existing = await prisma.medication.findFirst({
      where: { nationalCode: cn },
    })
    if (existing) {
      const updated = await prisma.medication.update({
        where: { id: existing.id },
        data: {
          active: true,
          name,
          activeIngredient: activeIngredient ?? existing.activeIngredient,
          presentation: presentation ?? existing.presentation,
        },
      })
      revalidatePath("/medicamentos")
      revalidatePath("/prestamos/nuevo")
      return updated
    }
  }

  // Check by name — only if CN is compatible (both null, or one is null, or they match)
  const existingByName = await prisma.medication.findFirst({
    where: { name: { equals: name, mode: "insensitive" } },
    orderBy: { createdAt: "asc" },
  })
  if (
    existingByName &&
    !(cn && existingByName.nationalCode && cn !== existingByName.nationalCode)
  ) {
    const updated = await prisma.medication.update({
      where: { id: existingByName.id },
      data: {
        active: true,
        nationalCode: cn ?? existingByName.nationalCode,
        activeIngredient: activeIngredient ?? existingByName.activeIngredient,
        presentation: presentation ?? existingByName.presentation,
      },
    })
    revalidatePath("/medicamentos")
    revalidatePath("/prestamos/nuevo")
    return updated
  }

  // Create new
  const medication = await prisma.medication.create({
    data: {
      name,
      nationalCode: cn,
      activeIngredient,
      presentation,
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
