"use client"

import { useState, useTransition } from "react"
import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  getFarmatoolsLabel,
  getFarmatoolsColor,
  getDevolucionLabel,
  getDevolucionColor,
} from "@/lib/constants"
import { toggleFarmatools, toggleDevuelto } from "@/actions/loan-actions"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import type { LoanType } from "@/types"

interface ToggleableStatusBadgesProps {
  loanId: string
  farmatoolsGestionado: boolean
  devuelto: boolean
  loanType: LoanType
}

export function ToggleableStatusBadges({
  loanId,
  farmatoolsGestionado,
  devuelto,
  loanType,
}: ToggleableStatusBadgesProps) {
  const [optimisticFarmatools, setOptimisticFarmatools] = useState(farmatoolsGestionado)
  const [optimisticDevuelto, setOptimisticDevuelto] = useState(devuelto)
  const [isFarmatoolsPending, startFarmatoolsTransition] = useTransition()
  const [isDevueltoPending, startDevueltoTransition] = useTransition()

  const handleToggleFarmatools = (e: React.MouseEvent) => {
    e.stopPropagation()
    const newValue = !optimisticFarmatools
    setOptimisticFarmatools(newValue)

    startFarmatoolsTransition(async () => {
      try {
        await toggleFarmatools(loanId, newValue)
        toast.success(getFarmatoolsLabel(newValue), { duration: 2000 })
      } catch {
        setOptimisticFarmatools(!newValue)
        toast.error("Error al actualizar")
      }
    })
  }

  const handleToggleDevuelto = (e: React.MouseEvent) => {
    e.stopPropagation()
    const newValue = !optimisticDevuelto
    setOptimisticDevuelto(newValue)

    startDevueltoTransition(async () => {
      try {
        await toggleDevuelto(loanId, newValue)
        toast.success(getDevolucionLabel(newValue, loanType), { duration: 2000 })
      } catch {
        setOptimisticDevuelto(!newValue)
        toast.error("Error al actualizar")
      }
    })
  }

  const farmatoolsTooltip = optimisticFarmatools
    ? "Click: marcar como pendiente de gestionar"
    : "Click: marcar como gestionado"

  const devueltoTooltip = optimisticDevuelto
    ? "Click: marcar como pendiente"
    : "Click: marcar como devuelto"

  return (
    <div className="flex flex-wrap gap-1.5">
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={handleToggleFarmatools}
            disabled={isFarmatoolsPending}
            className="focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-full"
          >
            <Badge
              variant="outline"
              className={`${getFarmatoolsColor(optimisticFarmatools)} cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-105 active:scale-95 select-none ${isFarmatoolsPending ? "opacity-70" : ""}`}
            >
              {isFarmatoolsPending && (
                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
              )}
              {getFarmatoolsLabel(optimisticFarmatools)}
            </Badge>
          </button>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p>{farmatoolsTooltip}</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={handleToggleDevuelto}
            disabled={isDevueltoPending}
            className="focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-full"
          >
            <Badge
              variant="outline"
              className={`${getDevolucionColor(optimisticDevuelto)} cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-105 active:scale-95 select-none ${isDevueltoPending ? "opacity-70" : ""}`}
            >
              {isDevueltoPending && (
                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
              )}
              {getDevolucionLabel(optimisticDevuelto, loanType)}
            </Badge>
          </button>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p>{devueltoTooltip}</p>
        </TooltipContent>
      </Tooltip>
    </div>
  )
}
