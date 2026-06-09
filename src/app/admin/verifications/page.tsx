import { requireAdmin } from '@/lib/admin/auth'
import { createServiceClient } from '@/lib/supabase/server'
import RejectModal from '../_components/RejectModal'
import ApproveButton from './_ApproveButton'

export default async function VerificationsPage() {
  await requireAdmin()
  const supabase = await createServiceClient()

  const { data: vaults } = await supabase
    .from('vaults')
    .select(`
      id, display_name, slug, created_at, product_type,
      profiles!vaults_owner_id_fkey (full_name, email),
      payments (id, amount, currency, product_type, payment_method, notes, status)
    `)
    .eq('status', 'pending_verification')
    .order('created_at', { ascending: true })

  const now = new Date().getTime()

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Doğrulama Kuyruğu</h1>
        <p className="text-slate-500 text-sm mt-1">Onay bekleyen vault / anma profilleri</p>
      </div>

      {(!vaults || vaults.length === 0) ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-400">
          Kuyruk boş. Tüm doğrulamalar tamamlanmış.
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wide">
              <tr>
                <th className="text-left px-4 py-3">Vault</th>
                <th className="text-left px-4 py-3">Sahip</th>
                <th className="text-left px-4 py-3">Bekliyor</th>
                <th className="text-left px-4 py-3">14 Gün Biter</th>
                <th className="text-left px-4 py-3">Aksiyonlar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {vaults.map((v) => {
                const createdAt = new Date(v.created_at)
                const daysWaiting = Math.floor((now - createdAt.getTime()) / 86400000)
                const deadlineDate = new Date(createdAt.getTime() + 14 * 86400000)
                const daysLeft = Math.max(0, Math.ceil((deadlineDate.getTime() - now) / 86400000))
                const owner = Array.isArray(v.profiles) ? v.profiles[0] : v.profiles

                return (
                  <tr key={v.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-800">{v.display_name}</p>
                      <p className="text-xs text-slate-400">/{v.slug ?? '—'}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-slate-700">{(owner as { full_name?: string })?.full_name ?? '—'}</p>
                      <p className="text-xs text-slate-400">{(owner as { email?: string })?.email ?? '—'}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${daysWaiting > 10 ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'}`}>
                        {daysWaiting} gün
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${daysLeft <= 2 ? 'bg-red-100 text-red-700' : daysLeft <= 5 ? 'bg-yellow-100 text-yellow-700' : 'bg-emerald-100 text-emerald-700'}`}>
                        {daysLeft} gün kaldı
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {(() => {
                        const payment = Array.isArray(v.payments) ? v.payments[0] : (v as unknown as { payments?: { id: string; amount: number; currency: string } }).payments
                        return (
                          <div className="flex items-center gap-2">
                            {payment && <span className="text-sm font-bold text-slate-800">{payment.amount} {payment.currency}</span>}
                            <ApproveButton vaultId={v.id} paymentId={(payment as { id: string } | undefined)?.id} />
                            <RejectModal vaultId={v.id} vaultName={v.display_name} />
                          </div>
                        )
                      })()}
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
