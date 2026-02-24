import { NextRequest, NextResponse } from "next/server"

interface CimaResult {
  nregistro: string
  nombre: string
  vtm?: { nombre: string }
  formaFarmaceutica?: { nombre: string }
  dosis?: string
}

interface CimaResponse {
  resultados?: CimaResult[]
}

async function safeJson(res: Response): Promise<CimaResponse> {
  try {
    return res.ok ? await res.json() : {}
  } catch {
    return {}
  }
}

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim()

  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] })
  }

  try {
    const isNumeric = /^\d+$/.test(q)
    let results: CimaResult[] = []

    if (isNumeric) {
      const res = await fetch(
        `https://cima.aemps.es/cima/rest/medicamentos?cn=${encodeURIComponent(q)}&pageSize=25`
      )
      const data = await safeJson(res)
      results = data.resultados || []
    } else {
      // Search by name AND active ingredient in parallel
      const [nameRes, activRes] = await Promise.all([
        fetch(
          `https://cima.aemps.es/cima/rest/medicamentos?nombre=${encodeURIComponent(q)}&pageSize=15`
        ),
        fetch(
          `https://cima.aemps.es/cima/rest/medicamentos?practiv1=${encodeURIComponent(q)}&pageSize=15`
        ),
      ])

      const nameData = await safeJson(nameRes)
      const activData = await safeJson(activRes)

      // Merge and deduplicate by nregistro — active ingredient results first (more specific)
      const seen = new Set<string>()
      const merged: CimaResult[] = []

      for (const med of [
        ...(activData.resultados || []),
        ...(nameData.resultados || []),
      ]) {
        if (!seen.has(med.nregistro)) {
          seen.add(med.nregistro)
          merged.push(med)
        }
      }

      results = merged.slice(0, 25)
    }

    return NextResponse.json({
      results: results.map((med) => ({
        nregistro: med.nregistro,
        nombre: med.nombre,
        activeIngredient: med.vtm?.nombre || null,
        form: med.formaFarmaceutica?.nombre || null,
        dosis: med.dosis || null,
      })),
    })
  } catch (error) {
    console.error("CIMA API error:", error)
    return NextResponse.json({ results: [] }, { status: 500 })
  }
}
