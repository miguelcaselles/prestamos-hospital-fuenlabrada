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
import { LoanStatusBadges } from "./loan-status-badge"
import { bulkMarkReturned } from "@/actions/loan-actions"
import { toast } from "sonner"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { CheckCircle2, FileDown } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import type { LoanWithRelations, Hospital } from "@/types"

interface PendingTableProps {
  loans: LoanWithRelations[]
  hospitals: Hospital[]
  listType: "devolver" | "que-devuelvan"
}

export function PendingTable({ loans, hospitals, listType }: PendingTableProps) {
  const [isPending, startTransition] = useTransition()
  const [isDownloading, setIsDownloading] = useState(false)
  const [selectedHospitalId, setSelectedHospitalId] = useState<string>("all")
  const [selectedLoanIds, setSelectedLoanIds] = useState<string[]>([])
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

  const filteredLoans =
    selectedHospitalId === "all"
      ? loans
      : loans.filter((l) => l.hospitalId === selectedHospitalId)

  const handleDownloadPDF = async () => {
    const idsToDownload = selectedLoanIds.length > 0 ? selectedLoanIds : filteredLoans.map((l) => l.id)
    if (idsToDownload.length === 0) {
      toast.warning("No hay préstamos para descargar")
      return
    }

    setIsDownloading(true)
    try {
      const response = await fetch("/api/pdf/pendientes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ loanIds: idsToDownload, listType }),
      })

      if (!response.ok) throw new Error("Error al generar PDF")

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `pendientes-${listType}-${new Date().toISOString().slice(0, 10)}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      toast.error("Error al descargar el PDF")
    } finally {
      setIsDownloading(false)
    }
  }

  const handleBulkMarkReturned = () => {
    if (selectedLoanIds.length === 0) {
      toast.warning("Selecciona al menos un préstamo")
      return
    }
    setShowConfirmDialog(true)
  }

  const confirmBulkMarkReturned = () => {
    setShowConfirmDialog(false)
    startTransition(async () => {
      try {
        await bulkMarkReturned(selectedLoanIds)
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
          className="font-medium text-teal-700 hover:underline"
        >
          {row.getValue("referenceNumber")}
        </Link>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Fecha",
      cell: ({ row }) =>
        format(new Date(row.getValue("createdAt")), "dd/MM/yyyy HH:mm", {
          locale: es,
        }),
    },
    {
      accessorFn: (row) => row.hospital.name,
      id: "hospital",
      header: "Hospital",
    },
    {
      id: "medication",
      header: "Medicamento",
      cell: ({ row }) => {
        const items = row.original.items
        if (items.length === 0) return "—"
        if (items.length === 1) return items[0].medication.name
        return (
          <span>{items[0].medication.name} (+{items.length - 1})</span>
        )
      },
    },
    {
      id: "units",
      header: "Cantidad",
      cell: ({ row }) => {
        const items = row.original.items
        const allSameType = items.every((i) => i.unitType === items[0]?.unitType)
        const total = items.reduce((s, i) => s + i.units, 0)
        const label = items[0]?.unitType === "CAJAS" ? "cajas" : "uds."
        if (allSameType) {
          return <span className="font-medium">{total} {label}</span>
        }
        const uds = items.filter((i) => i.unitType !== "CAJAS").reduce((s, i) => s + i.units, 0)
        const cajas = items.filter((i) => i.unitType === "CAJAS").reduce((s, i) => s + i.units, 0)
        const parts = []
        if (uds > 0) parts.push(`${uds} uds.`)
        if (cajas > 0) parts.push(`${cajas} cajas`)
        return <span className="font-medium">{parts.join(" + ")}</span>
      },
    },
    {
      id: "status",
      header: "Estado",
      cell: ({ row }) => (
        <LoanStatusBadges
          farmatoolsGestionado={row.original.farmatoolsGestionado}
          devuelto={row.original.devuelto}
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
      <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2 sm:gap-3">
        <Select value={selectedHospitalId} onValueChange={setSelectedHospitalId}>
          <SelectTrigger className="w-full sm:w-[250px]">
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

        <Button
          variant="outline"
          onClick={handleDownloadPDF}
          disabled={isDownloading}
        >
          <FileDown className="mr-2 h-4 w-4" />
          {isDownloading
            ? "Generando..."
            : selectedLoanIds.length > 0
              ? `Descargar PDF (${selectedLoanIds.length})`
              : "Descargar PDF (todos)"}
        </Button>

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

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar devolución</AlertDialogTitle>
            <AlertDialogDescription>
              Vas a marcar {selectedLoanIds.length} préstamo(s) como devuelto(s).
              Esta acción se puede deshacer desde el detalle de cada préstamo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmBulkMarkReturned}>
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
