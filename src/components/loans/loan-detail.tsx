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
  getUnitTypeLabel,
} from "@/lib/constants"
import { LoanEditDialog } from "@/components/loans/loan-edit-dialog"
import { ReturnDialog } from "@/components/loans/return-dialog"
import { updateLoanNotes, toggleFarmatools, toggleDevuelto } from "@/actions/loan-actions"
import { toast } from "sonner"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import {
  FileDown,
  Pencil,
  Check,
  Save,
  Building2,
  Pill,
  Calendar,
  Mail,
  User,
  X,
  Loader2,
  ChevronRight,
  MousePointerClick,
  RotateCcw,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { LoanWithRelations, Hospital, Medication } from "@/types"

interface LoanDetailProps {
  loan: LoanWithRelations
  hospitals: Hospital[]
  medications: Medication[]
}

export function LoanDetail({ loan, hospitals, medications }: LoanDetailProps) {
  const [notes, setNotes] = useState(loan.notes || "")
  const [editOpen, setEditOpen] = useState(false)
  const [returnOpen, setReturnOpen] = useState(false)
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
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-sm text-gray-500">
        <Link href="/prestamos" className="hover:text-gray-900 transition-colors">
          Préstamos
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-gray-900 font-medium">{loan.referenceNumber}</span>
      </nav>

      {/* Header */}
      <div className="flex items-start justify-between">
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
            {format(new Date(loan.createdAt), "dd 'de' MMMM 'de' yyyy, HH:mm", {
              locale: es,
            })}
          </p>
        </div>
        <div className="flex gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" onClick={() => setEditOpen(true)}>
                <Pencil className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Editar préstamo</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link href={`/api/pdf/${loan.id}`} target="_blank">
                <Button variant="outline" size="icon">
                  <FileDown className="h-4 w-4" />
                </Button>
              </Link>
            </TooltipTrigger>
            <TooltipContent>Descargar PDF del préstamo</TooltipContent>
          </Tooltip>
          {!loan.devuelto && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setReturnOpen(true)}
                  className="border-green-300 text-green-700 hover:bg-green-50"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Gestionar devolución</TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>

      {/* Status Cards - Clickable Toggle */}
      <div className="grid gap-4 md:grid-cols-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Card
              className={cn(
                "cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.01] active:scale-[0.99] group",
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
                    <p className="text-xs text-gray-400 mt-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <MousePointerClick className="h-3 w-3" />
                      Click para cambiar estado
                    </p>
                  </div>
                  <div
                    className={cn(
                      "flex h-12 w-12 items-center justify-center rounded-full transition-colors duration-200",
                      optimisticFarmatools
                        ? "bg-teal-100 text-teal-600"
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
                "cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.01] active:scale-[0.99] group",
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
                    <p className="text-xs text-gray-400 mt-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <MousePointerClick className="h-3 w-3" />
                      Click para cambiar estado
                    </p>
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
              <div className="w-full">
                <p className="text-sm font-medium text-gray-500 mb-2">Medicamentos</p>
                <div className="space-y-2">
                  {loan.items.map((item) => {
                    const returned = item.unitsReturned ?? 0
                    const pending = item.units - returned
                    const isFullyReturned = returned >= item.units
                    return (
                      <div
                        key={item.id}
                        className={`flex items-center justify-between rounded border p-2 ${
                          isFullyReturned ? "border-green-200 bg-green-50" : ""
                        }`}
                      >
                        <div>
                          <p className="font-medium">{item.medication.name}</p>
                          {item.medication.activeIngredient && (
                            <p className="text-sm text-gray-500">{item.medication.activeIngredient}</p>
                          )}
                          {item.medication.presentation && (
                            <p className="text-sm text-gray-500">{item.medication.presentation}</p>
                          )}
                          {returned > 0 && (
                            <p className={`text-xs mt-1 font-medium ${isFullyReturned ? "text-green-600" : "text-orange-600"}`}>
                              {isFullyReturned
                                ? `✓ Devuelto completo (${returned} ${getUnitTypeLabel(item.unitType)})`
                                : `Devueltas: ${returned} · Pendientes: ${pending} ${getUnitTypeLabel(item.unitType)}`}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold">{item.units}</p>
                          <p className="text-xs text-gray-500">{getUnitTypeLabel(item.unitType)}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
                {loan.items.length > 1 && (() => {
                  const totalByType: Record<string, number> = {}
                  for (const item of loan.items) {
                    const label = getUnitTypeLabel(item.unitType)
                    totalByType[label] = (totalByType[label] || 0) + item.units
                  }
                  const parts = Object.entries(totalByType).map(([label, total]) => (
                    <span key={label}><span className="font-bold text-lg">{total}</span> {label}</span>
                  ))
                  return (
                    <div className="mt-2 text-right">
                      <p className="text-sm text-gray-500 flex items-center justify-end gap-2">
                        Total: {parts}
                      </p>
                    </div>
                  )
                })()}
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
            {loan.pharmacistName && (
              <>
                <Separator />
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Farmacéutico responsable
                    </p>
                    <p>{loan.pharmacistName}</p>
                  </div>
                </div>
              </>
            )}
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

      <LoanEditDialog
        loan={loan}
        hospitals={hospitals}
        medications={medications}
        open={editOpen}
        onOpenChange={setEditOpen}
      />

      <ReturnDialog
        open={returnOpen}
        onOpenChange={setReturnOpen}
        loanId={loan.id}
        items={loan.items}
      />
    </div>
  )
}
