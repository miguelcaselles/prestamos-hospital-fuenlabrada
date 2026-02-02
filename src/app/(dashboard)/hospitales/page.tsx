import { getHospitals } from "@/actions/hospital-actions"
import { HospitalTable } from "@/components/hospitals/hospital-table"

export default async function HospitalesPage() {
  const hospitals = await getHospitals()

  return <HospitalTable hospitals={hospitals} />
}
