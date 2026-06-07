import { requireAdmin } from '@/lib/admin/auth'
import { createServiceClient } from '@/lib/supabase/server'
import PricingSettingsForm from './_PricingSettingsForm'
import ExemptionForm from './_ExemptionForm'
import BankSettingsForm from './_BankSettingsForm'
import PaymentGatewayForm from './_PaymentGatewayForm'

export default async function SettingsPage() {
  await requireAdmin()
  const supabase = await createServiceClient()

  const [{ data: settings }, { data: exemptions }, { data: vaults }] = await Promise.all([
    supabase.from('platform_settings').select('key, value, label').order('key'),
    supabase
      .from('pricing_exemptions')
      .select(`
        id, reason, exemption_type, discount_percent, granted_at, expires_at, notes,
        vaults!pricing_exemptions_vault_id_fkey (display_name),
        profiles!pricing_exemptions_user_id_fkey (full_name, email)
      `)
      .order('granted_at', { ascending: false })
      .limit(50),
    supabase
      .from('vaults')
      .select('id, display_name, owner_id, profiles!vaults_owner_id_fkey(full_name, email)')
      .order('created_at', { ascending: false })
      .limit(200),
  ])

  const s = Object.fromEntries((settings ?? []).map((r) => [r.key, r.value]))

  const vaultList = (vaults ?? []).map((v) => {
    const owner = Array.isArray(v.profiles) ? v.profiles[0] : v.profiles
    return {
      id: v.id,
      display_name: v.display_name,
      owner_id: v.owner_id,
      owner_email: (owner as { email?: string })?.email ?? '',
      owner_name: (owner as { full_name?: string })?.full_name ?? '',
    }
  })

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Fiyat & Kampanya Yönetimi</h1>
        <p className="text-slate-500 text-sm mt-1">Fiyatları güncelle, kampanya aç/kapat, ücretsiz muafiyet ver</p>
      </div>

      {/* Pricing */}
      <section>
        <h2 className="text-base font-semibold text-slate-700 mb-4 flex items-center gap-2">
          <span className="h-5 w-1 rounded bg-emerald-500" />
          Fiyatlar (GEL)
        </h2>
        <PricingSettingsForm settings={s} />
      </section>

      {/* Bank Settings */}
      <section>
        <h2 className="text-base font-semibold text-slate-700 mb-4 flex items-center gap-2">
          <span className="h-5 w-1 rounded bg-blue-500" />
          Banka Havale Bilgileri
        </h2>
        <p className="text-slate-500 text-xs mb-4">Satın alma sayfasında gösterilen IBAN ve banka bilgileri. Değişiklik anlık olarak yansır.</p>
        <BankSettingsForm settings={s} />
      </section>

      {/* Payment Gateway */}
      <section>
        <h2 className="text-base font-semibold text-slate-700 mb-4 flex items-center gap-2">
          <span className="h-5 w-1 rounded bg-violet-500" />
          Ödeme Entegrasyonu (Kartla Ödeme)
        </h2>
        <p className="text-slate-500 text-xs mb-4">
          PayBall, Stripe veya diğer sağlayıcılar için API anahtarları. Sağlayıcı seçilip aktif edilene kadar satın alma sayfasında "Çok Yakında" gösterilmeye devam eder.
        </p>
        <PaymentGatewayForm settings={s} />
      </section>

      {/* Exemptions */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-slate-700 flex items-center gap-2">
            <span className="h-5 w-1 rounded bg-purple-500" />
            Ücretsiz / İndirimli Muafiyetler
          </h2>
          <ExemptionForm vaults={vaultList} />
        </div>

        {(exemptions ?? []).length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-400 text-sm">
            Henüz muafiyet kaydı yok.
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wide">
                <tr>
                  <th className="text-left px-4 py-3">Kullanıcı / Vault</th>
                  <th className="text-left px-4 py-3">Tür</th>
                  <th className="text-left px-4 py-3">Sebep</th>
                  <th className="text-left px-4 py-3">Tarih</th>
                  <th className="text-left px-4 py-3">Bitiş</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(exemptions ?? []).map((ex) => {
                  const vault = ex.vaults as { display_name?: string } | null
                  const profile = Array.isArray(ex.profiles) ? ex.profiles[0] : ex.profiles as { full_name?: string; email?: string } | null
                  return (
                    <tr key={ex.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-800">{profile?.full_name ?? profile?.email ?? '—'}</p>
                        <p className="text-xs text-slate-400">{vault?.display_name ?? '—'}</p>
                      </td>
                      <td className="px-4 py-3">
                        {ex.exemption_type === 'free' ? (
                          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-semibold">Ücretsiz</span>
                        ) : (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold">%{ex.discount_percent} İndirim</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-600 max-w-[180px] truncate">{ex.reason}</td>
                      <td className="px-4 py-3 text-xs text-slate-400">
                        {new Date(ex.granted_at).toLocaleDateString('tr-TR')}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-400">
                        {ex.expires_at ? new Date(ex.expires_at).toLocaleDateString('tr-TR') : 'Süresiz'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
