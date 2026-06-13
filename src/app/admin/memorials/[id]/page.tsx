import { requireAdmin } from '@/lib/admin/auth'
import { createServiceClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import StatusBadge from '../../_components/StatusBadge'
import VaultStatusForm from './_VaultStatusForm'
import NotableForm from './_NotableForm'
import Link from 'next/link'

export default async function VaultDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin()
  const supabase = await createServiceClient()
  const { id } = await params

  const [{ data: vault }, { data: heirs }, { data: payments }] = await Promise.all([
    supabase.from('vaults').select('*, profiles!vaults_owner_id_fkey(full_name, email)').eq('id', id).single(),
    supabase.from('heirs').select('id, heir_email, access_level, status, created_at, accepted_at, death_confirmed_at').eq('vault_id', id),
    supabase.from('payments').select('id, amount, currency, status, product_type, due_date, paid_at').eq('vault_id', id).order('created_at', { ascending: false }),
  ])

  if (!vault) notFound()

  const owner = Array.isArray(vault.profiles) ? vault.profiles[0] : vault.profiles

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Link href="/admin/memorials" className="text-xs text-slate-400 hover:text-slate-700">← Memoriallar</Link>
        <span className="text-slate-300">/</span>
        <h1 className="text-xl font-bold text-slate-900">{vault.display_name}</h1>
        <StatusBadge status={vault.status ?? ''} />
        <Link
          href={`/admin/memorials/${vault.id}/preview`}
          target="_blank"
          rel="noreferrer"
          className="ml-auto inline-flex items-center rounded-lg bg-emerald-700 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-800"
        >
          Modern Önizleme
        </Link>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Vault Info */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <h2 className="font-semibold text-slate-800 mb-4">Vault Bilgileri</h2>
          <dl className="space-y-2 text-sm">
            {[
              ['ID', vault.id],
              ['Slug', vault.slug ?? '—'],
              ['QR Kodu', vault.qr_code ?? '—'],
              ['Biyografi', vault.biography ? vault.biography.slice(0, 80) + '...' : '—'],
              ['Doğum', vault.birth_date ?? '—'],
              ['Vefat', vault.death_date ?? '—'],
              ['Mezarlık', vault.cemetery_name ?? '—'],
              ['Oluşturulma', new Date(vault.created_at).toLocaleString('tr-TR')],
            ].map(([label, value]) => (
              <div key={label} className="flex gap-2">
                <dt className="text-slate-400 w-28 shrink-0">{label}</dt>
                <dd className="text-slate-700 break-all">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Owner Info + Status Change */}
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <h2 className="font-semibold text-slate-800 mb-4">Vault Sahibi</h2>
            <dl className="space-y-2 text-sm">
              <div className="flex gap-2"><dt className="text-slate-400 w-24">Ad Soyad</dt><dd className="text-slate-700">{(owner as { full_name?: string })?.full_name ?? '—'}</dd></div>
              <div className="flex gap-2"><dt className="text-slate-400 w-24">E-posta</dt><dd className="text-slate-700">{(owner as { email?: string })?.email ?? '—'}</dd></div>
            </dl>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <h2 className="font-semibold text-slate-800 mb-3">Durum Değiştir</h2>
            <VaultStatusForm vaultId={vault.id} currentStatus={vault.status ?? ''} />
          </div>
        </div>
      </div>

      {/* Heirs */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm mb-6">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-800">Varisler ({heirs?.length ?? 0})</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
            <tr>
              <th className="text-left px-4 py-2">E-posta</th>
              <th className="text-left px-4 py-2">Erişim</th>
              <th className="text-left px-4 py-2">Durum</th>
              <th className="text-left px-4 py-2">Vefat Onayı</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {(heirs ?? []).map((h) => (
              <tr key={h.id} className="hover:bg-slate-50">
                <td className="px-4 py-2">{h.heir_email}</td>
                <td className="px-4 py-2 text-xs text-slate-500">{h.access_level}</td>
                <td className="px-4 py-2"><StatusBadge status={h.status} /></td>
                <td className="px-4 py-2 text-xs text-slate-400">{h.death_confirmed_at ? new Date(h.death_confirmed_at).toLocaleDateString('tr-TR') : '—'}</td>
              </tr>
            ))}
            {(heirs ?? []).length === 0 && <tr><td colSpan={4} className="px-4 py-4 text-center text-slate-400">Varis yok</td></tr>}
          </tbody>
        </table>
      </div>

      {/* Notable Profile */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm mb-6">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
          <span>🏛</span>
          <h2 className="font-semibold text-slate-800">Ulusal Miras Profili</h2>
          {vault.is_notable && (
            <span className="ml-auto rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 uppercase tracking-wide">Aktif</span>
          )}
        </div>
        <div className="p-5">
          <NotableForm
            vaultId={vault.id}
            initial={{
              is_notable: vault.is_notable ?? false,
              nationality: vault.nationality ?? null,
              notable_subtitle: vault.notable_subtitle ?? null,
              notable_motto: vault.notable_motto ?? null,
              notable_motto_tr: vault.notable_motto_tr ?? null,
              featured_quote: vault.featured_quote ?? null,
              notable_legacy_text: vault.notable_legacy_text ?? null,
              notable_verified_note: vault.notable_verified_note ?? null,
            }}
          />
        </div>
      </div>

      {/* Payments */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-800">Ödeme Geçmişi</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
            <tr>
              <th className="text-left px-4 py-2">Tür</th>
              <th className="text-left px-4 py-2">Tutar</th>
              <th className="text-left px-4 py-2">Durum</th>
              <th className="text-left px-4 py-2">Vade</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {(payments ?? []).map((p) => (
              <tr key={p.id} className="hover:bg-slate-50">
                <td className="px-4 py-2 text-xs text-slate-500">{p.product_type}</td>
                <td className="px-4 py-2 font-medium">{Number(p.amount).toFixed(2)} {p.currency}</td>
                <td className="px-4 py-2"><StatusBadge status={p.status} /></td>
                <td className="px-4 py-2 text-xs text-slate-400">{p.due_date ?? '—'}</td>
              </tr>
            ))}
            {(payments ?? []).length === 0 && <tr><td colSpan={4} className="px-4 py-4 text-center text-slate-400">Ödeme kaydı yok</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
