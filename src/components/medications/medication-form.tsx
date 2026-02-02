"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { medicationFormSchema, MedicationFormValues } from "@/lib/validators"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  createMedication,
  updateMedication,
} from "@/actions/medication-actions"
import { toast } from "sonner"
import { useTransition } from "react"
import type { Medication } from "@/types"

interface MedicationFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  medication?: Medication | null
}

export function MedicationForm({
  open,
  onOpenChange,
  medication,
}: MedicationFormProps) {
  const [isPending, startTransition] = useTransition()
  const isEditing = !!medication

  const form = useForm<MedicationFormValues>({
    resolver: zodResolver(medicationFormSchema),
    defaultValues: {
      name: medication?.name ?? "",
      nationalCode: medication?.nationalCode ?? "",
      presentation: medication?.presentation ?? "",
      activeIngredient: medication?.activeIngredient ?? "",
    },
  })

  function onSubmit(data: MedicationFormValues) {
    startTransition(async () => {
      try {
        if (isEditing && medication) {
          await updateMedication(medication.id, data)
          toast.success("Medicamento actualizado correctamente")
        } else {
          await createMedication(data)
          toast.success("Medicamento creado correctamente")
        }
        form.reset()
        onOpenChange(false)
      } catch {
        toast.error("Error al guardar el medicamento")
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Medicamento" : "Nuevo Medicamento"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder="Nombre del medicamento" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="nationalCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Código Nacional</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: 712345" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="presentation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Presentación</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ej: 500mg 30 comprimidos"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="activeIngredient"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Principio Activo</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Paracetamol" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending
                  ? "Guardando..."
                  : isEditing
                    ? "Actualizar"
                    : "Crear"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
