import { notFound } from "next/navigation"
import { getLoan } from "@/actions/loan-actions"
import { LoanDetail } from "@/components/loans/loan-detail"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function PrestamoDetailPage({ params }: PageProps) {
  const { id } = await params
  const loan = await getLoan(id)

  if (!loan) {
    notFound()
  }

  return <LoanDetail loan={loan} />
}
