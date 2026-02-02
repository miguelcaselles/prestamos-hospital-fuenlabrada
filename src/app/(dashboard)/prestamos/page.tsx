import { getLoans } from "@/actions/loan-actions"
import { getHospitals } from "@/actions/hospital-actions"
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
  const [loans, hospitals] = await Promise.all([
    getLoans({
      farmatools: params.farmatools,
      devuelto: params.devuelto,
      type: params.type,
      hospitalId: params.hospitalId,
      search: params.search,
    }),
    getHospitals(),
  ])

  return <LoanTable loans={loans} hospitals={hospitals} />
}
