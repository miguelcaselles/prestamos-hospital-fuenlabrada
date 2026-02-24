"use client"

import { useRef, useCallback } from "react"
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
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const updateFilter = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value && value !== "all") {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`/prestamos?${params.toString()}`)
  }, [router, searchParams])

  const clearFilters = () => {
    router.push("/prestamos")
  }

  const hasFilters = searchParams.toString().length > 0
  const activeFilterCount = ["farmatools", "devuelto", "type", "hospitalId", "search"].filter(
    (key) => searchParams.has(key)
  ).length

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }
    searchTimeoutRef.current = setTimeout(() => updateFilter("search", value), 300)
  }, [updateFilter])

  return (
    <div className="flex flex-col gap-3">
      {/* Search */}
      <div className="relative w-full sm:max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Buscar referencia, hospital..."
          className="pl-9"
          defaultValue={searchParams.get("search") ?? ""}
          onChange={handleSearchChange}
        />
      </div>

      {/* Filters row */}
      <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-3">
        <Select
          value={searchParams.get("farmatools") ?? "all"}
          onValueChange={(value) => updateFilter("farmatools", value)}
        >
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Farmatools" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos (Farmatools)</SelectItem>
            <SelectItem value="false">Pendiente</SelectItem>
            <SelectItem value="true">Gestionado</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={searchParams.get("devuelto") ?? "all"}
          onValueChange={(value) => updateFilter("devuelto", value)}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
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
          <SelectTrigger className="w-full sm:w-[180px]">
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
          <SelectTrigger className="w-full sm:w-[200px]">
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
          <Button variant="ghost" size="sm" onClick={clearFilters} className="text-red-600 hover:text-red-700 hover:bg-red-50 col-span-2 sm:col-span-1">
            <X className="mr-1 h-4 w-4" />
            Limpiar ({activeFilterCount})
          </Button>
        )}
      </div>
    </div>
  )
}
