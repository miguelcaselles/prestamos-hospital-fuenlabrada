import { PrismaClient } from "@prisma/client"
import * as XLSX from "xlsx"
import path from "path"

const prisma = new PrismaClient()

interface RawRow {
  grupo: string
  practivo: string
  codigo: string
  nombre: string
  tipo: string
  tipo_nombre: string
  oferta: string
}

async function main() {
  const filePath = path.join(process.cwd(), "medicamentos hopsital.xlsx")
  const workbook = XLSX.readFile(filePath)
  const sheetName = workbook.SheetNames[0]
  const sheet = workbook.Sheets[sheetName]
  const rows = XLSX.utils.sheet_to_json<RawRow>(sheet)

  console.log(`Total filas en el xlsx: ${rows.length}`)

  // Deduplicate by national code - keep first occurrence per code
  const uniqueMeds = new Map<string, RawRow>()
  for (const row of rows) {
    const code = String(row.codigo).trim()
    if (code && !uniqueMeds.has(code)) {
      uniqueMeds.set(code, row)
    }
  }

  console.log(`Medicamentos únicos (por código nacional): ${uniqueMeds.size}`)

  // Check existing medications to avoid duplicates
  const existingCodes = new Set(
    (await prisma.medication.findMany({ select: { nationalCode: true } }))
      .map((m) => m.nationalCode)
      .filter(Boolean)
  )

  const toInsert = [...uniqueMeds.entries()].filter(
    ([code]) => !existingCodes.has(code)
  )

  console.log(`Ya existentes en BD: ${existingCodes.size}`)
  console.log(`Nuevos a importar: ${toInsert.length}`)

  if (toInsert.length === 0) {
    console.log("No hay medicamentos nuevos para importar.")
    return
  }

  // Insert in batches of 100
  const batchSize = 100
  let imported = 0

  for (let i = 0; i < toInsert.length; i += batchSize) {
    const batch = toInsert.slice(i, i + batchSize)

    await prisma.medication.createMany({
      data: batch.map(([code, row]) => ({
        name: String(row.nombre).trim(),
        nationalCode: code,
        presentation: row.tipo_nombre ? String(row.tipo_nombre).trim() : null,
        activeIngredient: row.practivo ? String(row.practivo).trim() : null,
      })),
      skipDuplicates: true,
    })

    imported += batch.length
    console.log(`Importados: ${imported}/${toInsert.length}`)
  }

  console.log(`\nImportación completada: ${imported} medicamentos añadidos.`)
}

main()
  .catch((e) => {
    console.error("Error durante la importación:", e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
