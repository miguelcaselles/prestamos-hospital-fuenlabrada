"use client"

import { useState, useTransition } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/shared/data-table"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Pencil, Trash2, Plus } from "lucide-react"
import { MedicationForm } from "./medication-form"
import { deleteMedication } from "@/actions/medication-actions"
import { toast } from "sonner"
import type { Medication } from "@/types"

interface MedicationTableProps {
  medications: Medication[]
}

export function MedicationTable({ medications }: MedicationTableProps) {
  const [formOpen, setFormOpen] = useState(false)
  const [editingMedication, setEditingMedication] =
    useState<Medication | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [medicationToDelete, setMedicationToDelete] = useState<Medication | null>(null)
  const [isDeleting, startDelete] = useTransition()

  const handleEdit = (medication: Medication) => {
    setEditingMedication(medication)
    setFormOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (!medicationToDelete) return
    startDelete(async () => {
      try {
        await deleteMedication(medicationToDelete.id)
        toast.success("Medicamento eliminado")
        setDeleteDialogOpen(false)
        setMedicationToDelete(null)
      } catch {
        toast.error("Error al eliminar el medicamento")
      }
    })
  }

  const columns: ColumnDef<Medication>[] = [
    {
      accessorKey: "name",
      header: "Nombre",
      cell: ({ row }) => (
        <span className="font-medium">{row.getValue("name")}</span>
      ),
    },
    {
      accessorKey: "nationalCode",
      header: "Código Nacional",
      cell: ({ row }) => (
        <span className="text-gray-600">
          {row.getValue("nationalCode") || "-"}
        </span>
      ),
    },
    {
      accessorKey: "presentation",
      header: "Presentación",
      cell: ({ row }) => (
        <span className="text-gray-600">
          {row.getValue("presentation") || "-"}
        </span>
      ),
    },
    {
      accessorKey: "activeIngredient",
      header: "Principio Activo",
      cell: ({ row }) => (
        <span className="text-gray-600">
          {row.getValue("activeIngredient") || "-"}
        </span>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const medication = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleEdit(medication)}>
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-600"
                onClick={() => {
                  setMedicationToDelete(medication)
                  setDeleteDialogOpen(true)
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Medicamentos</h1>
          <p className="text-sm text-gray-500 mt-1">
            Gestión del catálogo de medicamentos
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingMedication(null)
            setFormOpen(true)
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Medicamento
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={medications}
        searchKey="name"
        searchPlaceholder="Buscar medicamento..."
      />

      <MedicationForm
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open)
          if (!open) setEditingMedication(null)
        }}
        medication={editingMedication}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Eliminar medicamento"
        description={`¿Estás seguro de que quieres eliminar "${medicationToDelete?.name}"? El medicamento se marcará como inactivo y no aparecerá en los listados.`}
        loading={isDeleting}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  )
}
