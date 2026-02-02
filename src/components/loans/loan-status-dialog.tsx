"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { LoanStatusBadge } from "./loan-status-badge"
import { STATUS_TRANSITIONS, LOAN_STATUS_LABELS } from "@/lib/constants"
import { updateLoanStatus } from "@/actions/loan-actions"
import { toast } from "sonner"
import { useTransition } from "react"
import { ArrowRight } from "lucide-react"
import type { LoanStatus, LoanType } from "@/types"

interface LoanStatusDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  loanId: string
  currentStatus: LoanStatus
  loanType: LoanType
}

export function LoanStatusDialog({
  open,
  onOpenChange,
  loanId,
  currentStatus,
  loanType,
}: LoanStatusDialogProps) {
  const [isPending, startTransition] = useTransition()
  const nextStatuses = STATUS_TRANSITIONS[currentStatus] || []

  const handleStatusChange = (newStatus: string) => {
    startTransition(async () => {
      try {
        await updateLoanStatus(loanId, newStatus as LoanStatus)
        toast.success("Estado actualizado correctamente")
        onOpenChange(false)
      } catch {
        toast.error("Error al actualizar el estado")
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Cambiar Estado</DialogTitle>
          <DialogDescription>
            Selecciona el nuevo estado para este préstamo.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Estado actual:</span>
            <LoanStatusBadge status={currentStatus} loanType={loanType} />
          </div>

          {nextStatuses.length === 0 ? (
            <p className="text-sm text-gray-500">
              Este préstamo ya está en su estado final.
            </p>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Avanzar a:</p>
              {nextStatuses.map((status) => (
                <Button
                  key={status}
                  variant="outline"
                  className="w-full justify-between"
                  disabled={isPending}
                  onClick={() => handleStatusChange(status)}
                >
                  <span>
                    {LOAN_STATUS_LABELS[status as keyof typeof LOAN_STATUS_LABELS]}
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
