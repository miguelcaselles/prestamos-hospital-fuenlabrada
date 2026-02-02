import { prisma } from "./prisma"

export async function generateReferenceNumber(): Promise<string> {
  const currentYear = new Date().getFullYear()

  const result = await prisma.$transaction(async (tx) => {
    const counter = await tx.referenceCounter.upsert({
      where: { id: "loan_counter" },
      update: {
        counter: { increment: 1 },
      },
      create: {
        id: "loan_counter",
        year: currentYear,
        counter: 1,
      },
    })

    // Reset counter if year changed
    if (counter.year !== currentYear) {
      const reset = await tx.referenceCounter.update({
        where: { id: "loan_counter" },
        data: { year: currentYear, counter: 1 },
      })
      return `PREST-${currentYear}-${String(reset.counter).padStart(5, "0")}`
    }

    return `PREST-${currentYear}-${String(counter.counter).padStart(5, "0")}`
  })

  return result
}
