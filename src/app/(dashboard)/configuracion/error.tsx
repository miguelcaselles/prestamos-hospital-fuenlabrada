"use client"

import { ErrorState } from "@/components/shared/error-state"

export default function ConfiguracionError({ reset }: { error: Error; reset: () => void }) {
  return <ErrorState title="Error al cargar la configuración" retry={reset} />
}
