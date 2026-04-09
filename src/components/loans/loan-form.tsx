"use client"

import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { loanFormSchema, LoanFormValues } from "@/lib/validators"
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
import { Card, CardContent } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Combobox } from "@/components/shared/combobox"
import { MedicationSearch } from "@/components/loans/medication-search"
import { createLoan } from "@/actions/loan-actions"
import { createMedicationQuick } from "@/actions/medication-actions"
import { toast } from "sonner"
import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { ArrowDownLeft, ArrowUpRight, Loader2, Mail, Plus, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Hospital, Medication } from "@/types"

interface LoanFormProps {
  hospitals: Hospital[]
  medications: Medication[]
}

export function LoanForm({ hospitals, medications }: LoanFormProps) {
  const [isPending, startTransition] = useTransition()
  const [isCreatingMed, setIsCreatingMed] = useState(false)
  const [localMedications, setLocalMedications] = useState(medications)
  const router = useRouter()

  const form = useForm<LoanFormValues>({
    resolver: zodResolver(loanFormSchema),
    defaultValues: {
      type: undefined,
      hospitalId: "",
      items: [{ medicationId: "", units: 1, unitType: "UNIDADES" as const }],
      emailSentTo: "",
      pharmacistName: "",
      notes: "",
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  })

  const selectedHospitalId = form.watch("hospitalId")

  // Auto-fill email from selected hospital
  const selectedHospital = hospitals.find((h) => h.id === selectedHospitalId)
  const handleHospitalChange = (hospitalId: string) => {
    form.setValue("hospitalId", hospitalId)
    const hospital = hospitals.find((h) => h.id === hospitalId)
    if (hospital?.email && !form.getValues("emailSentTo")) {
      form.setValue("emailSentTo", hospital.email)
    }
  }

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

  function onSubmit(data: LoanFormValues) {
    startTransition(async () => {
      try {
        const result = await createLoan(data)
        toast.success(
          `Préstamo creado correctamente. Referencia: ${result.referenceNumber}`
        )
        router.push(`/prestamos/${result.id}`)
      } catch {
        toast.error("Error al crear el préstamo")
      }
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Loan Type Selection */}
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold">
                Tipo de Préstamo
              </FormLabel>
              <FormControl>
                <div className="grid gap-4 md:grid-cols-2">
                  <Card
                    className={cn(
                      "cursor-pointer transition-all hover:border-teal-300",
                      field.value === "SOLICITADO"
                        ? "border-teal-500 bg-teal-50 ring-2 ring-teal-500"
                        : "border-gray-200"
                    )}
                    onClick={() => field.onChange("SOLICITADO")}
                  >
                    <CardContent className="flex items-center gap-4 p-4">
                      <div
                        className={cn(
                          "rounded-lg p-3",
                          field.value === "SOLICITADO"
                            ? "bg-teal-100"
                            : "bg-gray-100"
                        )}
                      >
                        <ArrowDownLeft
                          className={cn(
                            "h-6 w-6",
                            field.value === "SOLICITADO"
                              ? "text-teal-600"
                              : "text-gray-400"
                          )}
                        />
                      </div>
                      <div>
                        <p className="font-semibold">Solicitamos préstamo</p>
                        <p className="text-sm text-gray-500">
                          Pedimos medicación a otro hospital
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                          <Mail className="h-3 w-3 text-teal-500" />
                          <span className="text-xs text-teal-600">
                            Se enviará email automáticamente
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card
                    className={cn(
                      "cursor-pointer transition-all hover:border-teal-300",
                      field.value === "PRESTADO"
                        ? "border-teal-500 bg-teal-50 ring-2 ring-teal-500"
                        : "border-gray-200"
                    )}
                    onClick={() => field.onChange("PRESTADO")}
                  >
                    <CardContent className="flex items-center gap-4 p-4">
                      <div
                        className={cn(
                          "rounded-lg p-3",
                          field.value === "PRESTADO"
                            ? "bg-teal-100"
                            : "bg-gray-100"
                        )}
                      >
                        <ArrowUpRight
                          className={cn(
                            "h-6 w-6",
                            field.value === "PRESTADO"
                              ? "text-teal-600"
                              : "text-gray-400"
                          )}
                        />
                      </div>
                      <div>
                        <p className="font-semibold">Nos solicitan préstamo</p>
                        <p className="text-sm text-gray-500">
                          Otro hospital nos pide medicación
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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
                  onValueChange={handleHospitalChange}
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
                    <FormItem className="w-32 shrink-0">
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
              {selectedHospital?.email && (
                <p className="text-xs text-gray-500">
                  Email del hospital: {selectedHospital.email}
                </p>
              )}
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
        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creando préstamo...
              </>
            ) : (
              "Crear Préstamo"
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}
