import { requireAdmin } from '@/lib/admin/auth'
import { createServiceClient } from '@/lib/supabase/server'
import StatusBadge from '../_components/StatusBadge'
import UserRoleForm from './_UserRoleForm'
import BanUserButton from './_BanUserButton'

export default async function UsersPage() {
  await requireAdmin()
  const supabase = await createServiceClient()

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name, email, role, created_at')
    .order('created_at', { ascending: false })
    .limit(100)

  // Get vault counts per user
  const { data: vaultCounts } = await supabase
    .from('vaults')
    .select('owner_id')

  const countMap: Record<string, number> = {}
  for (const v of vaultCounts ?? []) {
    countMap[v.owner_id] = (countMap[v.owner_id] ?? 0) + 1
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Kullanıcılar</h1>
        <p className="text-slate-500 text-sm mt-1">{profiles?.length ?? 0} kullanıcı</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wide">
            <tr>
              <th className="text-left px-4 py-3">Kullanıcı</th>
              <th className="text-left px-4 py-3">Rol</th>
              <th className="text-left px-4 py-3">Vault Sayısı</th>
              <th className="text-left px-4 py-3">Kayıt Tarihi</th>
              <th className="text-left px-4 py-3">Aksiyonlar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {(profiles ?? []).map((p) => (
              <tr key={p.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <p className="font-medium text-slate-800">{p.full_name ?? '—'}</p>
                  <p className="text-xs text-slate-400">{p.email ?? '—'}</p>
                  <p className="text-xs text-slate-300">{p.id.slice(0, 8)}…</p>
                </td>
                <td className="px-4 py-3"><StatusBadge status={p.role ?? 'user'} /></td>
                <td className="px-4 py-3 text-slate-600">{countMap[p.id] ?? 0}</td>
                <td className="px-4 py-3 text-xs text-slate-400">{new Date(p.created_at).toLocaleDateString('tr-TR')}</td>
                <td className="px-4 py-3 flex gap-2 items-center">
                  <UserRoleForm userId={p.id} currentRole={p.role ?? 'user'} />
                  <BanUserButton userId={p.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
