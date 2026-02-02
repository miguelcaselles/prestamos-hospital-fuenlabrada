import { getMedications } from "@/actions/medication-actions"
import { MedicationTable } from "@/components/medications/medication-table"

export default async function MedicamentosPage() {
  const medications = await getMedications()

  return <MedicationTable medications={medications} />
}
