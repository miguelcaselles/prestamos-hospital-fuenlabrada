"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { hospitalFormSchema, HospitalFormValues } from "@/lib/validators"
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
import { createHospital, updateHospital } from "@/actions/hospital-actions"
import { toast } from "sonner"
import { useTransition } from "react"
import type { Hospital } from "@/types"

interface HospitalFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  hospital?: Hospital | null
}

export function HospitalForm({
  open,
  onOpenChange,
  hospital,
}: HospitalFormProps) {
  const [isPending, startTransition] = useTransition()
  const isEditing = !!hospital

  const form = useForm<HospitalFormValues>({
    resolver: zodResolver(hospitalFormSchema),
    defaultValues: {
      name: hospital?.name ?? "",
      email: hospital?.email ?? "",
      address: hospital?.address ?? "",
      phone: hospital?.phone ?? "",
    },
  })

  function onSubmit(data: HospitalFormValues) {
    startTransition(async () => {
      try {
        if (isEditing && hospital) {
          await updateHospital(hospital.id, data)
          toast.success("Hospital actualizado correctamente")
        } else {
          await createHospital(data)
          toast.success("Hospital creado correctamente")
        }
        form.reset()
        onOpenChange(false)
      } catch {
        toast.error("Error al guardar el hospital")
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Hospital" : "Nuevo Hospital"}
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
                    <Input placeholder="Hospital..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
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
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Teléfono</FormLabel>
                  <FormControl>
                    <Input placeholder="91 XXX XX XX" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dirección</FormLabel>
                  <FormControl>
                    <Input placeholder="Dirección del hospital" {...field} />
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
                {isPending ? "Guardando..." : isEditing ? "Actualizar" : "Crear"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
