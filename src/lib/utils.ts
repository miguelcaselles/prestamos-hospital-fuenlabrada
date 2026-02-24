import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { LoanItemWithMedication } from "@/types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatLoanMedications(items: LoanItemWithMedication[]): string {
  if (items.length === 0) return "—"
  if (items.length === 1) return items[0].medication.name
  return `${items[0].medication.name} (+${items.length - 1} más)`
}

export function totalLoanUnits(items: { units: number }[]): number {
  return items.reduce((sum, item) => sum + item.units, 0)
}
