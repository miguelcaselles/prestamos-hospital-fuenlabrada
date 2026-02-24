import Image from "next/image"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { Sidebar } from "@/components/layout/sidebar"
import { MobileNav } from "@/components/layout/mobile-nav"
import { DashboardHeader } from "@/components/layout/dashboard-header"
import { CommandPalette } from "@/components/shared/command-palette"
import { Badge } from "@/components/ui/badge"
import { Bell } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [pendingFarmatools, pendingReturns] = await Promise.all([
    prisma.loan.count({ where: { farmatoolsGestionado: false } }),
    prisma.loan.count({ where: { devuelto: false } }),
  ])

  const totalPending = pendingFarmatools + pendingReturns

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <CommandPalette />
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-72 lg:flex-col">
        <Sidebar />
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile header */}
        <header className="flex h-14 items-center justify-between border-b bg-white px-4 lg:hidden">
          <div className="flex items-center gap-3">
            <MobileNav />
            <div className="flex items-center gap-2">
              <Image src="/logo.svg" alt="Logo" width={28} height={28} />
              <span className="text-sm font-bold text-gray-900 truncate">Med<span className="text-teal-700">Loan</span></span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {totalPending > 0 && (
              <Link href="/pendientes" className="relative p-2">
                <Bell className="h-5 w-5 text-gray-500" />
                <Badge
                  variant="destructive"
                  className="absolute -top-0.5 -right-0.5 h-4 min-w-[16px] p-0 flex items-center justify-center text-[9px]"
                >
                  {totalPending}
                </Badge>
              </Link>
            )}
            <Link
              href="/prestamos/nuevo"
              className="flex items-center justify-center h-9 w-9 rounded-lg bg-teal-600 text-white"
            >
              <span className="text-lg font-light">+</span>
            </Link>
          </div>
        </header>

        {/* Desktop header */}
        <DashboardHeader
          pendingFarmatools={pendingFarmatools}
          pendingReturns={pendingReturns}
        />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
