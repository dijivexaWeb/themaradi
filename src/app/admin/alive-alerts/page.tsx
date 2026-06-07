import { requireAdmin } from '@/lib/admin/auth'
import { createServiceClient } from '@/lib/supabase/server'
import StatusBadge from '../_components/StatusBadge'
import AliveAlertForm from './_AliveAlertForm'

export default async function AliveAlertsPage() {
  await requireAdmin()
  const supabase = await createServiceClient()

  const { data: alerts } = await supabase
    .from('alive_alerts')
    .select(`id, reporter_name, reporter_email, reporter_phone, message, status, admin_note, created_at, vaults!alive_alerts_vault_id_fkey(display_name, slug)`)
    .in('status', ['open', 'investigating'])
    .order('created_at', { ascending: true })

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Ben Yaşıyorum Bildirimleri</h1>
        <p className="text-slate-500 text-sm mt-1">Kişinin hâlâ hayatta olduğunu bildiren talepler</p>
      </div>

      {(!alerts || alerts.length === 0) ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-400">
          Aktif bildirim yok.
        </div>
      ) : (
        <div className="space-y-4">
          {alerts.map((a) => {
            const vault = Array.isArray(a.vaults) ? a.vaults[0] : a.vaults
            return (
              <div key={a.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="font-semibold text-slate-800">{a.reporter_name}</p>
                    <p className="text-sm text-slate-500">{a.reporter_email} {a.reporter_phone ? `· ${a.reporter_phone}` : ''}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Vault: {(vault as { display_name?: string })?.display_name ?? 'Bağlı değil'}
                      {(vault as { slug?: string })?.slug && ` (/${(vault as { slug: string }).slug})`}
                    </p>
                    <p className="text-xs text-slate-300">{new Date(a.created_at).toLocaleString('tr-TR')}</p>
                  </div>
                  <StatusBadge status={a.status} />
                </div>

                {a.message && (
                  <div className="bg-slate-50 rounded-lg p-3 text-sm text-slate-700 mb-4">
                    {a.message}
                  </div>
                )}

                {a.admin_note && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800 mb-4">
                    Admin notu: {a.admin_note}
                  </div>
                )}

                <AliveAlertForm alertId={a.id} currentStatus={a.status} />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
