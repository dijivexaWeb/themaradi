import { requireAdmin } from '@/lib/admin/auth'
import { createServiceClient } from '@/lib/supabase/server'
import StatusBadge from '../_components/StatusBadge'
import Link from 'next/link'

interface SearchParams { status?: string; search?: string; page?: string }

export default async function MemorialsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  await requireAdmin()
  const supabase = await createServiceClient()
  const params = await searchParams
  const page = Math.max(1, parseInt(params.page ?? '1'))
  const perPage = 25
  const from = (page - 1) * perPage
  const to = from + perPage - 1

  let query = supabase
    .from('vaults')
    .select('id, display_name, slug, status, qr_code, created_at, profiles!vaults_owner_id_fkey(full_name, email)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (params.status) query = query.eq('status', params.status)
  if (params.search) query = query.ilike('display_name', `%${params.search}%`)

  const { data: vaults, count } = await query

  const totalPages = Math.ceil((count ?? 0) / perPage)

  const statuses = ['hidden_vault', 'pending_verification', 'private_memorial', 'public_memorial', 'suspended']

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tüm Vaultlar</h1>
          <p className="text-slate-500 text-sm mt-1">Toplam: {count ?? 0}</p>
        </div>
        <Link
          href="/admin/memorials/create"
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800 transition-colors"
        >
          + Yeni Memorial
        </Link>
      </div>

      {/* Filters */}
      <form className="flex gap-3 mb-6 flex-wrap">
        <select
          name="status"
          defaultValue={params.status ?? ''}
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white text-slate-700 outline-none focus:border-emerald-400"
        >
          <option value="">Tüm Durumlar</option>
          {statuses.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <input
          name="search"
          defaultValue={params.search ?? ''}
          placeholder="İsim ile ara..."
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
              <th className="text-left px-4 py-3">Vault</th>
              <th className="text-left px-4 py-3">Sahip</th>
              <th className="text-left px-4 py-3">Durum</th>
              <th className="text-left px-4 py-3">QR</th>
              <th className="text-left px-4 py-3">Oluşturulma</th>
              <th className="text-left px-4 py-3">Detay</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {(vaults ?? []).map((v) => {
              const owner = Array.isArray(v.profiles) ? v.profiles[0] : v.profiles
              return (
                <tr key={v.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-800">{v.display_name}</p>
                    <p className="text-xs text-slate-400">/{v.slug ?? '—'}</p>
                    <p className="text-xs text-slate-300">{v.id.slice(0, 8)}…</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-slate-700">{(owner as { full_name?: string })?.full_name ?? '—'}</p>
                    <p className="text-xs text-slate-400">{(owner as { email?: string })?.email ?? '—'}</p>
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={v.status ?? ''} /></td>
                  <td className="px-4 py-3 text-xs text-slate-400">{v.qr_code ?? '—'}</td>
                  <td className="px-4 py-3 text-xs text-slate-400">{new Date(v.created_at).toLocaleDateString('tr-TR')}</td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/memorials/${v.id}`}
                      className="text-xs font-semibold text-emerald-700 hover:underline"
                    >
                      Detay →
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex gap-2 mt-4 justify-center">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`?page=${p}${params.status ? `&status=${params.status}` : ''}${params.search ? `&search=${params.search}` : ''}`}
              className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${p === page ? 'bg-emerald-700 text-white border-emerald-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
