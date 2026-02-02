"use server"

import { prisma } from "@/lib/prisma"
import { hospitalFormSchema, HospitalFormValues } from "@/lib/validators"
import { revalidatePath } from "next/cache"

export async function getHospitals() {
  return prisma.hospital.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
  })
}

export async function createHospital(data: HospitalFormValues) {
  const validated = hospitalFormSchema.parse(data)

  const hospital = await prisma.hospital.create({
    data: {
      name: validated.name,
      email: validated.email || null,
      address: validated.address || null,
      phone: validated.phone || null,
    },
  })

  revalidatePath("/hospitales")
  revalidatePath("/prestamos/nuevo")
  return hospital
}

export async function updateHospital(id: string, data: HospitalFormValues) {
  const validated = hospitalFormSchema.parse(data)

  const hospital = await prisma.hospital.update({
    where: { id },
    data: {
      name: validated.name,
      email: validated.email || null,
      address: validated.address || null,
      phone: validated.phone || null,
    },
  })

  revalidatePath("/hospitales")
  revalidatePath("/prestamos/nuevo")
  return hospital
}

export async function deleteHospital(id: string) {
  // Soft delete
  await prisma.hospital.update({
    where: { id },
    data: { active: false },
  })

  revalidatePath("/hospitales")
  revalidatePath("/prestamos/nuevo")
}
