"use client"

import { useForm } from "react-hook-form"
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
import { Combobox } from "@/components/shared/combobox"
import { createLoan } from "@/actions/loan-actions"
import { toast } from "sonner"
import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { ArrowDownLeft, ArrowUpRight, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Hospital, Medication } from "@/types"

interface LoanFormProps {
  hospitals: Hospital[]
  medications: Medication[]
}

export function LoanForm({ hospitals, medications }: LoanFormProps) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const form = useForm<LoanFormValues>({
    resolver: zodResolver(loanFormSchema),
    defaultValues: {
      type: undefined,
      hospitalId: "",
      medicationId: "",
      units: 1,
      emailSentTo: "",
      notes: "",
    },
  })

  const selectedType = form.watch("type")
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

  const medicationOptions = medications.map((m) => ({
    value: m.id,
    label: m.name,
    description: m.activeIngredient
      ? `${m.activeIngredient}${m.presentation ? ` - ${m.presentation}` : ""}`
      : m.presentation || undefined,
  }))

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
                      "cursor-pointer transition-all hover:border-blue-300",
                      field.value === "SOLICITADO"
                        ? "border-blue-500 bg-blue-50 ring-2 ring-blue-500"
                        : "border-gray-200"
                    )}
                    onClick={() => field.onChange("SOLICITADO")}
                  >
                    <CardContent className="flex items-center gap-4 p-4">
                      <div
                        className={cn(
                          "rounded-lg p-3",
                          field.value === "SOLICITADO"
                            ? "bg-blue-100"
                            : "bg-gray-100"
                        )}
                      >
                        <ArrowDownLeft
                          className={cn(
                            "h-6 w-6",
                            field.value === "SOLICITADO"
                              ? "text-blue-600"
                              : "text-gray-400"
                          )}
                        />
                      </div>
                      <div>
                        <p className="font-semibold">Solicitamos préstamo</p>
                        <p className="text-sm text-gray-500">
                          Solicitamos medicación a otro hospital
                        </p>
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
                          Otro hospital nos solicita medicación
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

        {/* Medication */}
        <FormField
          control={form.control}
          name="medicationId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Medicamento</FormLabel>
              <FormControl>
                <Combobox
                  options={medicationOptions}
                  value={field.value}
                  onValueChange={field.onChange}
                  placeholder="Seleccionar medicamento..."
                  searchPlaceholder="Buscar medicamento..."
                  emptyMessage="No se encontraron medicamentos."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Units */}
        <FormField
          control={form.control}
          name="units"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Unidades</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={1}
                  placeholder="Número de unidades"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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
