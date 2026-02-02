"use client"

import { useState } from "react"
import Link from "next/link"
import { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/shared/data-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Eye, RefreshCw, FileDown } from "lucide-react"
import { LoanStatusBadges } from "./loan-status-badge"
import { LoanStatusDialog } from "./loan-status-dialog"
import { LoanFilters } from "./loan-filters"
import { LOAN_TYPE_LABELS } from "@/lib/constants"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import type { LoanWithRelations, Hospital } from "@/types"

interface LoanTableProps {
  loans: LoanWithRelations[]
  hospitals: Hospital[]
}

export function LoanTable({ loans, hospitals }: LoanTableProps) {
  const [statusDialogOpen, setStatusDialogOpen] = useState(false)
  const [selectedLoan, setSelectedLoan] = useState<LoanWithRelations | null>(
    null
  )

  const columns: ColumnDef<LoanWithRelations>[] = [
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
              <DropdownMenuItem
                onClick={() => {
                  setSelectedLoan(loan)
                  setStatusDialogOpen(true)
                }}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Cambiar estado
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
        <Link href="/prestamos/nuevo">
          <Button>Nuevo Préstamo</Button>
        </Link>
      </div>

      <LoanFilters hospitals={hospitals} />

      <DataTable columns={columns} data={loans} />

      {selectedLoan && (
        <LoanStatusDialog
          open={statusDialogOpen}
          onOpenChange={setStatusDialogOpen}
          loanId={selectedLoan.id}
          farmatoolsGestionado={selectedLoan.farmatoolsGestionado}
          devuelto={selectedLoan.devuelto}
          loanType={selectedLoan.type}
        />
      )}
    </div>
  )
}
