import { notFound } from "next/navigation"
import { getLoan } from "@/actions/loan-actions"
import { getHospitals } from "@/actions/hospital-actions"
import { getMedications } from "@/actions/medication-actions"
import { LoanDetail } from "@/components/loans/loan-detail"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function PrestamoDetailPage({ params }: PageProps) {
  const { id } = await params
  const [loan, hospitals, medications] = await Promise.all([
    getLoan(id),
    getHospitals(),
    getMedications(),
  ])

  if (!loan) {
    notFound()
  }

  return <LoanDetail loan={loan} hospitals={hospitals} medications={medications} />
}
