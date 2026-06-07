import { requireAdmin } from '@/lib/admin/auth'
import { createServiceClient } from '@/lib/supabase/server'
import StatusBadge from '../_components/StatusBadge'
import GdprResolveForm from './_GdprResolveForm'

export default async function GdprPage() {
  await requireAdmin()
  const supabase = await createServiceClient()

  const { data: requests } = await supabase
    .from('gdpr_requests')
    .select('id, email, request_type, status, notes, admin_note, due_date, created_at')
    .order('created_at', { ascending: false })
    .limit(100)

  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">GDPR Talepleri</h1>
        <p className="text-slate-500 text-sm mt-1">Veri silme, dışa aktarma ve düzeltme talepleri · 30 gün SLA</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wide">
            <tr>
              <th className="text-left px-4 py-3">E-posta</th>
              <th className="text-left px-4 py-3">Tür</th>
              <th className="text-left px-4 py-3">Durum</th>
              <th className="text-left px-4 py-3">SLA Son</th>
              <th className="text-left px-4 py-3">Tarih</th>
              <th className="text-left px-4 py-3">Aksiyon</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {(requests ?? []).map((r) => {
              const isOverdue = r.due_date && r.due_date < today && !['completed', 'rejected'].includes(r.status)
              return (
                <tr key={r.id} className={`hover:bg-slate-50 ${isOverdue ? 'bg-red-50' : ''}`}>
                  <td className="px-4 py-3 text-slate-700">{r.email}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      r.request_type === 'delete' ? 'bg-red-100 text-red-700' :
                      r.request_type === 'export' ? 'bg-blue-100 text-blue-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>{r.request_type}</span>
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold ${isOverdue ? 'text-red-600' : 'text-slate-500'}`}>
                      {r.due_date ?? '—'}
                      {isOverdue && ' ⚠ Gecikmiş'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-400">{new Date(r.created_at).toLocaleDateString('tr-TR')}</td>
                  <td className="px-4 py-3">
                    {!['completed', 'rejected'].includes(r.status) && (
                      <GdprResolveForm requestId={r.id} currentStatus={r.status} />
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
