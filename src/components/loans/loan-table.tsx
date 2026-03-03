"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/shared/data-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { MoreHorizontal, Eye, FileDown, Download, Trash2 } from "lucide-react"
import { ToggleableStatusBadges } from "./toggleable-status-badges"
import { LoanFilters } from "./loan-filters"
import { LOAN_TYPE_LABELS } from "@/lib/constants"
import { bulkDeleteLoans } from "@/actions/loan-actions"
import { toast } from "sonner"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import type { LoanWithRelations, Hospital } from "@/types"

interface LoanTableProps {
  loans: LoanWithRelations[]
  hospitals: Hospital[]
}

export function LoanTable({ loans, hospitals }: LoanTableProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [selectedLoans, setSelectedLoans] = useState<LoanWithRelations[]>([])
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isPending, startTransition] = useTransition()

  const exportUrl = `/api/loans/export${searchParams.toString() ? `?${searchParams.toString()}` : ""}`

  const handleDelete = () => {
    const ids = selectedLoans.map((l) => l.id)
    startTransition(async () => {
      try {
        const result = await bulkDeleteLoans(ids)
        toast.success(`${result.deleted} préstamo(s) eliminado(s)`)
        setSelectedLoans([])
        setShowDeleteDialog(false)
        router.refresh()
      } catch {
        toast.error("Error al eliminar los préstamos")
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
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Seleccionar todos"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Seleccionar fila"
        />
      ),
      enableSorting: false,
      enableHiding: false,
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
      accessorKey: "type",
      header: "Tipo",
      cell: ({ row }) => {
        const type = row.getValue("type") as string
        return (
          <Badge
            variant="outline"
            className={
              type === "SOLICITADO"
                ? "bg-purple-50 text-purple-700 border-purple-200"
                : "bg-teal-50 text-teal-700 border-teal-200"
            }
          >
            {LOAN_TYPE_LABELS[type as keyof typeof LOAN_TYPE_LABELS]}
          </Badge>
        )
      },
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
          <div className="flex items-center gap-1">
            <span>{items[0].medication.name}</span>
            <Badge variant="outline" className="text-xs">+{items.length - 1}</Badge>
          </div>
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
        // Mixed types: show breakdown
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
        <ToggleableStatusBadges
          loanId={row.original.id}
          farmatoolsGestionado={row.original.farmatoolsGestionado}
          devuelto={row.original.devuelto}
          loanType={row.original.type}
        />
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const loan = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/prestamos/${loan.id}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  Ver detalle
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link
                  href={`/api/pdf/${loan.id}`}
                  target="_blank"
                >
                  <FileDown className="mr-2 h-4 w-4" />
                  Descargar PDF
                </Link>
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
          <h1 className="text-2xl font-bold text-gray-900">Préstamos</h1>
          <p className="text-sm text-gray-500 mt-1">
            Gestión de todos los préstamos registrados
          </p>
        </div>
        <div className="flex gap-2">
          {selectedLoans.length > 0 && (
            <Button
              variant="destructive"
              onClick={() => setShowDeleteDialog(true)}
              disabled={isPending}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar ({selectedLoans.length})
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => window.open(exportUrl, "_blank")}
          >
            <Download className="mr-2 h-4 w-4" />
            Exportar CSV
          </Button>
          <Link href="/prestamos/nuevo">
            <Button>Nuevo Préstamo</Button>
          </Link>
        </div>
      </div>

      <LoanFilters hospitals={hospitals} />

      <DataTable
        columns={columns}
        data={loans}
        enableRowSelection
        onRowSelectionChange={setSelectedLoans}
      />

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar préstamos</AlertDialogTitle>
            <AlertDialogDescription>
              {`¿Estás seguro de que deseas eliminar ${selectedLoans.length} préstamo(s)? Esta acción no se puede deshacer.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleDelete}
              disabled={isPending}
            >
              {isPending ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
