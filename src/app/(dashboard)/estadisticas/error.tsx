"use client"

import { ErrorState } from "@/components/shared/error-state"

export default function EstadisticasError({
  reset,
}: {
  error: Error
  reset: () => void
}) {
  return (
    <ErrorState
      title="Error al cargar las estadísticas"
      retry={reset}
    />
  )
}
