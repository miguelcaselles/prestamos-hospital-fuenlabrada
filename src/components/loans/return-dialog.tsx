"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { FileDown, Loader2, RotateCcw } from "lucide-react"
import { getUnitTypeLabel } from "@/lib/constants"
import type { LoanItemWithMedication } from "@/types"

interface ReturnDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  loanId: string
  items: LoanItemWithMedication[]
}

interface ItemState {
  selected: boolean
  unitsToReturn: number
}

export function ReturnDialog({ open, onOpenChange, loanId, items }: ReturnDialogProps) {
  const router = useRouter()

  // Only show items that still have units to return
  const returnableItems = items.filter((i) => i.unitsReturned < i.units)

  const initialState = (): Record<string, ItemState> => {
    const s: Record<string, ItemState> = {}
    for (const item of returnableItems) {
      const pending = item.units - item.unitsReturned
      s[item.id] = { selected: true, unitsToReturn: pending }
    }
    return s
  }

  const [itemStates, setItemStates] = useState<Record<string, ItemState>>(initialState)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const toggleSelected = (id: string) => {
    setItemStates((prev) => ({
      ...prev,
      [id]: { ...prev[id], selected: !prev[id].selected },
    }))
  }

  const setUnits = (id: string, value: number) => {
    const item = returnableItems.find((i) => i.id === id)!
    const max = item.units - item.unitsReturned
    setItemStates((prev) => ({
      ...prev,
      [id]: { ...prev[id], unitsToReturn: Math.max(1, Math.min(max, value)) },
    }))
  }

  const selectedItems = returnableItems.filter((i) => itemStates[i.id]?.selected)

  const buildPayload = (save: boolean) => ({
    items: selectedItems.map((i) => ({
      loanItemId: i.id,
      unitsToReturn: itemStates[i.id].unitsToReturn,
    })),
    save,
  })

  const handleGenerate = async (save: boolean) => {
    if (selectedItems.length === 0) {
      toast.error("Selecciona al menos un medicamento")
      return
    }

    if (save) {
      setIsSaving(true)
    } else {
      setIsGenerating(true)
    }

    try {
      const res = await fetch(`/api/pdf/devolucion/${loanId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload(save)),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Error desconocido" }))
        throw new Error(err.error || "Error al generar el PDF")
      }

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      const cd = res.headers.get("Content-Disposition") ?? ""
      const match = cd.match(/filename="(.+)"/)
      a.download = match?.[1] ?? "devolucion.pdf"
      a.click()
      URL.revokeObjectURL(url)

      if (save) {
        toast.success("Devolución registrada y PDF generado")
        onOpenChange(false)
        router.refresh()
      } else {
        toast.success("PDF de devolución generado")
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al generar el PDF")
    } finally {
      setIsGenerating(false)
      setIsSaving(false)
    }
  }

  // Reset state when dialog opens
  const handleOpenChange = (val: boolean) => {
    if (val) setItemStates(initialState())
    onOpenChange(val)
  }

  if (returnableItems.length === 0) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Devolución de préstamo</DialogTitle>
            <DialogDescription>Todos los materiales ya han sido devueltos.</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RotateCcw className="h-5 w-5 text-green-600" />
            Gestionar devolución
          </DialogTitle>
          <DialogDescription>
            Selecciona qué medicamentos devuelves y cuántas unidades.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 mt-2">
          {returnableItems.map((item) => {
            const state = itemStates[item.id]
            const pending = item.units - item.unitsReturned
            const afterReturn = pending - (state?.unitsToReturn ?? 0)
            const unitLabel = getUnitTypeLabel(item.unitType)

            return (
              <div
                key={item.id}
                className={`rounded-lg border p-3 transition-colors ${
                  state?.selected
                    ? "border-green-300 bg-green-50"
                    : "border-gray-200 bg-gray-50 opacity-60"
                }`}
              >
                <div className="flex items-start gap-3">
                  <Checkbox
                    id={`check-${item.id}`}
                    checked={state?.selected ?? false}
                    onCheckedChange={() => toggleSelected(item.id)}
                    className="mt-0.5"
                  />
                  <div className="flex-1 min-w-0">
                    <label
                      htmlFor={`check-${item.id}`}
                      className="font-medium text-sm cursor-pointer"
                    >
                      {item.medication.name}
                    </label>
                    {item.medication.activeIngredient && (
                      <p className="text-xs text-gray-500">{item.medication.activeIngredient}</p>
                    )}
                    {item.medication.presentation && (
                      <p className="text-xs text-gray-400">{item.medication.presentation}</p>
                    )}

                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        Prestadas: {item.units} {unitLabel}
                      </Badge>
                      {item.unitsReturned > 0 && (
                        <Badge variant="outline" className="text-xs text-green-600 border-green-300">
                          Ya devueltas: {item.unitsReturned} {unitLabel}
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-xs text-orange-600 border-orange-300">
                        Pendientes: {pending} {unitLabel}
                      </Badge>
                    </div>

                    {state?.selected && (
                      <div className="flex items-center gap-3 mt-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">Devuelve ahora:</span>
                          <Input
                            type="number"
                            min={1}
                            max={pending}
                            value={state.unitsToReturn}
                            onChange={(e) => setUnits(item.id, parseInt(e.target.value) || 1)}
                            className="w-20 h-8 text-sm"
                          />
                          <span className="text-sm text-gray-500">{unitLabel}</span>
                        </div>
                        {afterReturn > 0 && (
                          <span className="text-xs text-orange-600">
                            Quedarán pendientes: {afterReturn} {unitLabel}
                          </span>
                        )}
                        {afterReturn <= 0 && (
                          <span className="text-xs text-green-600 font-medium">
                            ✓ Completo
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Summary */}
        {selectedItems.length > 0 && (
          <div className="rounded-md bg-gray-50 border p-3 text-sm text-gray-600 space-y-1">
            <p className="font-medium text-gray-800">Resumen de devolución:</p>
            {selectedItems.map((i) => {
              const s = itemStates[i.id]
              const unit = getUnitTypeLabel(i.unitType)
              return (
                <p key={i.id}>
                  · {i.medication.name}: <strong>{s.unitsToReturn} {unit}</strong>
                </p>
              )
            })}
          </div>
        )}

        <div className="flex gap-2 mt-2 justify-end">
          <Button
            variant="outline"
            onClick={() => handleGenerate(false)}
            disabled={isGenerating || isSaving || selectedItems.length === 0}
          >
            {isGenerating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <FileDown className="mr-2 h-4 w-4" />
            )}
            Solo PDF (sin guardar)
          </Button>
          <Button
            className="bg-green-600 hover:bg-green-700"
            onClick={() => handleGenerate(true)}
            disabled={isGenerating || isSaving || selectedItems.length === 0}
          >
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RotateCcw className="mr-2 h-4 w-4" />
            )}
            Registrar y generar PDF
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
