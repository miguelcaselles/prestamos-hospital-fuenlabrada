"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/shared/data-table"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { LoanStatusBadge } from "./loan-status-badge"
import { bulkUpdateStatus } from "@/actions/loan-actions"
import { toast } from "sonner"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CheckCircle2 } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import type { LoanWithRelations, Hospital } from "@/types"

interface PendingTableProps {
  loans: LoanWithRelations[]
  hospitals: Hospital[]
}

export function PendingTable({ loans, hospitals }: PendingTableProps) {
  const [isPending, startTransition] = useTransition()
  const [selectedHospitalId, setSelectedHospitalId] = useState<string>("all")
  const [selectedLoanIds, setSelectedLoanIds] = useState<string[]>([])

  const filteredLoans =
    selectedHospitalId === "all"
      ? loans
      : loans.filter((l) => l.hospitalId === selectedHospitalId)

  const handleBulkMarkReturned = () => {
    if (selectedLoanIds.length === 0) {
      toast.warning("Selecciona al menos un préstamo")
      return
    }

    startTransition(async () => {
      try {
        await bulkUpdateStatus(selectedLoanIds, "DEVUELTO")
        toast.success(
          `${selectedLoanIds.length} préstamo(s) marcado(s) como devuelto(s)`
        )
        setSelectedLoanIds([])
      } catch {
        toast.error("Error al actualizar los préstamos")
      }
    })
  }

  const columns: ColumnDef<LoanWithRelations>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => {
            table.toggleAllPageRowsSelected(!!value)
            if (value) {
              setSelectedLoanIds(filteredLoans.map((l) => l.id))
            } else {
              setSelectedLoanIds([])
            }
          }}
          aria-label="Seleccionar todo"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => {
            row.toggleSelected(!!value)
            if (value) {
              setSelectedLoanIds((prev) => [...prev, row.original.id])
            } else {
              setSelectedLoanIds((prev) =>
                prev.filter((id) => id !== row.original.id)
              )
            }
          }}
          aria-label="Seleccionar fila"
        />
      ),
      enableSorting: false,
    },
    {
      accessorKey: "referenceNumber",
      header: "Referencia",
      cell: ({ row }) => (
        <Link
          href={`/prestamos/${row.original.id}`}
          className="font-medium text-blue-600 hover:underline"
        >
          {row.getValue("referenceNumber")}
        </Link>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Fecha",
      cell: ({ row }) =>
        format(new Date(row.getValue("createdAt")), "dd/MM/yyyy", {
          locale: es,
        }),
    },
    {
      accessorFn: (row) => row.hospital.name,
      id: "hospital",
      header: "Hospital",
    },
    {
      accessorFn: (row) => row.medication.name,
      id: "medication",
      header: "Medicamento",
    },
    {
      accessorKey: "units",
      header: "Uds.",
      cell: ({ row }) => (
        <span className="font-medium">{row.getValue("units")}</span>
      ),
    },
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ row }) => (
        <LoanStatusBadge
          status={row.original.status}
          loanType={row.original.type}
        />
      ),
    },
  ]

  // Get unique hospitals from the loans
  const loanHospitalIds = [...new Set(loans.map((l) => l.hospitalId))]
  const availableHospitals = hospitals.filter((h) =>
    loanHospitalIds.includes(h.id)
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Select value={selectedHospitalId} onValueChange={setSelectedHospitalId}>
          <SelectTrigger className="w-[250px]">
            <SelectValue placeholder="Filtrar por hospital" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los hospitales</SelectItem>
            {availableHospitals.map((hospital) => (
              <SelectItem key={hospital.id} value={hospital.id}>
                {hospital.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selectedLoanIds.length > 0 && (
          <Button
            onClick={handleBulkMarkReturned}
            disabled={isPending}
            variant="default"
          >
            <CheckCircle2 className="mr-2 h-4 w-4" />
            {isPending
              ? "Actualizando..."
              : `Marcar ${selectedLoanIds.length} como devuelto(s)`}
          </Button>
        )}
      </div>

      <DataTable
        columns={columns}
        data={filteredLoans}
        enableRowSelection
      />
    </div>
  )
}
