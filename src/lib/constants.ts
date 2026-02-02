export const LOAN_TYPE_LABELS: Record<string, string> = {
  SOLICITADO: "Solicitamos préstamo",
  PRESTADO: "Nos solicitan préstamo",
}

export const LOAN_TYPE_DESCRIPTIONS: Record<string, string> = {
  SOLICITADO: "Solicitamos medicación a otro hospital",
  PRESTADO: "Otro hospital nos solicita medicación",
}

export const LOAN_STATUS_LABELS: Record<string, string> = {
  PENDIENTE_FARMATOOLS: "Pendiente de gestionar en Farmatools",
  GESTIONADO_FARMATOOLS: "Gestionado en Farmatools",
  PENDIENTE_DEVOLUCION: "Pendiente de devolución",
  DEVUELTO: "Devuelto",
}

export const LOAN_STATUS_COLORS: Record<string, string> = {
  PENDIENTE_FARMATOOLS: "bg-yellow-100 text-yellow-800 border-yellow-300",
  GESTIONADO_FARMATOOLS: "bg-blue-100 text-blue-800 border-blue-300",
  PENDIENTE_DEVOLUCION: "bg-orange-100 text-orange-800 border-orange-300",
  DEVUELTO: "bg-green-100 text-green-800 border-green-300",
}

export const STATUS_TRANSITIONS: Record<string, string[]> = {
  PENDIENTE_FARMATOOLS: ["GESTIONADO_FARMATOOLS"],
  GESTIONADO_FARMATOOLS: ["PENDIENTE_DEVOLUCION"],
  PENDIENTE_DEVOLUCION: ["DEVUELTO"],
  DEVUELTO: [],
}

export function getPendingReturnLabel(loanType: string): string {
  return loanType === "SOLICITADO"
    ? "Pendiente de devolver"
    : "Pendiente de que nos devuelvan"
}
