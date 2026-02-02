"use client"

import { useState } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/shared/data-table"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Pencil, Trash2, Plus } from "lucide-react"
import { HospitalForm } from "./hospital-form"
import { deleteHospital } from "@/actions/hospital-actions"
import { toast } from "sonner"
import type { Hospital } from "@/types"

interface HospitalTableProps {
  hospitals: Hospital[]
}

export function HospitalTable({ hospitals }: HospitalTableProps) {
  const [formOpen, setFormOpen] = useState(false)
  const [editingHospital, setEditingHospital] = useState<Hospital | null>(null)

  const handleEdit = (hospital: Hospital) => {
    setEditingHospital(hospital)
    setFormOpen(true)
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteHospital(id)
      toast.success("Hospital eliminado")
    } catch {
      toast.error("Error al eliminar el hospital")
    }
  }

  const columns: ColumnDef<Hospital>[] = [
    {
      accessorKey: "name",
      header: "Nombre",
      cell: ({ row }) => (
        <span className="font-medium">{row.getValue("name")}</span>
      ),
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => (
        <span className="text-gray-600">
          {row.getValue("email") || "-"}
        </span>
      ),
    },
    {
      accessorKey: "phone",
      header: "Teléfono",
      cell: ({ row }) => (
        <span className="text-gray-600">
          {row.getValue("phone") || "-"}
        </span>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const hospital = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleEdit(hospital)}>
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-600"
                onClick={() => handleDelete(hospital.id)}
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
          <h1 className="text-2xl font-bold text-gray-900">Hospitales</h1>
          <p className="text-sm text-gray-500 mt-1">
            Gestión del catálogo de hospitales
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingHospital(null)
            setFormOpen(true)
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Hospital
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={hospitals}
        searchKey="name"
        searchPlaceholder="Buscar hospital..."
      />

      <HospitalForm
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open)
          if (!open) setEditingHospital(null)
        }}
        hospital={editingHospital}
      />
    </div>
  )
}
