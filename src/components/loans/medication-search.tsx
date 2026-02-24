"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { Check, ChevronsUpDown, Loader2, Plus, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { createMedicationFromCima } from "@/actions/medication-actions"
import { toast } from "sonner"
import type { Medication } from "@/types"

interface CimaResult {
  nregistro: string
  nombre: string
  activeIngredient: string | null
  form: string | null
  dosis: string | null
}

interface MedicationSearchProps {
  medications: Medication[]
  value: string
  onValueChange: (value: string) => void
  onMedicationCreated?: (medication: Medication) => void
  onCreateManual?: (name: string) => void
  disabled?: boolean
}

export function MedicationSearch({
  medications,
  value,
  onValueChange,
  onMedicationCreated,
  onCreateManual,
  disabled,
}: MedicationSearchProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [cimaResults, setCimaResults] = useState<CimaResult[]>([])
  const [isSearchingCima, setIsSearchingCima] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  // Debounced CIMA search
  useEffect(() => {
    if (search.length < 2) {
      setCimaResults([])
      setIsSearchingCima(false)
      return
    }

    setIsSearchingCima(true)

    const timer = setTimeout(async () => {
      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller

      try {
        const res = await fetch(
          `/api/cima/search?q=${encodeURIComponent(search)}`,
          { signal: controller.signal }
        )
        if (res.ok) {
          const data = await res.json()
          setCimaResults(data.results || [])
        }
      } catch (err) {
        if (err instanceof Error && err.name !== "AbortError") {
          console.error("CIMA search error:", err)
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsSearchingCima(false)
        }
      }
    }, 400)

    return () => {
      clearTimeout(timer)
    }
  }, [search])

  // Filter local medications client-side
  const filteredLocal = useMemo(() => {
    if (!search) return medications.slice(0, 20)
    const lower = search.toLowerCase()
    return medications
      .filter(
        (m) =>
          m.name.toLowerCase().includes(lower) ||
          m.nationalCode?.toLowerCase().includes(lower) ||
          m.activeIngredient?.toLowerCase().includes(lower) ||
          m.presentation?.toLowerCase().includes(lower)
      )
      .slice(0, 15)
  }, [medications, search])

  // Filter out CIMA results that already exist locally
  const filteredCima = useMemo(() => {
    const localNames = new Set(
      medications.map((m) => m.name.toLowerCase())
    )
    return cimaResults.filter(
      (r) => !localNames.has(r.nombre.toLowerCase())
    )
  }, [cimaResults, medications])

  const selectedMed = medications.find((m) => m.id === value)

  const handleSelectCima = async (result: CimaResult) => {
    setIsCreating(true)
    try {
      const med = await createMedicationFromCima(result.nregistro)
      onMedicationCreated?.(med)
      onValueChange(med.id)
      toast.success(`Medicamento "${med.name}" añadido desde CIMA`)
      setSearch("")
      setOpen(false)
    } catch {
      toast.error("Error al importar medicamento de CIMA")
    } finally {
      setIsCreating(false)
    }
  }

  const handleSelectLocal = (medId: string) => {
    onValueChange(medId === value ? "" : medId)
    setSearch("")
    setOpen(false)
  }

  const hasResults = filteredLocal.length > 0 || filteredCima.length > 0
  const showEmpty =
    !hasResults && !isSearchingCima && search.length >= 2

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
          disabled={disabled || isCreating}
        >
          {isCreating ? (
            <span className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Importando de CIMA...
            </span>
          ) : selectedMed ? (
            <span className="truncate">{selectedMed.name}</span>
          ) : (
            <span className="text-muted-foreground">
              Seleccionar medicamento...
            </span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[--radix-popover-trigger-width] p-0"
        align="start"
      >
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Buscar por nombre, principio activo o CN..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            {/* Empty state */}
            {search.length > 0 && search.length < 2 && (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Escribe al menos 2 caracteres...
              </div>
            )}

            {showEmpty && !onCreateManual && (
              <div className="py-6 text-center text-sm text-muted-foreground">
                No se encontraron resultados.
              </div>
            )}

            {/* Local results */}
            {filteredLocal.length > 0 && (
              <CommandGroup heading="Base de datos">
                {filteredLocal.map((med) => (
                  <CommandItem
                    key={med.id}
                    value={med.id}
                    onSelect={() => handleSelectLocal(med.id)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4 shrink-0",
                        value === med.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col min-w-0">
                      <span className="truncate">{med.name}</span>
                      {(med.nationalCode ||
                        med.activeIngredient ||
                        med.presentation) && (
                        <span className="text-xs text-muted-foreground truncate">
                          {[
                            med.nationalCode
                              ? `CN: ${med.nationalCode}`
                              : null,
                            med.activeIngredient,
                            med.presentation,
                          ]
                            .filter(Boolean)
                            .join(" · ")}
                        </span>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {/* CIMA loading */}
            {isSearchingCima && (
              <div className="flex items-center justify-center gap-2 py-4 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Buscando en CIMA...
              </div>
            )}

            {/* CIMA results */}
            {filteredCima.length > 0 && (
              <CommandGroup heading="CIMA (AEMPS)">
                {filteredCima.map((result) => (
                  <CommandItem
                    key={result.nregistro}
                    value={`cima-${result.nregistro}`}
                    onSelect={() => handleSelectCima(result)}
                  >
                    <Search className="mr-2 h-4 w-4 shrink-0 text-teal-500" />
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm truncate">
                        {result.nombre}
                      </span>
                      <span className="text-xs text-muted-foreground truncate">
                        {[
                          result.activeIngredient,
                          result.form,
                          result.dosis,
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {/* Manual create option */}
            {search.length >= 2 && onCreateManual && (
              <CommandGroup>
                <CommandItem
                  value="__create_manual__"
                  onSelect={() => {
                    onCreateManual(search.trim())
                    setSearch("")
                    setOpen(false)
                  }}
                >
                  <Plus className="mr-2 h-4 w-4 text-teal-600" />
                  <span>
                    Crear manualmente:{" "}
                    <span className="font-semibold">
                      &quot;{search.trim()}&quot;
                    </span>
                  </span>
                </CommandItem>
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
