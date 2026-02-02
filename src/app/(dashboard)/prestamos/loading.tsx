import { Skeleton } from "@/components/ui/skeleton"

export default function PrestamosLoading() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </div>
        <Skeleton className="h-10 w-40" />
      </div>

      <div className="flex gap-3">
        <Skeleton className="h-10 w-[200px]" />
        <Skeleton className="h-10 w-[220px]" />
        <Skeleton className="h-10 w-[200px]" />
        <Skeleton className="h-10 w-[220px]" />
      </div>

      <div className="rounded-md border bg-white">
        <div className="p-4 space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    </div>
  )
}
