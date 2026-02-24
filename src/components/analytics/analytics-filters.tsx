"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { Download, FileText } from "lucide-react"

const PRESETS = [
  { value: "7d", label: "7 días" },
  { value: "30d", label: "30 días" },
  { value: "3m", label: "3 meses" },
  { value: "1y", label: "Este año" },
  { value: "custom", label: "Personalizado" },
]

interface AnalyticsFiltersProps {
  currentPreset: string
  from: Date
  to: Date
  overdueDays: number
}

export function AnalyticsFilters({
  currentPreset,
  from,
  to,
  overdueDays,
}: AnalyticsFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const setPreset = useCallback(
    (preset: string) => {
      const params = new URLSearchParams()
      if (preset !== "30d") params.set("preset", preset)
      const od = searchParams.get("overdueDays")
      if (od && od !== "30") params.set("overdueDays", od)
      router.push(`/estadisticas${params.toString() ? `?${params}` : ""}`)
    },
    [router, searchParams]
  )

  const setCustomDates = useCallback(
    (fromStr: string, toStr: string) => {
      const params = new URLSearchParams()
      params.set("preset", "custom")
      if (fromStr) params.set("from", fromStr)
      if (toStr) params.set("to", toStr)
      const od = searchParams.get("overdueDays")
      if (od && od !== "30") params.set("overdueDays", od)
      router.push(`/estadisticas?${params}`)
    },
    [router, searchParams]
  )

  const setOverdueDays = useCallback(
    (days: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (days && days !== "30") {
        params.set("overdueDays", days)
      } else {
        params.delete("overdueDays")
      }
      router.push(`/estadisticas${params.toString() ? `?${params}` : ""}`)
    },
    [router, searchParams]
  )

  const fromStr = from.toISOString().split("T")[0]
  const toStr = to.toISOString().split("T")[0]

  const buildExportUrl = useCallback(
    (format: "xlsx" | "pdf") => {
      const params = new URLSearchParams(searchParams.toString())
      if (!params.has("preset")) params.set("preset", "30d")
      return `/api/analytics/export-${format}?${params}`
    },
    [searchParams]
  )

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-1.5">
        {PRESETS.map((preset) => (
          <Button
            key={preset.value}
            variant={currentPreset === preset.value ? "default" : "outline"}
            size="sm"
            onClick={() => setPreset(preset.value)}
            className={cn(
              "min-w-[60px]",
              currentPreset === preset.value && "pointer-events-none"
            )}
          >
            {preset.label}
          </Button>
        ))}

        <div className="ml-auto flex gap-1.5">
          <Button
            variant="outline"
            size="sm"
            asChild
            className="gap-1.5 text-teal-700 border-teal-200 hover:bg-teal-50"
          >
            <a href={buildExportUrl("xlsx")} download>
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Excel</span>
            </a>
          </Button>
          <Button
            variant="outline"
            size="sm"
            asChild
            className="gap-1.5 text-teal-700 border-teal-200 hover:bg-teal-50"
          >
            <a href={buildExportUrl("pdf")} download>
              <FileText className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">PDF</span>
            </a>
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        {currentPreset === "custom" && (
          <div className="flex items-end gap-2">
            <div>
              <Label className="text-xs text-gray-500">Desde</Label>
              <Input
                type="date"
                defaultValue={fromStr}
                className="w-[140px]"
                onChange={(e) => setCustomDates(e.target.value, toStr)}
              />
            </div>
            <div>
              <Label className="text-xs text-gray-500">Hasta</Label>
              <Input
                type="date"
                defaultValue={toStr}
                className="w-[140px]"
                onChange={(e) => setCustomDates(fromStr, e.target.value)}
              />
            </div>
          </div>
        )}

        <div className="sm:ml-auto flex items-end gap-2">
          <div>
            <Label className="text-xs text-gray-500">Umbral vencidos (días)</Label>
            <Input
              type="number"
              min={1}
              defaultValue={overdueDays}
              className="w-[100px]"
              onBlur={(e) => setOverdueDays(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") setOverdueDays(e.currentTarget.value)
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
