import { fetchPricingConfig } from '@/lib/pricing'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function SatinAlPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const pricing = await fetchPricingConfig()
  const memorialPrice = pricing.campaignActive && pricing.campaignMemorial ? pricing.campaignMemorial : pricing.memorialPrice
  const vaultSetup = pricing.campaignActive && pricing.campaignVaultSetup ? pricing.campaignVaultSetup : pricing.vaultSetup
  const vaultMonthly = pricing.campaignActive && pricing.campaignVaultMonthly ? pricing.campaignVaultMonthly : pricing.vaultMonthly

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center px-4 py-16">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-white mb-3">Hangi paketi istiyorsunuz?</h1>
          <p className="text-slate-400 text-sm">Şimdilik havale ile ödeme alıyoruz — 24 saat içinde hesabınız açılır.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Anma Profili */}
          <div className="border border-amber-500/30 bg-slate-900 rounded-2xl p-7 flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-amber-500/15 rounded-xl flex items-center justify-center">
                <span className="text-xl">🕯️</span>
              </div>
              <div>
                <h2 className="font-bold text-lg text-white">Anma Profili</h2>
                <p className="text-xs text-slate-500">Hayatını kaybeden biri için</p>
              </div>
            </div>

            <div className="flex items-baseline gap-1 mb-6">
              {pricing.campaignActive && pricing.campaignMemorial ? (
                <>
                  <span className="text-slate-500 line-through text-sm">{pricing.memorialPrice} ₾</span>
                  <span className="text-3xl font-bold text-amber-400">{pricing.campaignMemorial}</span>
                  <span className="text-slate-400 text-sm">₾ tek seferlik</span>
                </>
              ) : (
                <>
                  <span className="text-3xl font-bold text-amber-400">{pricing.memorialPrice}</span>
                  <span className="text-slate-400 text-sm">₾ tek seferlik</span>
                </>
              )}
            </div>

            <ul className="space-y-2.5 text-sm text-slate-300 flex-1 mb-7">
              {[
                'Kişisel profil sayfası (slug ile)',
                'Biyografi ve yaşam kronolojisi',
                '50 fotoğraf, 10 video',
                'Aile ağacı oluşturma',
                'Ziyaretçi anı defteri',
                'QR mezar taşı entegrasyonu',
                'Ölüm belgesi doğrulaması',
              ].map(f => (
                <li key={f} className="flex items-start gap-2">
                  <span className="text-amber-400 mt-0.5 shrink-0">✓</span>
                  <span>{f}</span>
                </li>
              ))}
              <li className="flex items-start gap-2 opacity-40">
                <span className="text-slate-500 mt-0.5 shrink-0">✗</span>
                <span>Gizli kasa (varis erişimi)</span>
              </li>
            </ul>

            <Link href="/satin-al/anma"
              className="w-full text-center bg-amber-500 hover:bg-amber-400 text-white font-semibold py-3 rounded-xl transition-colors text-sm">
              Anma Profili Satın Al
            </Link>
          </div>

          {/* Yaşam Kasası */}
          <div className="border border-emerald-500/30 bg-slate-900 rounded-2xl p-7 flex flex-col relative overflow-hidden">
            <div className="absolute top-4 right-4 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
              Önerilen
            </div>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-emerald-500/15 rounded-xl flex items-center justify-center">
                <span className="text-xl">🔐</span>
              </div>
              <div>
                <h2 className="font-bold text-lg text-white">Yaşam Kasası</h2>
                <p className="text-xs text-slate-500">Kendiniz için, hayattayken</p>
              </div>
            </div>

            <div className="flex items-baseline gap-1 mb-1">
              {pricing.campaignActive && pricing.campaignVaultSetup ? (
                <>
                  <span className="text-slate-500 line-through text-sm">{pricing.vaultSetup} ₾</span>
                  <span className="text-3xl font-bold text-emerald-400">{pricing.campaignVaultSetup}</span>
                  <span className="text-slate-400 text-sm">₾ kurulum</span>
                </>
              ) : (
                <>
                  <span className="text-3xl font-bold text-emerald-400">{pricing.vaultSetup}</span>
                  <span className="text-slate-400 text-sm">₾ kurulum</span>
                </>
              )}
            </div>
            <p className="text-xs text-slate-500 mb-6">
              + {pricing.campaignActive && pricing.campaignVaultMonthly ? pricing.campaignVaultMonthly : pricing.vaultMonthly} ₾/ay
            </p>

            <ul className="space-y-2.5 text-sm text-slate-300 flex-1 mb-7">
              {[
                'Anma Profili\'nin tüm özellikleri',
                'Gizli kasa (sadece varisler görür)',
                'Vasiyet, belgeler, video mesajlar',
                'Varis yönetimi (e-posta davet)',
                'Ölüm sonrası otomatik yayın seçeneği',
                'Sınırsız depolama',
                'Kimlik doğrulama gerektirmez',
              ].map(f => (
                <li key={f} className="flex items-start gap-2">
                  <span className="text-emerald-400 mt-0.5 shrink-0">✓</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <Link href="/satin-al/kasa"
              className="w-full text-center bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 rounded-xl transition-colors text-sm">
              Yaşam Kasası Satın Al
            </Link>
          </div>
        </div>

        <p className="text-center text-xs text-slate-600 mt-8">
          Ödeme sonrası IBAN bilgilerini göreceksiniz. Havale yaptıktan sonra 24 saat içinde hesabınız aktive edilir.
        </p>
      </div>
    </div>
  )
}
