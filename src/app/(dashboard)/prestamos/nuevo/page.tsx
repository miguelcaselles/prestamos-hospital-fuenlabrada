import { getHospitals } from "@/actions/hospital-actions"
import { getMedications } from "@/actions/medication-actions"
import { LoanForm } from "@/components/loans/loan-form"

export default async function NuevoPrestamoPage() {
  const [hospitals, medications] = await Promise.all([
    getHospitals(),
    getMedications(),
  ])

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Nuevo Préstamo</h1>
        <p className="text-sm text-gray-500 mt-1">
          Registrar un nuevo préstamo de medicamento
        </p>
      </div>

      <LoanForm hospitals={hospitals} medications={medications} />
    </div>
  )
}
