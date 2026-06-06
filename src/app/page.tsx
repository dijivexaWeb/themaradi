import Link from 'next/link'
import { HeroVault } from '@/components/landing/hero-vault'

export const dynamic = 'force-static'
export const revalidate = 86400

export default function LandingPage() {
  return (
    <div className="bg-[#060e1e] text-slate-100 min-h-screen">
      <Nav />
      <Hero />
      <HowItWorks />
      <Features />
      <Pricing />
      <B2BSection />
      <Footer />
    </div>
  )
}

function Nav() {
  return (
    <nav className="fixed top-0 inset-x-0 z-50 border-b border-white/5 glass">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="font-bold text-xl tracking-tight gradient-text">
          themaradi
        </Link>
        <div className="hidden md:flex items-center gap-8 text-sm text-slate-400">
          <a href="#nasil-calisir" className="hover:text-slate-200 transition-colors">Nasil Calisir</a>
          <a href="#fiyatlar" className="hover:text-slate-200 transition-colors">Fiyatlar</a>
          <a href="#partner" className="hover:text-slate-200 transition-colors">Partner</a>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/login" className="text-sm text-slate-400 hover:text-slate-200 transition-colors px-4 py-2 rounded-lg hover:bg-white/5">
            Giris Yap
          </Link>
          <Link href="/login" className="text-sm bg-amber-500 hover:bg-amber-400 text-white font-semibold px-4 py-2 rounded-xl transition-colors">
            Ucretsiz Basla
          </Link>
        </div>
      </div>
    </nav>
  )
}

function Hero() {
  return (
    <section className="pt-28 pb-20 px-5 sm:px-8 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-amber-500/8 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-32 right-1/4 w-[300px] h-[300px] bg-amber-600/6 rounded-full blur-[80px] pointer-events-none" />

      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium px-3.5 py-1.5 rounded-full mb-8">
              <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
              Erken Erisim — Gurcistan & Kafkasya
            </div>

            <h1 className="text-4xl sm:text-5xl font-bold leading-[1.15] tracking-tight mb-5">
              Anilariniz,{' '}
              <span className="gradient-text">Sesiniz,</span>
              <br />
              <span className="gradient-text">Hikayeniz</span>
              {' '}— Sonsuza Kadar
            </h1>

            <p className="text-lg text-slate-400 leading-relaxed mb-8 max-w-lg">
              Dijital mirasinizi sifreleyerek saklayin, varislere devredin.
              Mezar tasindaki QR ile ani sayfasina ulasim — nesiller boyu.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mb-12">
              <Link href="/login"
                className="flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-white font-semibold px-7 py-3.5 rounded-xl text-sm transition-colors shadow-xl shadow-amber-500/20">
                Kasani Olustur
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <a href="#nasil-calisir"
                className="flex items-center justify-center gap-2 border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white font-medium px-7 py-3.5 rounded-xl text-sm transition-colors">
                Nasil Calisir?
              </a>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {([
                { title: 'AES-256 Sifreleme', sub: 'Askeri duzeyde koruma' },
                { title: 'GDPR Uyumlu', sub: 'AB veri standartlari' },
                { title: '99.9% Uptime', sub: 'Kesintisiz erisim' },
                { title: 'Edge CDN', sub: 'Dunya geneli hizli erisim' },
              ] as const).map(({ title, sub }) => (
                <div key={title} className="flex items-start gap-3 bg-white/[0.03] border border-white/[0.06] rounded-xl p-3">
                  <div className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-1.5 shrink-0" />
                  <div>
                    <div className="text-xs font-semibold text-slate-200">{title}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="hidden lg:block">
            <HeroVault />
          </div>
        </div>
      </div>
    </section>
  )
}

function HowItWorks() {
  const steps = [
    {
      num: '01',
      title: 'Kasani Olustur',
      desc: 'E-posta veya Google ile saniyeler icinde ucretsiz hesap ac. Ilk kasani olustur, temelini at.',
    },
    {
      num: '02',
      title: 'Mirasini Doldur',
      desc: 'Fotograflar, videolar, ses kayitlari, belgeler. Biyografini yaz. Mirasini adim adim birikit.',
    },
    {
      num: '03',
      title: 'Varisleri Belirle',
      desc: 'Guvendigini kisileri varis olarak ekle. Hazir oldugunda tek tusla herkese acik ani sayfasina donusur.',
    },
  ]

  return (
    <section id="nasil-calisir" className="py-24 px-5 sm:px-8 border-t border-white/5">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Nasil Calisir?</h2>
          <p className="text-slate-400 max-w-xl mx-auto text-base">Uc adimda dijital mirasinizi guvenlik altina alin</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {steps.map((step, i) => (
            <div key={step.num} className="relative group">
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-7 left-[calc(100%_-_1.5rem)] w-[calc(100%_-_1rem)] h-px bg-gradient-to-r from-slate-700/80 to-transparent z-0 pointer-events-none" />
              )}
              <div className="relative z-10 border border-white/[0.06] bg-white/[0.02] rounded-2xl p-6 hover:border-amber-500/25 hover:bg-white/[0.03] transition-all">
                <div className="text-3xl font-bold text-white/10 mb-4">{step.num}</div>
                <h3 className="text-base font-semibold text-slate-100 mb-2">{step.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function IconLock() {
  return (
    <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  )
}
function IconQR() {
  return (
    <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
    </svg>
  )
}
function IconLink() {
  return (
    <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
    </svg>
  )
}
function IconShield() {
  return (
    <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  )
}
function IconAI() {
  return (
    <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  )
}
function IconChart() {
  return (
    <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  )
}

function Features() {
  const features = [
    { icon: <IconLock />, title: 'Uctan Uca Sifreleme', desc: 'AES-256-GCM ile sifreleme. Sunucularimiz bile icerigini goremez. Gercek gizlilik.', badge: 'Guvenli' },
    { icon: <IconQR />, title: 'QR Mezar Tasi', desc: 'Mezarlikta 3G ile bile 1 saniyede yuklenen ani sayfasi. PWA offline destegi.', badge: 'Essiz' },
    { icon: <IconLink />, title: 'Dinamik QR', desc: 'Domain degisse, URL yapisi degisse bile QR her zaman calisir. Kalici baglanti.', badge: 'Kalici' },
    { icon: <IconShield />, title: 'Varis Sistemi', desc: 'Executor, katkilci, izleyici rolleri. Sahte olum bildirimlerine 30 gunluk itiraz penceresi.', badge: 'Korumal' },
    { icon: <IconAI />, title: 'AI Etiketleme', desc: 'Yuklenen fotograflar otomatik etiketlenir. Arama, filtreleme, ani kumeleme.', badge: 'Akilli' },
    { icon: <IconChart />, title: 'Ziyaret Analitigi', desc: 'QR okuma sayilari, cografya haritasi, pik saatler. Anma gunu otomatik rapor.', badge: 'Detayli' },
  ]

  return (
    <section className="py-24 px-5 sm:px-8 bg-slate-900/20">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Neden themaradi?</h2>
          <p className="text-slate-400 max-w-xl mx-auto">Gurcistan ve Kafkasya pazarinda ilk ve tek dijital miras platformu</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f) => (
            <div key={f.title}
              className="border border-white/[0.06] bg-white/[0.02] rounded-2xl p-6 hover:border-amber-500/25 hover:bg-white/[0.03] transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 bg-amber-500/10 border border-amber-500/[0.15] rounded-xl flex items-center justify-center">
                  {f.icon}
                </div>
                <span className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/[0.15] px-2 py-0.5 rounded-full">{f.badge}</span>
              </div>
              <h3 className="font-semibold text-slate-100 mb-2">{f.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Pricing() {
  const plans = [
    {
      name: 'Ucretsiz',
      priceLabel: '0 GEL',
      period: 'sonsuza kadar',
      features: ['1 dijital kasa', '1 GB depolama', 'Temel ani ekleme', 'Ani sayfasi'],
      cta: 'Ucretsiz Basla',
      highlight: false,
    },
    {
      name: 'Premium',
      priceLabel: 'Yakinda',
      period: 'yillik',
      features: ['Sinirsiz kasa', '50 GB depolama', 'AI foto etiketleme', 'Ses kaydi destegi', 'Oncelikli destek'],
      cta: 'Erken Erisim Al',
      highlight: true,
    },
    {
      name: 'Omurboyu',
      priceLabel: 'Yakinda',
      period: 'tek seferlik',
      features: ['Tum Premium ozellikler', '100 GB depolama', 'Sifreli depolama', 'Shamir anahtar paylasimi', 'SLA garantisi'],
      cta: 'Listeye Katil',
      highlight: false,
    },
  ]

  return (
    <section id="fiyatlar" className="py-24 px-5 sm:px-8 border-t border-white/5">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Fiyatlandirma</h2>
          <p className="text-slate-400 max-w-xl mx-auto">
            Aylik abonelik yok. Olum baglaminda surekli odeme kaygisi yaratmaz.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {plans.map((plan) => (
            <div key={plan.name} className={`rounded-2xl p-7 border flex flex-col relative ${
              plan.highlight
                ? 'bg-gradient-to-b from-amber-500/[0.08] to-transparent border-amber-500/25'
                : 'border-white/[0.06] bg-white/[0.02]'
            }`}>
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-amber-400 text-white text-xs font-bold px-4 py-1 rounded-full">
                  Onerilen
                </div>
              )}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">{plan.name}</h3>
                <div className="text-3xl font-bold text-slate-100 mb-1">{plan.priceLabel}</div>
                <div className="text-sm text-slate-500">{plan.period}</div>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-slate-300">
                    <svg className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/login" className={`text-center py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                plan.highlight
                  ? 'bg-amber-500 hover:bg-amber-400 text-white'
                  : 'bg-white/[0.05] hover:bg-white/[0.08] text-slate-200 border border-white/[0.08]'
              }`}>
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function B2BSection() {
  return (
    <section id="partner" className="py-24 px-5 sm:px-8 bg-slate-900/20 border-t border-white/5">
      <div className="max-w-4xl mx-auto">
        <div className="border border-amber-500/[0.15] bg-gradient-to-b from-amber-500/[0.05] to-transparent rounded-3xl p-10 sm:p-14 text-center">
          <div className="w-14 h-14 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-7 h-7 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">Mermer Atolyeniz Icin Partner Olun</h2>
          <p className="text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Musterinizin mezar tasina kaziyacaginiz dinamik QR kodu aninda uretin.
            Dijital ani sayfasi hazir olmasa bile mermere baslayabilirsiniz.
          </p>
          <div className="grid sm:grid-cols-3 gap-4 mb-10">
            {[
              { title: 'Aninda QR Uretimi', desc: 'Partner panelinde tek tusla QR olustur' },
              { title: 'Asenkron Eslestirme', desc: 'Uretime hemen basla, aile daha sonra baglar' },
              { title: 'Kalici Baglanti', desc: 'Domain degisse de QR 100 yil calisir' },
            ].map(({ title, desc }) => (
              <div key={title} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 text-left">
                <div className="text-sm font-semibold text-slate-200 mb-1">{title}</div>
                <div className="text-xs text-slate-500">{desc}</div>
              </div>
            ))}
          </div>
          <a href="mailto:partner@themaradi.com"
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm">
            Partner Basvurusu Yap
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="border-t border-white/5 py-12 px-5 sm:px-8">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <div className="font-bold text-lg gradient-text mb-1">themaradi</div>
          <p className="text-xs text-slate-600">Anilar kaybolmaz, sadece bekler.</p>
        </div>
        <div className="flex gap-6 text-sm text-slate-500">
          <Link href="/privacy" className="hover:text-slate-300 transition-colors">Gizlilik</Link>
          <Link href="/terms" className="hover:text-slate-300 transition-colors">Kullanim Sartlari</Link>
          <a href="mailto:info@themaradi.com" className="hover:text-slate-300 transition-colors">Iletisim</a>
        </div>
        <p className="text-xs text-slate-700">2026 themaradi. Tum haklari saklidir.</p>
      </div>
    </footer>
  )
}
