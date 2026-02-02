"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import {
  LayoutDashboard,
  PlusCircle,
  FileText,
  Clock,
  Building2,
  Pill,
  Settings,
  Search,
} from "lucide-react"
import { searchLoans } from "@/actions/search-actions"
import { LOAN_TYPE_LABELS } from "@/lib/constants"
import type { LoanWithRelations } from "@/types"

export function CommandPalette() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<LoanWithRelations[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const searchTimeout = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const handleSearch = useCallback((value: string) => {
    setQuery(value)
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current)
    }
    if (value.length < 2) {
      setResults([])
      setIsSearching(false)
      return
    }

    setIsSearching(true)
    searchTimeout.current = setTimeout(async () => {
      try {
        const loans = await searchLoans(value)
        setResults(loans)
      } catch {
        setResults([])
      } finally {
        setIsSearching(false)
      }
    }, 300)
  }, [])

  const navigate = (path: string) => {
    setOpen(false)
    setQuery("")
    setResults([])
    router.push(path)
  }

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput
        placeholder="Buscar préstamo, hospital o medicamento..."
        value={query}
        onValueChange={handleSearch}
      />
      <CommandList>
        <CommandEmpty>
          {isSearching ? "Buscando..." : "No se encontraron resultados."}
        </CommandEmpty>

        {results.length > 0 && (
          <CommandGroup heading="Préstamos">
            {results.map((loan) => (
              <CommandItem
                key={loan.id}
                value={`${loan.referenceNumber} ${loan.hospital.name} ${loan.medication.name}`}
                onSelect={() => navigate(`/prestamos/${loan.id}`)}
              >
                <Search className="mr-2 h-4 w-4 text-gray-400" />
                <div className="flex flex-1 items-center justify-between">
                  <div>
                    <span className="font-medium">{loan.referenceNumber}</span>
                    <span className="text-gray-500 ml-2">
                      {loan.medication.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span>{loan.hospital.name}</span>
                    <span>{LOAN_TYPE_LABELS[loan.type]}</span>
                  </div>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {query.length < 2 && (
          <>
            <CommandGroup heading="Navegación">
              <CommandItem onSelect={() => navigate("/dashboard")}>
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Dashboard
              </CommandItem>
              <CommandItem onSelect={() => navigate("/prestamos/nuevo")}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Nuevo Préstamo
              </CommandItem>
              <CommandItem onSelect={() => navigate("/prestamos")}>
                <FileText className="mr-2 h-4 w-4" />
                Préstamos
              </CommandItem>
              <CommandItem onSelect={() => navigate("/pendientes")}>
                <Clock className="mr-2 h-4 w-4" />
                Pendientes
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Catálogos">
              <CommandItem onSelect={() => navigate("/hospitales")}>
                <Building2 className="mr-2 h-4 w-4" />
                Hospitales
              </CommandItem>
              <CommandItem onSelect={() => navigate("/medicamentos")}>
                <Pill className="mr-2 h-4 w-4" />
                Medicamentos
              </CommandItem>
              <CommandItem onSelect={() => navigate("/configuracion")}>
                <Settings className="mr-2 h-4 w-4" />
                Configuración
              </CommandItem>
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  )
}
