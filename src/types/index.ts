export type LoanType = "SOLICITADO" | "PRESTADO"
export type LoanStatus = "PENDIENTE_FARMATOOLS" | "GESTIONADO_FARMATOOLS" | "PENDIENTE_DEVOLUCION" | "DEVUELTO"

export type Hospital = {
  id: string
  name: string
  email: string | null
  address: string | null
  phone: string | null
  active: boolean
  createdAt: Date
  updatedAt: Date
}

export type Medication = {
  id: string
  name: string
  nationalCode: string | null
  presentation: string | null
  activeIngredient: string | null
  active: boolean
  createdAt: Date
  updatedAt: Date
}

export type Loan = {
  id: string
  referenceNumber: string
  type: LoanType
  hospitalId: string
  medicationId: string
  units: number
  status: LoanStatus
  emailSentTo: string | null
  pdfUrl: string | null
  notes: string | null
  createdAt: Date
  updatedAt: Date
}

export type SmtpSettings = {
  id: string
  host: string
  port: number
  secure: boolean
  user: string
  password: string
  fromName: string
  fromEmail: string
}

export type LoanWithRelations = Loan & {
  hospital: Hospital
  medication: Medication
}
