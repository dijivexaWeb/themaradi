import { requireAdmin } from '@/lib/admin/auth'
import { createServiceClient } from '@/lib/supabase/server'
import BulkEmailForm from './_BulkEmailForm'

export default async function BulkEmailPage() {
  await requireAdmin()
  const supabase = await createServiceClient()

  const { data } = await supabase
    .from('platform_settings')
    .select('key, value')
    .in('key', ['email_api_key', 'email_from_name', 'email_from_address'])

  const settings = Object.fromEntries((data ?? []).map((r) => [r.key, r.value]))
  const isConfigured = !!settings.email_api_key

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Toplu Mail</h1>
        <p className="text-slate-500 text-sm mt-1">
          Dış firmalara (örn. mezar taşı üreticileri) iş birliği/duyuru maili gönder — mevcut Resend altyapısını kullanır.
        </p>
      </div>

      {!isConfigured && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Resend API key yapılandırılmamış. Önce <a href="/admin/email" className="underline font-semibold">Email Ayarları</a> sayfasından ekleyin.
        </div>
      )}

      <div className="mb-5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500">
        Gönderen: <strong className="text-slate-700">{settings.email_from_name || 'The Eternal Memory'} &lt;{settings.email_from_address || 'info@theeternalmemory.com'}&gt;</strong>
      </div>

      <BulkEmailForm disabled={!isConfigured} />
    </div>
  )
}
