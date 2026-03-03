import { getLoans } from "@/actions/loan-actions"
import { getHospitals } from "@/actions/hospital-actions"
import { getMedications } from "@/actions/medication-actions"
import { LoanTable } from "@/components/loans/loan-table"

interface PageProps {
  searchParams: Promise<{
    farmatools?: string
    devuelto?: string
    type?: string
    hospitalId?: string
    search?: string
  }>
}

export default async function PrestamosPage({ searchParams }: PageProps) {
  const params = await searchParams
  const [loans, hospitals, medications] = await Promise.all([
    getLoans({
      farmatools: params.farmatools,
      devuelto: params.devuelto,
      type: params.type,
      hospitalId: params.hospitalId,
      search: params.search,
    }),
    getHospitals(),
    getMedications(),
  ])

  return <LoanTable loans={loans} hospitals={hospitals} medications={medications} />
}
