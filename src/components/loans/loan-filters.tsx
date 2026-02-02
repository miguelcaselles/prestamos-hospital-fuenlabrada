"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Search, X } from "lucide-react"
import { LOAN_TYPE_LABELS } from "@/lib/constants"
import type { Hospital } from "@/types"

interface LoanFiltersProps {
  hospitals: Hospital[]
}

export function LoanFilters({ hospitals }: LoanFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value && value !== "all") {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`/prestamos?${params.toString()}`)
  }

  const clearFilters = () => {
    router.push("/prestamos")
  }

  const hasFilters = searchParams.toString().length > 0

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Buscar medicamento..."
          className="pl-9 w-[200px]"
          defaultValue={searchParams.get("search") ?? ""}
          onChange={(e) => {
            const value = e.target.value
            const timeout = setTimeout(() => updateFilter("search", value), 300)
            return () => clearTimeout(timeout)
          }}
        />
      </div>

      <Select
        value={searchParams.get("farmatools") ?? "all"}
        onValueChange={(value) => updateFilter("farmatools", value)}
      >
        <SelectTrigger className="w-[220px]">
          <SelectValue placeholder="Farmatools" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos (Farmatools)</SelectItem>
          <SelectItem value="false">Pendiente de gestionar</SelectItem>
          <SelectItem value="true">Gestionado</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={searchParams.get("devuelto") ?? "all"}
        onValueChange={(value) => updateFilter("devuelto", value)}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Devolución" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos (Devolución)</SelectItem>
          <SelectItem value="false">Pendiente</SelectItem>
          <SelectItem value="true">Devuelto</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={searchParams.get("type") ?? "all"}
        onValueChange={(value) => updateFilter("type", value)}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Tipo" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos los tipos</SelectItem>
          {Object.entries(LOAN_TYPE_LABELS).map(([key, label]) => (
            <SelectItem key={key} value={key}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={searchParams.get("hospitalId") ?? "all"}
        onValueChange={(value) => updateFilter("hospitalId", value)}
      >
        <SelectTrigger className="w-[220px]">
          <SelectValue placeholder="Hospital" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos los hospitales</SelectItem>
          {hospitals.map((hospital) => (
            <SelectItem key={hospital.id} value={hospital.id}>
              {hospital.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          <X className="mr-1 h-4 w-4" />
          Limpiar filtros
        </Button>
      )}
    </div>
  )
}
