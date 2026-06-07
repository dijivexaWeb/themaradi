import { requireAdmin } from '@/lib/admin/auth'
import { createServiceClient } from '@/lib/supabase/server'
import StatusBadge from '../_components/StatusBadge'
import ObjectionResolveForm from './_ObjectionResolveForm'

export default async function ObjectionsPage() {
  await requireAdmin()
  const supabase = await createServiceClient()

  const { data: objections } = await supabase
    .from('claim_objections')
    .select(`
      id, objector_name, objector_email, objector_phone, reason, evidence_url, status, created_at,
      death_claims!claim_objections_claim_id_fkey (vault_id, vaults(display_name))
    `)
    .in('status', ['pending', 'reviewed'])
    .order('created_at', { ascending: true })

  const now = Date.now()

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">İtirazlar</h1>
        <p className="text-slate-500 text-sm mt-1">Vefat talebi itirazları</p>
      </div>

      {(!objections || objections.length === 0) ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-400">
          Aktif itiraz yok.
        </div>
      ) : (
        <div className="space-y-4">
          {objections.map((o) => {
            const daysOpen = Math.floor((now - new Date(o.created_at).getTime()) / 86400000)
            const claim = Array.isArray(o.death_claims) ? o.death_claims[0] : o.death_claims
            const vaultName = (claim as { vaults?: { display_name?: string } })?.vaults?.display_name ?? '—'

            return (
              <div key={o.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="font-semibold text-slate-800">{o.objector_name}</p>
                    <p className="text-sm text-slate-500">{o.objector_email} {o.objector_phone ? `· ${o.objector_phone}` : ''}</p>
                    <p className="text-xs text-slate-400 mt-1">Vault: {vaultName}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${daysOpen > 7 ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'}`}>
                      {daysOpen} gün açık
                    </span>
                    <StatusBadge status={o.status} />
                  </div>
                </div>

                <div className="bg-slate-50 rounded-lg p-3 text-sm text-slate-700 mb-4">
                  {o.reason}
                </div>

                {o.evidence_url && (
                  <a href={o.evidence_url} target="_blank" rel="noopener noreferrer" className="text-xs text-emerald-700 hover:underline block mb-4">
                    Belgeyi Görüntüle →
                  </a>
                )}

                <ObjectionResolveForm objectionId={o.id} />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
