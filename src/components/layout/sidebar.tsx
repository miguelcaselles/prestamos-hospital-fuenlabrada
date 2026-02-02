"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  PlusCircle,
  FileText,
  Clock,
  Building2,
  Pill,
  Settings,
} from "lucide-react"

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Nuevo Préstamo",
    href: "/prestamos/nuevo",
    icon: PlusCircle,
  },
  {
    name: "Préstamos",
    href: "/prestamos",
    icon: FileText,
  },
  {
    name: "Pendientes",
    href: "/pendientes",
    icon: Clock,
  },
  {
    name: "Hospitales",
    href: "/hospitales",
    icon: Building2,
  },
  {
    name: "Medicamentos",
    href: "/medicamentos",
    icon: Pill,
  },
  {
    name: "Configuración",
    href: "/configuracion",
    icon: Settings,
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full flex-col bg-white border-r">
      {/* Branding */}
      <div className="flex h-16 items-center gap-3 border-b px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-sm">
          HF
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-gray-900">
            H.U. Fuenlabrada
          </span>
          <span className="text-xs text-gray-500">Gestión de Préstamos</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href))
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <item.icon
                className={cn(
                  "h-5 w-5 shrink-0",
                  isActive ? "text-blue-600" : "text-gray-400"
                )}
              />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="border-t px-6 py-4">
        <p className="text-xs text-gray-400">Servicio de Farmacia</p>
        <p className="text-xs text-gray-400">v1.0.0</p>
      </div>
    </div>
  )
}
