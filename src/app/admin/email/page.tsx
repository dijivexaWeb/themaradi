import { requireAdmin } from '@/lib/admin/auth'
import { createServiceClient } from '@/lib/supabase/server'
import EmailSettingsForm from './_EmailSettingsForm'

export default async function EmailSettingsPage() {
  await requireAdmin()
  const supabase = await createServiceClient()

  const { data } = await supabase
    .from('platform_settings')
    .select('key, value')
    .in('key', [
      'email_api_key',
      'email_from_address',
      'email_from_name',
      'email_notify_new_guestbook',
      'email_notify_approved',
    ])

  const settings = Object.fromEntries((data ?? []).map((r) => [r.key, r.value]))

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[#1f2d27]">Email Ayarları</h1>
        <p className="mt-1 text-sm text-[#788177]">Transaksiyonel email (Resend) yapılandırması</p>
      </div>
      <EmailSettingsForm settings={settings} />
    </div>
  )
}
