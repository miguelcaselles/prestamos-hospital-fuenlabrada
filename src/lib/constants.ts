export const LOAN_TYPE_LABELS: Record<string, string> = {
  SOLICITADO: "Solicitamos préstamo",
  PRESTADO: "Nos solicitan préstamo",
}

export const LOAN_TYPE_DESCRIPTIONS: Record<string, string> = {
  SOLICITADO: "Solicitamos medicación a otro hospital",
  PRESTADO: "Otro hospital nos solicita medicación",
}

export function getFarmatoolsLabel(gestionado: boolean): string {
  return gestionado
    ? "Gestionado en Farmatools"
    : "Pendiente de gestionar en Farmatools"
}

export function getFarmatoolsColor(gestionado: boolean): string {
  return gestionado
    ? "bg-blue-100 text-blue-800 border-blue-300"
    : "bg-yellow-100 text-yellow-800 border-yellow-300"
}

export function getDevolucionLabel(devuelto: boolean, loanType: string): string {
  if (devuelto) return "Devuelto"
  return loanType === "SOLICITADO"
    ? "Pendiente de devolver"
    : "Pendiente de que nos devuelvan"
}

export function getDevolucionColor(devuelto: boolean): string {
  return devuelto
    ? "bg-green-100 text-green-800 border-green-300"
    : "bg-orange-100 text-orange-800 border-orange-300"
}
