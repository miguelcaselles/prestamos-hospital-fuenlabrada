"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
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
import {
  LayoutDashboard,
  PlusCircle,
  FileText,
  Clock,
  BarChart3,
  Building2,
  Pill,
  Settings,
  LogOut,
  Command,
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
    name: "Estadísticas",
    href: "/estadisticas",
    icon: BarChart3,
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
  const router = useRouter()
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/login")
    router.refresh()
  }

  return (
    <div className="flex h-full flex-col bg-white border-r">
      {/* Branding */}
      <div className="flex h-16 items-center gap-3 border-b px-5">
        <Image src="/logo.svg" alt="MedLoan" width={36} height={36} className="shrink-0" />
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-bold text-gray-900 tracking-tight truncate">
            Med<span className="text-teal-700">Loan</span>
          </span>
          <span className="text-[11px] text-gray-500">Gestión de Préstamos de Medicación</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" &&
              pathname.startsWith(item.href) &&
              !navigation.some(
                (other) =>
                  other.href !== item.href &&
                  other.href.startsWith(item.href) &&
                  pathname.startsWith(other.href)
              ))
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-teal-700 text-white"
                  : "text-gray-600 hover:bg-teal-50 hover:text-teal-700"
              )}
            >
              <item.icon
                className={cn(
                  "h-5 w-5 shrink-0",
                  isActive ? "text-white" : "text-gray-400"
                )}
              />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="border-t px-3 py-3 space-y-2">
        {/* Keyboard shortcut hint */}
        <div className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-gray-400">
          <Command className="h-3.5 w-3.5" />
          <span>
            <kbd className="rounded border border-gray-200 bg-gray-50 px-1 py-0.5 font-mono text-[10px]">
              Ctrl
            </kbd>
            {" + "}
            <kbd className="rounded border border-gray-200 bg-gray-50 px-1 py-0.5 font-mono text-[10px]">
              K
            </kbd>
            {" buscar"}
          </span>
        </div>

        <button
          onClick={() => setShowLogoutDialog(true)}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          Cerrar sesión
        </button>
        <div className="px-3 pt-1">
          <p className="text-xs text-gray-400">Desarrollado por Miguel Caselles</p>
          <p className="text-xs text-gray-400">Servicio de Farmacia &middot; v1.0.0</p>
        </div>
      </div>

      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cerrar sesión</AlertDialogTitle>
            <AlertDialogDescription>
              Se cerrará tu sesión actual. Tendrás que volver a introducir la
              contraseña para acceder.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout}>
              Cerrar sesión
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
