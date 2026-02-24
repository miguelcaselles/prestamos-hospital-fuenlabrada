"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { PlusCircle, Bell, Clock, AlertTriangle } from "lucide-react"

interface DashboardHeaderProps {
  pendingFarmatools: number
  pendingReturns: number
}

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/prestamos/nuevo": "Nuevo Préstamo",
  "/prestamos": "Préstamos",
  "/pendientes": "Pendientes",
  "/estadisticas": "Estadísticas",
  "/hospitales": "Hospitales",
  "/medicamentos": "Medicamentos",
  "/configuracion": "Configuración",
}

const PAGE_DESCRIPTIONS: Record<string, string> = {
  "/dashboard": "Resumen general del sistema",
  "/prestamos/nuevo": "Registrar un nuevo préstamo",
  "/prestamos": "Listado completo de préstamos",
  "/pendientes": "Préstamos pendientes de gestión",
  "/estadisticas": "Análisis y métricas de actividad",
  "/hospitales": "Gestión del catálogo de hospitales",
  "/medicamentos": "Gestión del catálogo de medicamentos",
  "/configuracion": "Ajustes del sistema",
}

export function DashboardHeader({
  pendingFarmatools,
  pendingReturns,
}: DashboardHeaderProps) {
  const pathname = usePathname()

  const getPageTitle = () => {
    if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname]
    if (pathname.startsWith("/prestamos/")) return "Detalle de Préstamo"
    return "Gestión de Préstamos"
  }

  const getPageDescription = () => {
    if (PAGE_DESCRIPTIONS[pathname]) return PAGE_DESCRIPTIONS[pathname]
    if (pathname.startsWith("/prestamos/")) return "Información del préstamo"
    return ""
  }

  const totalPending = pendingFarmatools + pendingReturns

  return (
    <header className="hidden lg:flex h-16 items-center justify-between border-b bg-white px-8 shrink-0">
      {/* Left: Page title */}
      <div>
        <h1 className="text-lg font-semibold text-gray-900">
          {getPageTitle()}
        </h1>
        {getPageDescription() && (
          <p className="text-xs text-gray-500">{getPageDescription()}</p>
        )}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        {/* Pending notifications */}
        {totalPending > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Link href="/pendientes">
                <Button variant="ghost" size="sm" className="relative gap-2 text-gray-600">
                  <Bell className="h-4 w-4" />
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-[10px]"
                  >
                    {totalPending}
                  </Badge>
                </Button>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <div className="space-y-1 text-xs">
                {pendingFarmatools > 0 && (
                  <div className="flex items-center gap-1.5">
                    <AlertTriangle className="h-3 w-3 text-yellow-500" />
                    <span>{pendingFarmatools} pendiente(s) Farmatools</span>
                  </div>
                )}
                {pendingReturns > 0 && (
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3 w-3 text-orange-500" />
                    <span>{pendingReturns} pendiente(s) de devolución</span>
                  </div>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        )}

        {/* New loan */}
        <Link href="/prestamos/nuevo">
          <Button size="sm" className="bg-teal-600 hover:bg-teal-700 gap-2">
            <PlusCircle className="h-4 w-4" />
            Nuevo Préstamo
          </Button>
        </Link>
      </div>
    </header>
  )
}
