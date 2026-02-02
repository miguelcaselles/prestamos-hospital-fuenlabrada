import { Badge } from "@/components/ui/badge"
import {
  LOAN_STATUS_LABELS,
  LOAN_STATUS_COLORS,
  getPendingReturnLabel,
} from "@/lib/constants"
import type { LoanStatus, LoanType } from "@/types"

interface LoanStatusBadgeProps {
  status: LoanStatus
  loanType?: LoanType
}

export function LoanStatusBadge({ status, loanType }: LoanStatusBadgeProps) {
  const label =
    status === "PENDIENTE_DEVOLUCION" && loanType
      ? getPendingReturnLabel(loanType)
      : LOAN_STATUS_LABELS[status]

  return (
    <Badge variant="outline" className={LOAN_STATUS_COLORS[status]}>
      {label}
    </Badge>
  )
}
