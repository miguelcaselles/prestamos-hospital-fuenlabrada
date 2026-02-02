import { getSmtpSettings } from "@/actions/settings-actions"
import { SmtpSettingsForm } from "@/components/settings/smtp-form"

export default async function ConfiguracionPage() {
  const settings = await getSmtpSettings()

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
        <p className="text-sm text-gray-500 mt-1">
          Configuración del sistema de envío de emails
        </p>
      </div>

      <SmtpSettingsForm settings={settings} />
    </div>
  )
}
