import { Skeleton } from "@/components/ui/skeleton"

export default function PendientesLoading() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-64 mt-2" />
      </div>

      <Skeleton className="h-10 w-full max-w-lg" />

      <div className="space-y-4">
        <Skeleton className="h-10 w-[250px]" />
        <div className="rounded-md border bg-white">
          <div className="p-4 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
