import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  PlusCircle,
  Clock,
  BarChart3,
  FileDown,
} from "lucide-react"

const actions = [
  {
    label: "Nuevo Préstamo",
    href: "/prestamos/nuevo",
    icon: PlusCircle,
    color: "text-teal-600",
    bg: "bg-teal-50 hover:bg-teal-100",
  },
  {
    label: "Ver Pendientes",
    href: "/pendientes",
    icon: Clock,
    color: "text-orange-600",
    bg: "bg-orange-50 hover:bg-orange-100",
  },
  {
    label: "Estadísticas",
    href: "/estadisticas",
    icon: BarChart3,
    color: "text-purple-600",
    bg: "bg-purple-50 hover:bg-purple-100",
  },
  {
    label: "PDF Pendientes",
    href: "/api/pdf/pendientes?type=devolver",
    icon: FileDown,
    color: "text-rose-600",
    bg: "bg-rose-50 hover:bg-rose-100",
  },
]

export function QuickActions() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">
          Accesos rápidos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          {actions.map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className={`flex flex-col items-center gap-1.5 rounded-lg p-3 text-center transition-colors ${action.bg}`}
            >
              <action.icon className={`h-5 w-5 ${action.color}`} />
              <span className="text-xs font-medium text-gray-700">
                {action.label}
              </span>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
