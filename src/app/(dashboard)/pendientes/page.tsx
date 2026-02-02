import { prisma } from "@/lib/prisma"
import { getHospitals } from "@/actions/hospital-actions"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PendingTable } from "@/components/loans/pending-table"
import { ArrowUpRight, ArrowDownLeft } from "lucide-react"

interface PageProps {
  searchParams: Promise<{ tab?: string }>
}

export default async function PendientesPage({ searchParams }: PageProps) {
  const params = await searchParams
  const defaultTab = params.tab === "que-devuelvan" ? "que-devuelvan" : "devolver"
  const [pendingReturn, pendingTheirReturn, hospitals] = await Promise.all([
    prisma.loan.findMany({
      where: { devuelto: false, type: "SOLICITADO" },
      include: { hospital: true, medication: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.loan.findMany({
      where: { devuelto: false, type: "PRESTADO" },
      include: { hospital: true, medication: true },
      orderBy: { createdAt: "desc" },
    }),
    getHospitals(),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Préstamos Pendientes
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Gestión de devoluciones pendientes
        </p>
      </div>

      <Tabs defaultValue={defaultTab}>
        <TabsList className="grid w-full max-w-lg grid-cols-2">
          <TabsTrigger value="devolver" className="gap-2">
            <ArrowUpRight className="h-4 w-4" />
            Pendientes de Devolver ({pendingReturn.length})
          </TabsTrigger>
          <TabsTrigger value="que-devuelvan" className="gap-2">
            <ArrowDownLeft className="h-4 w-4" />
            Que nos Devuelvan ({pendingTheirReturn.length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="devolver" className="mt-4">
          {pendingReturn.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <ArrowUpRight className="mx-auto h-12 w-12 text-gray-300 mb-3" />
              <p className="text-lg font-medium">No hay préstamos pendientes de devolver</p>
              <p className="text-sm mt-1">Todos los préstamos solicitados están al día.</p>
            </div>
          ) : (
            <PendingTable loans={pendingReturn} hospitals={hospitals} />
          )}
        </TabsContent>
        <TabsContent value="que-devuelvan" className="mt-4">
          {pendingTheirReturn.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <ArrowDownLeft className="mx-auto h-12 w-12 text-gray-300 mb-3" />
              <p className="text-lg font-medium">No hay préstamos pendientes de que nos devuelvan</p>
              <p className="text-sm mt-1">Todos los préstamos realizados han sido devueltos.</p>
            </div>
          ) : (
            <PendingTable loans={pendingTheirReturn} hospitals={hospitals} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
