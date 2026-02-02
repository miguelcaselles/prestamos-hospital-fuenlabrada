"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  LOAN_TYPE_LABELS,
  getFarmatoolsLabel,
  getFarmatoolsColor,
  getDevolucionLabel,
  getDevolucionColor,
} from "@/lib/constants"
import { updateLoanNotes, toggleFarmatools, toggleDevuelto } from "@/actions/loan-actions"
import { toast } from "sonner"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import {
  ArrowLeft,
  FileDown,
  Check,
  Save,
  Building2,
  Pill,
  Hash,
  Calendar,
  Mail,
  X,
  Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { LoanWithRelations } from "@/types"

interface LoanDetailProps {
  loan: LoanWithRelations
}

export function LoanDetail({ loan }: LoanDetailProps) {
  const [notes, setNotes] = useState(loan.notes || "")
  const [isSavingNotes, startSaveNotes] = useTransition()
  const [optimisticFarmatools, setOptimisticFarmatools] = useState(loan.farmatoolsGestionado)
  const [optimisticDevuelto, setOptimisticDevuelto] = useState(loan.devuelto)
  const [isFarmatoolsPending, startFarmatoolsTransition] = useTransition()
  const [isDevueltoPending, startDevueltoTransition] = useTransition()

  const handleToggleFarmatools = () => {
    const newValue = !optimisticFarmatools
    setOptimisticFarmatools(newValue)
    startFarmatoolsTransition(async () => {
      try {
        await toggleFarmatools(loan.id, newValue)
        toast.success(getFarmatoolsLabel(newValue), { duration: 2000 })
      } catch {
        setOptimisticFarmatools(!newValue)
        toast.error("Error al actualizar")
      }
    })
  }

  const handleToggleDevuelto = () => {
    const newValue = !optimisticDevuelto
    setOptimisticDevuelto(newValue)
    startDevueltoTransition(async () => {
      try {
        await toggleDevuelto(loan.id, newValue)
        toast.success(getDevolucionLabel(newValue, loan.type), { duration: 2000 })
      } catch {
        setOptimisticDevuelto(!newValue)
        toast.error("Error al actualizar")
      }
    })
  }

  const handleSaveNotes = () => {
    startSaveNotes(async () => {
      try {
        await updateLoanNotes(loan.id, notes)
        toast.success("Observaciones guardadas")
      } catch {
        toast.error("Error al guardar las observaciones")
      }
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Link href="/prestamos">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">
                {loan.referenceNumber}
              </h1>
              <Badge
                variant="outline"
                className={
                  loan.type === "SOLICITADO"
                    ? "bg-purple-50 text-purple-700 border-purple-200"
                    : "bg-teal-50 text-teal-700 border-teal-200"
                }
              >
                {LOAN_TYPE_LABELS[loan.type]}
              </Badge>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Creado el{" "}
              {format(new Date(loan.createdAt), "dd 'de' MMMM 'de' yyyy", {
                locale: es,
              })}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/api/pdf/${loan.id}`} target="_blank">
            <Button variant="outline">
              <FileDown className="mr-2 h-4 w-4" />
              Descargar PDF
            </Button>
          </Link>
        </div>
      </div>

      {/* Status Cards - Clickable Toggle */}
      <div className="grid gap-4 md:grid-cols-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Card
              className={cn(
                "cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.01] active:scale-[0.99]",
                isFarmatoolsPending && "opacity-70"
              )}
              onClick={handleToggleFarmatools}
            >
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-2">
                      Farmatools
                    </p>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-sm px-3 py-1 transition-colors duration-200",
                        getFarmatoolsColor(optimisticFarmatools)
                      )}
                    >
                      {isFarmatoolsPending && (
                        <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                      )}
                      {getFarmatoolsLabel(optimisticFarmatools)}
                    </Badge>
                  </div>
                  <div
                    className={cn(
                      "flex h-12 w-12 items-center justify-center rounded-full transition-colors duration-200",
                      optimisticFarmatools
                        ? "bg-blue-100 text-blue-600"
                        : "bg-yellow-100 text-yellow-600"
                    )}
                  >
                    {optimisticFarmatools ? (
                      <Check className="h-6 w-6" />
                    ) : (
                      <X className="h-6 w-6" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TooltipTrigger>
          <TooltipContent>
            <p>
              {optimisticFarmatools
                ? "Click: marcar como pendiente de gestionar"
                : "Click: marcar como gestionado"}
            </p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Card
              className={cn(
                "cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.01] active:scale-[0.99]",
                isDevueltoPending && "opacity-70"
              )}
              onClick={handleToggleDevuelto}
            >
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-2">
                      Devolución
                    </p>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-sm px-3 py-1 transition-colors duration-200",
                        getDevolucionColor(optimisticDevuelto)
                      )}
                    >
                      {isDevueltoPending && (
                        <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                      )}
                      {getDevolucionLabel(optimisticDevuelto, loan.type)}
                    </Badge>
                  </div>
                  <div
                    className={cn(
                      "flex h-12 w-12 items-center justify-center rounded-full transition-colors duration-200",
                      optimisticDevuelto
                        ? "bg-green-100 text-green-600"
                        : "bg-orange-100 text-orange-600"
                    )}
                  >
                    {optimisticDevuelto ? (
                      <Check className="h-6 w-6" />
                    ) : (
                      <X className="h-6 w-6" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TooltipTrigger>
          <TooltipContent>
            <p>
              {optimisticDevuelto
                ? "Click: marcar como pendiente"
                : "Click: marcar como devuelto"}
            </p>
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Details */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Datos del Préstamo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <Building2 className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-500">Hospital</p>
                <p className="font-medium">{loan.hospital.name}</p>
              </div>
            </div>
            <Separator />
            <div className="flex items-start gap-3">
              <Pill className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-500">Medicamento</p>
                <p className="font-medium">{loan.medication.name}</p>
                {loan.medication.activeIngredient && (
                  <p className="text-sm text-gray-500">
                    {loan.medication.activeIngredient}
                  </p>
                )}
                {loan.medication.presentation && (
                  <p className="text-sm text-gray-500">
                    {loan.medication.presentation}
                  </p>
                )}
              </div>
            </div>
            <Separator />
            <div className="flex items-start gap-3">
              <Hash className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-500">Unidades</p>
                <p className="text-2xl font-bold">{loan.units}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Información Adicional</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Fecha de creación
                </p>
                <p>
                  {format(
                    new Date(loan.createdAt),
                    "dd/MM/yyyy 'a las' HH:mm",
                    { locale: es }
                  )}
                </p>
              </div>
            </div>
            <Separator />
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Última actualización
                </p>
                <p>
                  {format(
                    new Date(loan.updatedAt),
                    "dd/MM/yyyy 'a las' HH:mm",
                    { locale: es }
                  )}
                </p>
              </div>
            </div>
            <Separator />
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Email de envío
                </p>
                <p>{loan.emailSentTo || "No enviado"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Observaciones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Añadir observaciones sobre este préstamo..."
              rows={4}
            />
            <div className="flex justify-end">
              <Button
                onClick={handleSaveNotes}
                disabled={isSavingNotes}
                size="sm"
              >
                <Save className="mr-2 h-4 w-4" />
                {isSavingNotes ? "Guardando..." : "Guardar Observaciones"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

    </div>
  )
}
