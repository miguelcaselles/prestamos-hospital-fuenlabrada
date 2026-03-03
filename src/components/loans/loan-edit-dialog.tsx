"use client"

import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { loanEditSchema, LoanEditValues } from "@/lib/validators"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Combobox } from "@/components/shared/combobox"
import { MedicationSearch } from "@/components/loans/medication-search"
import { updateLoan } from "@/actions/loan-actions"
import { createMedicationQuick } from "@/actions/medication-actions"
import { toast } from "sonner"
import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Plus, Trash2 } from "lucide-react"
import type { Hospital, Medication, LoanWithRelations } from "@/types"

interface LoanEditDialogProps {
  loan: LoanWithRelations
  hospitals: Hospital[]
  medications: Medication[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function LoanEditDialog({
  loan,
  hospitals,
  medications,
  open,
  onOpenChange,
}: LoanEditDialogProps) {
  const [isPending, startTransition] = useTransition()
  const [isCreatingMed, setIsCreatingMed] = useState(false)
  const [localMedications, setLocalMedications] = useState(medications)
  const router = useRouter()

  const form = useForm<LoanEditValues>({
    resolver: zodResolver(loanEditSchema),
    defaultValues: {
      hospitalId: loan.hospitalId,
      items: loan.items.map((item) => ({
        medicationId: item.medicationId,
        units: item.units,
        unitType: item.unitType as "UNIDADES" | "CAJAS",
      })),
      emailSentTo: loan.emailSentTo || "",
      pharmacistName: loan.pharmacistName || "",
      notes: loan.notes || "",
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  })

  const hospitalOptions = hospitals.map((h) => ({
    value: h.id,
    label: h.name,
    description: h.email || undefined,
  }))

  const handleCreateMedication = async (name: string, index: number) => {
    setIsCreatingMed(true)
    try {
      const newMed = await createMedicationQuick(name)
      setLocalMedications((prev) => [...prev, newMed])
      form.setValue(`items.${index}.medicationId`, newMed.id)
      toast.success(`Medicamento "${name}" creado`)
    } catch {
      toast.error("Error al crear el medicamento")
    } finally {
      setIsCreatingMed(false)
    }
  }

  const handleMedicationCreated = (med: Medication) => {
    setLocalMedications((prev) => [...prev, med])
  }

  function onSubmit(data: LoanEditValues) {
    startTransition(async () => {
      try {
        await updateLoan(loan.id, data)
        toast.success("Préstamo actualizado correctamente")
        onOpenChange(false)
        router.refresh()
      } catch {
        toast.error("Error al actualizar el préstamo")
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Préstamo {loan.referenceNumber}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {/* Hospital */}
            <FormField
              control={form.control}
              name="hospitalId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hospital</FormLabel>
                  <FormControl>
                    <Combobox
                      options={hospitalOptions}
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder="Seleccionar hospital..."
                      searchPlaceholder="Buscar hospital..."
                      emptyMessage="No se encontraron hospitales."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Medications */}
            <div className="space-y-3">
              <FormLabel className="text-base font-semibold">Medicamentos</FormLabel>
              {fields.map((field, index) => (
                <div key={field.id} className="flex gap-3 items-start">
                  <FormField
                    control={form.control}
                    name={`items.${index}.medicationId`}
                    render={({ field: medField }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <MedicationSearch
                            medications={localMedications}
                            value={medField.value}
                            onValueChange={medField.onChange}
                            onMedicationCreated={handleMedicationCreated}
                            onCreateManual={(name) => handleCreateMedication(name, index)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`items.${index}.units`}
                    render={({ field: unitsField }) => (
                      <FormItem className="w-24">
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            placeholder="Cant."
                            {...unitsField}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`items.${index}.unitType`}
                    render={({ field: unitTypeField }) => (
                      <FormItem className="w-28">
                        <Select
                          value={unitTypeField.value}
                          onValueChange={unitTypeField.onChange}
                        >
                          <FormControl>
                            <SelectTrigger size="sm">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="UNIDADES">Uds.</SelectItem>
                            <SelectItem value="CAJAS">Cajas</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="mt-0.5 shrink-0"
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  )}
                </div>
              ))}
              {isCreatingMed && (
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Creando medicamento...
                </p>
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ medicationId: "", units: 1, unitType: "UNIDADES" })}
              >
                <Plus className="mr-2 h-4 w-4" />
                Añadir medicamento
              </Button>
              {form.formState.errors.items?.message && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.items.message}
                </p>
              )}
            </div>

            {/* Email */}
            <FormField
              control={form.control}
              name="emailSentTo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email de destino</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="farmacia@hospital.es"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Pharmacist Name */}
            <FormField
              control={form.control}
              name="pharmacistName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Farmacéutico responsable (opcional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nombre del farmacéutico"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observaciones (opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Notas adicionales sobre el préstamo..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit */}
            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  "Guardar Cambios"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
