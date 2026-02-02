"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { AlertTriangle, RefreshCw, Home } from "lucide-react"

interface ErrorStateProps {
  title?: string
  message?: string
  retry?: () => void
}

export function ErrorState({
  title = "Ha ocurrido un error",
  message = "No se han podido cargar los datos. Por favor, inténtelo de nuevo.",
  retry,
}: ErrorStateProps) {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Card className="max-w-md w-full">
        <CardContent className="pt-6 text-center space-y-4">
          <div className="flex justify-center">
            <div className="rounded-full bg-red-50 p-4">
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            <p className="text-sm text-gray-500 mt-1">{message}</p>
          </div>
          <div className="flex justify-center gap-3">
            {retry && (
              <Button onClick={retry} variant="default">
                <RefreshCw className="mr-2 h-4 w-4" />
                Reintentar
              </Button>
            )}
            <Link href="/dashboard">
              <Button variant="outline">
                <Home className="mr-2 h-4 w-4" />
                Ir al Dashboard
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
