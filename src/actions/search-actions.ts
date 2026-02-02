"use server"

import { prisma } from "@/lib/prisma"

export async function searchLoans(query: string) {
  if (!query || query.length < 2) return []

  return prisma.loan.findMany({
    where: {
      OR: [
        { referenceNumber: { contains: query, mode: "insensitive" } },
        { hospital: { name: { contains: query, mode: "insensitive" } } },
        { medication: { name: { contains: query, mode: "insensitive" } } },
      ],
    },
    include: { hospital: true, medication: true },
    take: 10,
    orderBy: { createdAt: "desc" },
  })
}
