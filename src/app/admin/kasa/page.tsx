import { requireAdmin } from '@/lib/admin/auth'
import { createServiceClient } from '@/lib/supabase/server'
import StatusBadge from '../_components/StatusBadge'
import PaymentStatusForm from './_PaymentStatusForm'

export default async function KasaPage() {
  await requireAdmin()
  const supabase = await createServiceClient()

  const today = new Date().toISOString().split('T')[0]
  const in7Days = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()

  const [
    { data: upcoming },
    { data: overdue },
    { data: allPayments },
    { data: paidThisMonth },
  ] = await Promise.all([
    supabase.from('payments').select('id, amount, currency, product_type, due_date, status, vaults(display_name)').eq('status', 'pending').gte('due_date', today).lte('due_date', in7Days).order('due_date'),
    supabase.from('payments').select('id, amount, currency, product_type, due_date, status, vaults(display_name)').eq('status', 'overdue').order('due_date'),
    supabase.from('payments').select('id, amount, currency, product_type, status, due_date, paid_at, created_at, vaults(display_name)').order('created_at', { ascending: false }).limit(50),
    supabase.from('payments').select('amount').eq('status', 'paid').gte('paid_at', monthStart),
  ])

  const mrr = (allPayments ?? []).filter(p => p.status === 'paid').reduce((s, p) => s + Number(p.amount), 0)
  const monthTotal = (paidThisMonth ?? []).reduce((s, p) => s + Number(p.amount), 0)
  const overdueTotal = (overdue ?? []).reduce((s, p) => s + Number(p.amount), 0)
  const pendingTotal = (upcoming ?? []).reduce((s, p) => s + Number(p.amount), 0)

  const summaryCards = [
    { label: 'Toplam Tahsilat', value: `${mrr.toFixed(2)} GEL`, color: 'border-emerald-200 bg-emerald-50 text-emerald-800' },
    { label: 'Bu Ay Tahsilat', value: `${monthTotal.toFixed(2)} GEL`, color: 'border-blue-200 bg-blue-50 text-blue-800' },
    { label: 'Vadesi Geçmiş', value: `${overdueTotal.toFixed(2)} GEL`, color: 'border-red-200 bg-red-50 text-red-800' },
    { label: '7 Gün İçinde', value: `${pendingTotal.toFixed(2)} GEL`, color: 'border-yellow-200 bg-yellow-50 text-yellow-800' },
  ]

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Kasa / Ödemeler</h1>
        <p className="text-slate-500 text-sm mt-1">Tüm ödeme akışı ve tahsilat takibi</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {summaryCards.map((c) => (
          <div key={c.label} className={`border rounded-xl p-4 ${c.color}`}>
            <p className="text-xs font-medium uppercase tracking-wide opacity-70 mb-2">{c.label}</p>
            <p className="text-2xl font-bold">{c.value}</p>
          </div>
        ))}
      </div>

      {/* Upcoming 7 days */}
      {(upcoming ?? []).length > 0 && (
        <div className="mb-8">
          <h2 className="text-base font-semibold text-slate-800 mb-3">Vadesi Gelenler (7 Gün)</h2>
          <PaymentTable payments={upcoming ?? []} />
        </div>
      )}

      {/* Overdue */}
      {(overdue ?? []).length > 0 && (
        <div className="mb-8">
          <h2 className="text-base font-semibold text-red-700 mb-3">Vadesi Geçmiş</h2>
          <PaymentTable payments={overdue ?? []} showReminder />
        </div>
      )}

      {/* All payments */}
      <div>
        <h2 className="text-base font-semibold text-slate-800 mb-3">Tüm Ödemeler (Son 50)</h2>
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wide">
              <tr>
                <th className="text-left px-4 py-3">Vault</th>
                <th className="text-left px-4 py-3">Tür</th>
                <th className="text-left px-4 py-3">Tutar</th>
                <th className="text-left px-4 py-3">Durum</th>
                <th className="text-left px-4 py-3">Vade</th>
                <th className="text-left px-4 py-3">Durum Değiştir</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(allPayments ?? []).map((p) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-slate-700">{(p.vaults as { display_name?: string })?.display_name ?? '—'}</td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{p.product_type}</td>
                  <td className="px-4 py-3 font-medium">{Number(p.amount).toFixed(2)} {p.currency}</td>
                  <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                  <td className="px-4 py-3 text-xs text-slate-400">{p.due_date ?? '—'}</td>
                  <td className="px-4 py-3">
                    <PaymentStatusForm paymentId={p.id} currentStatus={p.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function PaymentTable({ payments, showReminder = false }: { payments: Record<string, unknown>[]; showReminder?: boolean }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wide">
          <tr>
            <th className="text-left px-4 py-3">Vault</th>
            <th className="text-left px-4 py-3">Tutar</th>
            <th className="text-left px-4 py-3">Vade</th>
            {showReminder && <th className="text-left px-4 py-3">Aksiyon</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {payments.map((p: Record<string, unknown>) => (
            <tr key={p.id as string} className="hover:bg-slate-50">
              <td className="px-4 py-3 text-slate-700">{((p.vaults as Record<string, unknown>)?.display_name as string) ?? '—'}</td>
              <td className="px-4 py-3 font-medium">{Number(p.amount).toFixed(2)} {p.currency as string}</td>
              <td className="px-4 py-3 text-xs text-red-600 font-medium">{p.due_date as string ?? '—'}</td>
              {showReminder && (
                <td className="px-4 py-3">
                  <span className="text-xs text-slate-400 italic">// TODO: Hatırlatma e-postası</span>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
