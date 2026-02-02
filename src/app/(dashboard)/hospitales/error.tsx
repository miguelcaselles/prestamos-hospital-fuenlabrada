"use client"

import { ErrorState } from "@/components/shared/error-state"

export default function HospitalesError({ reset }: { error: Error; reset: () => void }) {
  return <ErrorState title="Error al cargar los hospitales" retry={reset} />
}
