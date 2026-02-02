"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Lock, Eye, EyeOff, AlertCircle } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      })

      if (res.ok) {
        router.push("/dashboard")
        router.refresh()
      } else {
        setError("Contraseña incorrecta")
        setPassword("")
      }
    } catch {
      setError("Error de conexión")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Left panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-700 via-blue-600 to-blue-800 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full bg-white/10 blur-3xl" />
        </div>
        <div className="relative z-10 flex flex-col justify-center px-16">
          <div className="flex items-center gap-4 mb-8">
            <Image src="/logo.svg" alt="Logo" width={56} height={56} />
            <div>
              <h2 className="text-white text-xl font-bold">H.U. Fuenlabrada</h2>
              <p className="text-blue-200 text-sm">Servicio de Farmacia</p>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Gestión de Préstamos<br />de Medicamentos
          </h1>
          <p className="text-blue-100 text-lg max-w-md leading-relaxed">
            Sistema de control y seguimiento de préstamos de medicamentos entre hospitales.
          </p>
          <div className="mt-12 grid grid-cols-2 gap-4 max-w-sm">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <p className="text-3xl font-bold text-white">24/7</p>
              <p className="text-blue-200 text-sm mt-1">Acceso continuo</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <p className="text-3xl font-bold text-white">PDF</p>
              <p className="text-blue-200 text-sm mt-1">Documentos al instante</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel - Login form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center bg-gray-50 px-6">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center justify-center gap-3 mb-10">
            <Image src="/logo.svg" alt="Logo" width={44} height={44} />
            <div>
              <h2 className="text-lg font-bold text-gray-900">H.U. Fuenlabrada</h2>
              <p className="text-xs text-gray-500">Servicio de Farmacia</p>
            </div>
          </div>

          <div className="text-center mb-8">
            <div className="hidden lg:flex items-center justify-center w-14 h-14 bg-blue-100 rounded-2xl mx-auto mb-4">
              <Lock className="h-7 w-7 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Acceso al sistema</h1>
            <p className="text-gray-500 text-sm mt-2">
              Introduce la contraseña para acceder
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Contraseña"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setError("")
                }}
                className={`h-12 pr-12 text-base ${error ? "border-red-300 focus-visible:ring-red-500" : ""}`}
                autoFocus
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2.5">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-12 text-base font-medium bg-blue-600 hover:bg-blue-700"
              disabled={loading || !password}
            >
              {loading ? "Verificando..." : "Entrar"}
            </Button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-8">
            Hospital Universitario de Fuenlabrada<br />
            Camino del Molino, 2 - 28942 Fuenlabrada (Madrid)
          </p>
        </div>
      </div>
    </div>
  )
}
