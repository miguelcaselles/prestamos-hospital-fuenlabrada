"use client"

import { ErrorState } from "@/components/shared/error-state"

export default function PrestamosError({ reset }: { error: Error; reset: () => void }) {
  return <ErrorState title="Error al cargar los préstamos" retry={reset} />
}
