import { requireAdmin } from '@/lib/admin/auth'
import { createServiceClient } from '@/lib/supabase/server'
import GuestbookActions from './_GuestbookActions'

export default async function GuestbookPage() {
  await requireAdmin()
  const supabase = await createServiceClient()

  const { data: entries } = await supabase
    .from('guestbook_entries')
    .select(`id, author_name, author_email, message, relation, status, created_at, vaults!guestbook_entries_vault_id_fkey(display_name, slug)`)
    .eq('status', 'pending')
    .order('created_at', { ascending: true })

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Ziyaretçi Defteri Moderasyonu</h1>
        <p className="text-slate-500 text-sm mt-1">Onay bekleyen mesajlar ({entries?.length ?? 0})</p>
      </div>

      {(!entries || entries.length === 0) ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-400">
          Onay bekleyen mesaj yok.
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wide">
              <tr>
                <th className="text-left px-4 py-3">Yazar</th>
                <th className="text-left px-4 py-3">Memorial</th>
                <th className="text-left px-4 py-3">Mesaj</th>
                <th className="text-left px-4 py-3">Tarih</th>
                <th className="text-left px-4 py-3">Aksiyonlar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {entries.map((e) => {
                const vault = Array.isArray(e.vaults) ? e.vaults[0] : e.vaults
                return (
                  <tr key={e.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-800">{e.author_name}</p>
                      <p className="text-xs text-slate-400">{e.author_email ?? '—'}</p>
                      {e.relation && <p className="text-xs text-slate-400">{e.relation}</p>}
                    </td>
                    <td className="px-4 py-3 text-slate-600 text-xs">
                      {(vault as { display_name?: string })?.display_name ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-600 max-w-xs">
                      <p className="line-clamp-2">{e.message}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400">
                      {new Date(e.created_at).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="px-4 py-3">
                      <GuestbookActions entryId={e.id} />
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
