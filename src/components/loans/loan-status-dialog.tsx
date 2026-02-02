"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { LoanStatusBadges } from "./loan-status-badge"
import {
  getFarmatoolsLabel,
  getDevolucionLabel,
} from "@/lib/constants"
import { toggleFarmatools, toggleDevuelto } from "@/actions/loan-actions"
import { toast } from "sonner"
import { useTransition } from "react"
import { ClipboardCheck, PackageCheck } from "lucide-react"
import type { LoanType } from "@/types"

interface LoanStatusDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  loanId: string
  farmatoolsGestionado: boolean
  devuelto: boolean
  loanType: LoanType
}

export function LoanStatusDialog({
  open,
  onOpenChange,
  loanId,
  farmatoolsGestionado,
  devuelto,
  loanType,
}: LoanStatusDialogProps) {
  const [isPending, startTransition] = useTransition()

  const handleToggleFarmatools = () => {
    startTransition(async () => {
      try {
        await toggleFarmatools(loanId, !farmatoolsGestionado)
        toast.success(
          `Marcado como: ${getFarmatoolsLabel(!farmatoolsGestionado)}`
        )
        onOpenChange(false)
      } catch {
        toast.error("Error al actualizar el estado")
      }
    })
  }

  const handleToggleDevuelto = () => {
    startTransition(async () => {
      try {
        await toggleDevuelto(loanId, !devuelto)
        toast.success(
          `Marcado como: ${getDevolucionLabel(!devuelto, loanType)}`
        )
        onOpenChange(false)
      } catch {
        toast.error("Error al actualizar el estado")
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>Cambiar Estado</DialogTitle>
          <DialogDescription>
            Gestiona los estados de este préstamo de forma independiente.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-5 pt-2">
          <div>
            <span className="text-sm text-gray-500">Estado actual:</span>
            <div className="mt-2">
              <LoanStatusBadges
                farmatoolsGestionado={farmatoolsGestionado}
                devuelto={devuelto}
                loanType={loanType}
              />
            </div>
          </div>

          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start gap-3"
              disabled={isPending}
              onClick={handleToggleFarmatools}
            >
              <ClipboardCheck className="h-4 w-4" />
              {farmatoolsGestionado
                ? "Marcar como NO gestionado en Farmatools"
                : "Marcar como gestionado en Farmatools"}
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start gap-3"
              disabled={isPending}
              onClick={handleToggleDevuelto}
            >
              <PackageCheck className="h-4 w-4" />
              {devuelto
                ? "Marcar como pendiente de devolución"
                : "Marcar como devuelto"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
