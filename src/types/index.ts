export type LoanType = "SOLICITADO" | "PRESTADO"
export type UnitType = "UNIDADES" | "CAJAS"

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
  isAutoCreated: boolean
  createdAt: Date
  updatedAt: Date
}

export type LoanItem = {
  id: string
  loanId: string
  medicationId: string
  units: number
  unitType: UnitType
}

export type LoanItemWithMedication = LoanItem & {
  medication: Medication
}

export type Loan = {
  id: string
  referenceNumber: string
  type: LoanType
  hospitalId: string
  farmatoolsGestionado: boolean
  devuelto: boolean
  emailSentTo: string | null
  pdfUrl: string | null
  notes: string | null
  pharmacistName: string | null
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
  ccEmail: string | null
}

export type LoanWithRelations = Loan & {
  hospital: Hospital
  items: LoanItemWithMedication[]
}
