import { requireAdmin } from '@/lib/admin/auth'
import { createServiceClient } from '@/lib/supabase/server'
import StatusBadge from '../_components/StatusBadge'
import PaymentStatusForm from './_PaymentStatusForm'
import ManualPaymentForm from './_ManualPaymentForm'

export default async function KasaPage() {
  await requireAdmin()
  const supabase = await createServiceClient()

  const today = new Date().toISOString().split('T')[0]
  const in7Days = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()

  const paymentSelect = `
    id, amount, currency, product_type, status, due_date, paid_at, created_at, notes,
    vaults!payments_vault_id_fkey (
      id, display_name, status,
      profiles!vaults_owner_id_fkey (full_name, email)
    )
  `

  const [
    { data: upcoming },
    { data: overdue },
    { data: allPayments },
    { data: paidThisMonth },
    { data: allVaults },
  ] = await Promise.all([
    supabase.from('payments').select(paymentSelect).eq('status', 'pending').gte('due_date', today).lte('due_date', in7Days).order('due_date'),
    supabase.from('payments').select(paymentSelect).eq('status', 'overdue').order('due_date'),
    supabase.from('payments').select(paymentSelect).order('created_at', { ascending: false }).limit(100),
    supabase.from('payments').select('amount').eq('status', 'paid').gte('paid_at', monthStart),
    // For manual payment form — vault list with owner info
    supabase.from('vaults').select('id, display_name, owner_id, profiles!vaults_owner_id_fkey(full_name, email)').order('created_at', { ascending: false }).limit(200),
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

  // Normalize vault list for the form dropdown
  const vaultList = (allVaults ?? []).map((v) => {
    const owner = Array.isArray(v.profiles) ? v.profiles[0] : v.profiles
    return {
      id: v.id,
      display_name: v.display_name,
      owner_email: (owner as { email?: string })?.email ?? '',
      owner_name: (owner as { full_name?: string })?.full_name ?? '',
    }
  })

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Kasa / Ödemeler</h1>
          <p className="text-slate-500 text-sm mt-1">Tüm ödeme akışı ve tahsilat takibi</p>
        </div>
        <ManualPaymentForm vaults={vaultList} />
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
          <h2 className="text-base font-semibold text-yellow-700 mb-3">⚠ Vadesi Gelenler (7 Gün)</h2>
          <PaymentFullTable payments={upcoming ?? []} />
        </div>
      )}

      {/* Overdue */}
      {(overdue ?? []).length > 0 && (
        <div className="mb-8">
          <h2 className="text-base font-semibold text-red-700 mb-3">🔴 Vadesi Geçmiş</h2>
          <PaymentFullTable payments={overdue ?? []} />
        </div>
      )}

      {/* All payments */}
      <div>
        <h2 className="text-base font-semibold text-slate-800 mb-3">Tüm Ödemeler (Son 100)</h2>
        <PaymentFullTable payments={allPayments ?? []} showStatusForm />
      </div>
    </div>
  )
}

type PaymentRow = {
  id: string
  amount: number
  currency: string
  product_type: string
  status: string
  due_date: string | null
  paid_at: string | null
  notes: string | null
  vaults: {
    id: string
    display_name: string
    status: string
    profiles: { full_name: string | null; email: string | null } | { full_name: string | null; email: string | null }[]
  } | null
}

function PaymentFullTable({
  payments,
  showStatusForm = false,
}: {
  payments: PaymentRow[]
  showStatusForm?: boolean
}) {
  if (payments.length === 0) {
    return <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-400 text-sm">Kayıt yok.</div>
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wide">
          <tr>
            <th className="text-left px-4 py-3">Kullanıcı</th>
            <th className="text-left px-4 py-3">Vault</th>
            <th className="text-left px-4 py-3">Tür</th>
            <th className="text-left px-4 py-3">Tutar</th>
            <th className="text-left px-4 py-3">Durum</th>
            <th className="text-left px-4 py-3">Vade / Ödeme</th>
            {showStatusForm && <th className="text-left px-4 py-3">Güncelle</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {payments.map((p) => {
            const vault = p.vaults
            const ownerRaw = vault?.profiles
            const owner = Array.isArray(ownerRaw) ? ownerRaw[0] : ownerRaw

            return (
              <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3">
                  <p className="font-medium text-slate-800">{owner?.full_name ?? '—'}</p>
                  <p className="text-xs text-slate-400">{owner?.email ?? '—'}</p>
                </td>
                <td className="px-4 py-3">
                  <p className="text-slate-700">{vault?.display_name ?? '—'}</p>
                  {vault?.status && (
                    <span className="text-xs text-slate-400">{vault.status}</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                    {p.product_type}
                  </span>
                </td>
                <td className="px-4 py-3 font-semibold text-slate-800">
                  {Number(p.amount).toFixed(2)} {p.currency}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={p.status} />
                </td>
                <td className="px-4 py-3 text-xs text-slate-500">
                  {p.paid_at ? (
                    <span className="text-emerald-600">Ödendi: {new Date(p.paid_at).toLocaleDateString('tr-TR')}</span>
                  ) : p.due_date ? (
                    <span className={new Date(p.due_date) < new Date() ? 'text-red-600 font-semibold' : ''}>
                      Vade: {p.due_date}
                    </span>
                  ) : '—'}
                  {p.notes && <p className="text-slate-400 mt-0.5 italic truncate max-w-[140px]">{p.notes}</p>}
                </td>
                {showStatusForm && (
                  <td className="px-4 py-3">
                    <PaymentStatusForm paymentId={p.id} currentStatus={p.status} />
                  </td>
                )}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
