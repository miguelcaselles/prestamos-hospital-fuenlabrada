"use client"

import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { smtpSettingsSchema, SmtpSettingsValues } from "@/lib/validators"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  updateSmtpSettings,
  sendSmtpTestEmail,
} from "@/actions/settings-actions"
import { toast } from "sonner"
import { Save, Send } from "lucide-react"
import type { SmtpSettings } from "@/types"

interface SmtpSettingsFormProps {
  settings: SmtpSettings | null
}

export function SmtpSettingsForm({ settings }: SmtpSettingsFormProps) {
  const [isPending, startTransition] = useTransition()
  const [testEmail, setTestEmail] = useState("")
  const [isSendingTest, startSendTest] = useTransition()

  const form = useForm<SmtpSettingsValues>({
    resolver: zodResolver(smtpSettingsSchema),
    defaultValues: {
      host: settings?.host ?? "",
      port: settings?.port ?? 587,
      secure: settings?.secure ?? false,
      user: settings?.user ?? "",
      password: settings?.password ?? "",
      fromName: settings?.fromName ?? "Hospital de Fuenlabrada - Farmacia",
      fromEmail: settings?.fromEmail ?? "",
    },
  })

  function onSubmit(data: SmtpSettingsValues) {
    startTransition(async () => {
      try {
        await updateSmtpSettings(data)
        toast.success("Configuración SMTP guardada correctamente")
      } catch {
        toast.error("Error al guardar la configuración")
      }
    })
  }

  function handleSendTest() {
    if (!testEmail) {
      toast.warning("Introduce un email de destino")
      return
    }

    startSendTest(async () => {
      try {
        await sendSmtpTestEmail(testEmail)
        toast.success("Email de prueba enviado correctamente")
      } catch {
        toast.error(
          "Error al enviar el email de prueba. Verifica la configuración SMTP."
        )
      }
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Configuración SMTP</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="host"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Servidor SMTP</FormLabel>
                      <FormControl>
                        <Input placeholder="smtp.gmail.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="port"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Puerto</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="587" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="user"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Usuario</FormLabel>
                      <FormControl>
                        <Input placeholder="usuario@hospital.es" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contraseña</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="secure"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center gap-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="!mt-0">
                      Conexión segura (SSL/TLS)
                    </FormLabel>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="fromName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre del remitente</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Hospital de Fuenlabrada - Farmacia"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="fromEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email del remitente</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="farmacia@hospital.es"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={isPending}>
                  <Save className="mr-2 h-4 w-4" />
                  {isPending ? "Guardando..." : "Guardar Configuración"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Enviar Email de Prueba</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Input
              type="email"
              placeholder="email@destino.com"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              className="max-w-sm"
            />
            <Button
              onClick={handleSendTest}
              disabled={isSendingTest}
              variant="outline"
            >
              <Send className="mr-2 h-4 w-4" />
              {isSendingTest ? "Enviando..." : "Enviar Prueba"}
            </Button>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Envía un email de prueba para verificar que la configuración SMTP es
            correcta.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
