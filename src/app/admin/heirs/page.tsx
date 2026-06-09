import { requireAdmin } from '@/lib/admin/auth'
import { createServiceClient } from '@/lib/supabase/server'

export default async function HeirsPage() {
  await requireAdmin()
  const supabase = await createServiceClient()

  const { data: heirs } = await supabase
    .from('heirs')
    .select(`
      id, heir_email, access_level, status, created_at,
      vaults!heirs_vault_id_fkey (display_name, owner_id)
    `)
    .eq('status', 'pending')
    .order('created_at', { ascending: true })

  const now = new Date().getTime()

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Bekleyen Varisler</h1>
        <p className="text-slate-500 text-sm mt-1">Daveti henüz kabul etmemiş varisler</p>
      </div>

      {(!heirs || heirs.length === 0) ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-400">
          Bekleyen davet yok.
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wide">
              <tr>
                <th className="text-left px-4 py-3">Varis E-posta</th>
                <th className="text-left px-4 py-3">Vault</th>
                <th className="text-left px-4 py-3">Erişim</th>
                <th className="text-left px-4 py-3">Bekliyor</th>
                <th className="text-left px-4 py-3">Aksiyon</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {heirs.map((h) => {
                const daysWaiting = Math.floor((now - new Date(h.created_at).getTime()) / 86400000)
                const vault = Array.isArray(h.vaults) ? h.vaults[0] : h.vaults
                return (
                  <tr key={h.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-700">{h.heir_email}</td>
                    <td className="px-4 py-3 text-slate-600">{(vault as { display_name?: string })?.display_name ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{h.access_level}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${daysWaiting > 14 ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'}`}>
                        {daysWaiting} gün
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {/* TODO: Email resend infrastructure */}
                      <span className="text-xs text-slate-400 italic">Tekrar davet — yakında</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
