"use client"

import { ErrorState } from "@/components/shared/error-state"

export default function DashboardError({ reset }: { error: Error; reset: () => void }) {
  return <ErrorState title="Error al cargar el dashboard" retry={reset} />
}
