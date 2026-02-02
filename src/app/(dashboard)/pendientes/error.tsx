"use client"

import { ErrorState } from "@/components/shared/error-state"

export default function PendientesError({ reset }: { error: Error; reset: () => void }) {
  return <ErrorState title="Error al cargar los pendientes" retry={reset} />
}
