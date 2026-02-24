"use server"

import { prisma } from "@/lib/prisma"
import { format, startOfWeek, subDays, differenceInDays } from "date-fns"
import { es } from "date-fns/locale"
import { LOAN_TYPE_LABELS } from "@/lib/constants"

export type DateRange = {
  from: Date
  to: Date
}

export type AnalyticsData = {
  kpis: {
    totalLoans: number
    totalUnits: number
    avgUnitsPerLoan: number
    returnRate: number
  }
  loanVolumeOverTime: Array<{
    date: string
    solicitado: number
    prestado: number
  }>
  loansByHospital: Array<{
    hospital: string
    count: number
    units: number
  }>
  typeDistribution: Array<{
    name: string
    value: number
  }>
  topMedications: Array<{
    medication: string
    count: number
    units: number
  }>
  hospitalRanking: Array<{
    hospitalName: string
    totalLoans: number
    totalUnits: number
    pendingReturns: number
  }>
  overdueLoans: Array<{
    id: string
    referenceNumber: string
    hospitalName: string
    medicationName: string
    units: number
    type: string
    createdAt: string
    daysSinceCreated: number
  }>
}

export async function getAnalytics(
  dateRange: DateRange,
  overdueDays: number = 30
): Promise<AnalyticsData> {
  const { from, to } = dateRange
  const dateFilter = { createdAt: { gte: from, lte: to } }
  const overdueThreshold = subDays(new Date(), overdueDays)

  const [
    totalLoans,
    unitsAggregate,
    returnedCount,
    allLoansInRange,
    hospitalLoansWithItems,
    typeGroups,
    medicationItemGroups,
    overdueLoansResult,
    allHospitalLoansWithItems,
  ] = await Promise.all([
    prisma.loan.count({ where: dateFilter }),
    prisma.loanItem.aggregate({
      where: { loan: dateFilter },
      _sum: { units: true },
      _avg: { units: true },
    }),
    prisma.loan.count({ where: { ...dateFilter, devuelto: true } }),
    prisma.loan.findMany({
      where: dateFilter,
      select: { createdAt: true, type: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.loan.findMany({
      where: dateFilter,
      select: {
        hospitalId: true,
        items: { select: { units: true } },
      },
    }),
    prisma.loan.groupBy({
      by: ["type"],
      where: dateFilter,
      _count: { _all: true },
    }),
    prisma.loanItem.groupBy({
      by: ["medicationId"],
      where: { loan: dateFilter },
      _count: { _all: true },
      _sum: { units: true },
      orderBy: { _count: { medicationId: "desc" } },
      take: 10,
    }),
    prisma.loan.findMany({
      where: {
        devuelto: false,
        createdAt: { lt: overdueThreshold },
      },
      include: {
        hospital: true,
        items: { include: { medication: true } },
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.loan.findMany({
      where: dateFilter,
      select: {
        hospitalId: true,
        items: { select: { units: true } },
      },
    }),
  ])

  // Aggregate hospital data in JS
  const hospitalGroupMap = new Map<string, { count: number; units: number }>()
  for (const loan of hospitalLoansWithItems) {
    const existing = hospitalGroupMap.get(loan.hospitalId) || { count: 0, units: 0 }
    existing.count++
    existing.units += loan.items.reduce((s, i) => s + i.units, 0)
    hospitalGroupMap.set(loan.hospitalId, existing)
  }
  const hospitalGroups = Array.from(hospitalGroupMap.entries())
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 10)

  const allHospitalGroupMap = new Map<string, { count: number; units: number }>()
  for (const loan of allHospitalLoansWithItems) {
    const existing = allHospitalGroupMap.get(loan.hospitalId) || { count: 0, units: 0 }
    existing.count++
    existing.units += loan.items.reduce((s, i) => s + i.units, 0)
    allHospitalGroupMap.set(loan.hospitalId, existing)
  }

  // Fetch hospital and medication names
  const hospitalIds = [
    ...new Set([
      ...hospitalGroups.map(([id]) => id),
      ...Array.from(allHospitalGroupMap.keys()),
    ]),
  ]
  const medicationIds = medicationItemGroups.map((g) => g.medicationId)

  const [hospitals, medications, pendingByHospital] = await Promise.all([
    prisma.hospital.findMany({
      where: { id: { in: hospitalIds } },
      select: { id: true, name: true },
    }),
    prisma.medication.findMany({
      where: { id: { in: medicationIds } },
      select: { id: true, name: true },
    }),
    prisma.loan.groupBy({
      by: ["hospitalId"],
      where: { devuelto: false, hospitalId: { in: hospitalIds } },
      _count: { _all: true },
    }),
  ])

  const hospitalMap = new Map(hospitals.map((h) => [h.id, h.name]))
  const medicationMap = new Map(medications.map((m) => [m.id, m.name]))
  const pendingMap = new Map(
    pendingByHospital.map((p) => [p.hospitalId, p._count._all])
  )

  // Build volume-over-time data
  const rangeDays = differenceInDays(to, from)
  let bucketFn: (d: Date) => string
  if (rangeDays <= 31) {
    bucketFn = (d) => format(d, "dd/MM", { locale: es })
  } else if (rangeDays <= 90) {
    bucketFn = (d) => {
      const weekStart = startOfWeek(d, { weekStartsOn: 1 })
      return format(weekStart, "dd/MM", { locale: es })
    }
  } else {
    bucketFn = (d) => format(d, "MMM yy", { locale: es })
  }

  const volumeMap = new Map<
    string,
    { solicitado: number; prestado: number }
  >()
  for (const loan of allLoansInRange) {
    const key = bucketFn(new Date(loan.createdAt))
    const existing = volumeMap.get(key) || { solicitado: 0, prestado: 0 }
    if (loan.type === "SOLICITADO") {
      existing.solicitado++
    } else {
      existing.prestado++
    }
    volumeMap.set(key, existing)
  }

  const loanVolumeOverTime = Array.from(volumeMap.entries()).map(
    ([date, counts]) => ({
      date,
      solicitado: counts.solicitado,
      prestado: counts.prestado,
    })
  )

  const totalUnits = unitsAggregate._sum.units || 0
  const avgUnitsPerLoan = totalLoans > 0
    ? Math.round((totalUnits / totalLoans) * 10) / 10
    : 0

  const now = new Date()

  return {
    kpis: {
      totalLoans,
      totalUnits,
      avgUnitsPerLoan,
      returnRate:
        totalLoans > 0
          ? Math.round((returnedCount / totalLoans) * 1000) / 10
          : 0,
    },
    loanVolumeOverTime,
    loansByHospital: hospitalGroups.map(([hospitalId, data]) => ({
      hospital: hospitalMap.get(hospitalId) || "Desconocido",
      count: data.count,
      units: data.units,
    })),
    typeDistribution: typeGroups.map((g) => ({
      name: LOAN_TYPE_LABELS[g.type] || g.type,
      value: g._count._all,
    })),
    topMedications: medicationItemGroups.map((g) => ({
      medication: medicationMap.get(g.medicationId) || "Desconocido",
      count: g._count._all,
      units: g._sum.units || 0,
    })),
    hospitalRanking: Array.from(allHospitalGroupMap.entries())
      .map(([hospitalId, data]) => ({
        hospitalName: hospitalMap.get(hospitalId) || "Desconocido",
        totalLoans: data.count,
        totalUnits: data.units,
        pendingReturns: pendingMap.get(hospitalId) || 0,
      }))
      .sort((a, b) => b.totalLoans - a.totalLoans),
    overdueLoans: overdueLoansResult.map((loan) => ({
      id: loan.id,
      referenceNumber: loan.referenceNumber,
      hospitalName: loan.hospital.name,
      medicationName: loan.items.map((i) => i.medication.name).join(", "),
      units: loan.items.reduce((s, i) => s + i.units, 0),
      type: LOAN_TYPE_LABELS[loan.type] || loan.type,
      createdAt: format(new Date(loan.createdAt), "dd/MM/yyyy", { locale: es }),
      daysSinceCreated: differenceInDays(now, new Date(loan.createdAt)),
    })),
  }
}
