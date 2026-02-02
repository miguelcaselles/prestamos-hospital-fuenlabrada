import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Clock, ArrowDownLeft, ArrowUpRight } from "lucide-react"

interface SummaryCardsProps {
  totalActive: number
  pendingFarmatools: number
  pendingReturn: number
  pendingTheirReturn: number
}

export function SummaryCards({
  totalActive,
  pendingFarmatools,
  pendingReturn,
  pendingTheirReturn,
}: SummaryCardsProps) {
  const cards = [
    {
      title: "Préstamos Activos",
      value: totalActive,
      icon: FileText,
      color: "text-blue-600",
      bg: "bg-blue-50",
      href: "/prestamos",
    },
    {
      title: "Pendientes Farmatools",
      value: pendingFarmatools,
      icon: Clock,
      color: "text-yellow-600",
      bg: "bg-yellow-50",
      href: "/prestamos?farmatools=false",
    },
    {
      title: "Pendientes de Devolver",
      value: pendingReturn,
      icon: ArrowUpRight,
      color: "text-orange-600",
      bg: "bg-orange-50",
      href: "/pendientes",
    },
    {
      title: "Pendientes que nos Devuelvan",
      value: pendingTheirReturn,
      icon: ArrowDownLeft,
      color: "text-red-600",
      bg: "bg-red-50",
      href: "/pendientes?tab=que-devuelvan",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Link key={card.title} href={card.href}>
          <Card className="transition-shadow hover:shadow-md cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {card.title}
              </CardTitle>
              <div className={`rounded-lg p-2 ${card.bg}`}>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{card.value}</div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}
