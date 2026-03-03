"use client"

import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { loanEditSchema, LoanEditValues } from "@/lib/validators"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
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
import { LOAN_TYPE_LABELS } from "@/lib/constants"
import { toast } from "sonner"
import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Plus, Trash2, Building2, Pill, Mail, User, StickyNote } from "lucide-react"
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
      <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <DialogTitle className="text-xl">
              Editar Préstamo
            </DialogTitle>
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
          <DialogDescription>
            {loan.referenceNumber} &middot; {loan.hospital.name}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Hospital Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Building2 className="h-4 w-4 text-gray-400" />
                Hospital
              </div>
              <FormField
                control={form.control}
                name="hospitalId"
                render={({ field }) => (
                  <FormItem>
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
            </div>

            <Separator />

            {/* Medications Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Pill className="h-4 w-4 text-gray-400" />
                Medicamentos
              </div>
              <div className="space-y-2">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="rounded-lg border border-gray-200 bg-gray-50/50 p-3 space-y-2"
                  >
                    <FormField
                      control={form.control}
                      name={`items.${index}.medicationId`}
                      render={({ field: medField }) => (
                        <FormItem>
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
                    <div className="flex items-center gap-2">
                      <FormField
                        control={form.control}
                        name={`items.${index}.units`}
                        render={({ field: unitsField }) => (
                          <FormItem className="flex-1">
                            <FormControl>
                              <Input
                                type="number"
                                min={1}
                                placeholder="Cantidad"
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
                          <FormItem className="w-32">
                            <Select
                              value={unitTypeField.value}
                              onValueChange={unitTypeField.onChange}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="UNIDADES">Unidades</SelectItem>
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
                          className="shrink-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => remove(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
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
                className="w-full border-dashed"
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

            <Separator />

            {/* Contact Info Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Mail className="h-4 w-4 text-gray-400" />
                Información de contacto
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="emailSentTo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs text-gray-500">Email de destino</FormLabel>
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
                <FormField
                  control={form.control}
                  name="pharmacistName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs text-gray-500">Farmacéutico responsable</FormLabel>
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
              </div>
            </div>

            <Separator />

            {/* Notes Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <StickyNote className="h-4 w-4 text-gray-400" />
                Observaciones
              </div>
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
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
            </div>

            {/* Submit */}
            <div className="flex justify-end gap-3 pt-2 border-t">
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
