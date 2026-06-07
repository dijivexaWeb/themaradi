import { requireAdmin } from '@/lib/admin/auth'
import { createServiceClient } from '@/lib/supabase/server'

interface SearchParams { admin?: string; action?: string; from?: string; to?: string }

export default async function AuditPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  await requireAdmin()
  const supabase = await createServiceClient()
  const params = await searchParams

  let query = supabase
    .from('admin_audit_logs')
    .select('id, admin_email, action, entity_type, entity_id, old_value, new_value, created_at')
    .order('created_at', { ascending: false })
    .limit(200)

  if (params.admin) query = query.ilike('admin_email', `%${params.admin}%`)
  if (params.action) query = query.ilike('action', `%${params.action}%`)
  if (params.from) query = query.gte('created_at', params.from)
  if (params.to) query = query.lte('created_at', params.to + 'T23:59:59Z')

  const { data: logs } = await query

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Audit Log</h1>
        <p className="text-slate-500 text-sm mt-1">Tüm admin aksiyonlarının denetim kaydı (salt okunur)</p>
      </div>

      {/* Filters */}
      <form className="flex gap-3 mb-6 flex-wrap">
        <input
          name="admin"
          defaultValue={params.admin ?? ''}
          placeholder="Admin e-posta..."
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white text-slate-700 outline-none focus:border-emerald-400"
        />
        <input
          name="action"
          defaultValue={params.action ?? ''}
          placeholder="Aksiyon..."
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white text-slate-700 outline-none focus:border-emerald-400"
        />
        <input
          type="date"
          name="from"
          defaultValue={params.from ?? ''}
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white text-slate-700 outline-none focus:border-emerald-400"
        />
        <input
          type="date"
          name="to"
          defaultValue={params.to ?? ''}
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white text-slate-700 outline-none focus:border-emerald-400"
        />
        <button type="submit" className="px-4 py-2 text-sm font-semibold bg-emerald-700 text-white rounded-lg hover:bg-emerald-800 transition-colors">
          Filtrele
        </button>
      </form>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wide">
            <tr>
              <th className="text-left px-4 py-3">Tarih</th>
              <th className="text-left px-4 py-3">Admin</th>
              <th className="text-left px-4 py-3">Aksiyon</th>
              <th className="text-left px-4 py-3">Entity</th>
              <th className="text-left px-4 py-3">Değişiklik</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {(logs ?? []).length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400">Kayıt yok</td></tr>
            )}
            {(logs ?? []).map((l) => (
              <tr key={l.id} className="hover:bg-slate-50 text-xs">
                <td className="px-4 py-2.5 text-slate-400 whitespace-nowrap">
                  {new Date(l.created_at).toLocaleString('tr-TR')}
                </td>
                <td className="px-4 py-2.5 text-slate-600">{l.admin_email}</td>
                <td className="px-4 py-2.5">
                  <span className="font-mono bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-xs">{l.action}</span>
                </td>
                <td className="px-4 py-2.5 text-slate-500">
                  {l.entity_type} {l.entity_id ? <span className="text-slate-300">#{l.entity_id.slice(0, 8)}</span> : ''}
                </td>
                <td className="px-4 py-2.5 font-mono text-slate-400 max-w-xs truncate">
                  {l.new_value ? JSON.stringify(l.new_value).slice(0, 80) : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
