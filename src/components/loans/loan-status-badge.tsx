import { Badge } from "@/components/ui/badge"
import {
  getFarmatoolsLabel,
  getFarmatoolsColor,
  getDevolucionLabel,
  getDevolucionColor,
} from "@/lib/constants"
import type { LoanType } from "@/types"

interface LoanStatusBadgesProps {
  farmatoolsGestionado: boolean
  devuelto: boolean
  loanType: LoanType
}

export function LoanStatusBadges({
  farmatoolsGestionado,
  devuelto,
  loanType,
}: LoanStatusBadgesProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      <Badge variant="outline" className={getFarmatoolsColor(farmatoolsGestionado)}>
        {getFarmatoolsLabel(farmatoolsGestionado)}
      </Badge>
      <Badge variant="outline" className={getDevolucionColor(devuelto)}>
        {getDevolucionLabel(devuelto, loanType)}
      </Badge>
    </div>
  )
}
