import Link from 'next/link'

export const dynamic = 'force-static'
export const revalidate = 86400

export default function LandingPage() {
  return (
    <div className="bg-[#060e1e] text-slate-100 min-h-screen overflow-x-hidden">
      <Nav />
      <Hero />
      <TrustBar />
      <HowItWorks />
      <ProductPreview />
      <Features />
      <Testimonials />
      <Pricing />
      <FAQ />
      <FinalCTA />
      <Footer />
    </div>
  )
}

function Nav() {
  return (
    <nav className="fixed top-0 inset-x-0 z-50 border-b border-white/[0.06]" style={{ background: 'rgba(6,14,30,0.92)', backdropFilter: 'blur(20px)' }}>
      <div className="max-w-6xl mx-auto px-5 sm:px-8 h-15 flex items-center justify-between" style={{ height: '60px' }}>
        <Link href="/" className="font-bold text-xl tracking-tight gradient-text">themaradi</Link>
        <div className="hidden md:flex items-center gap-7 text-sm text-slate-400">
          <a href="#nasil-calisir" className="hover:text-slate-200 transition-colors">Nasil Calisir</a>
          <a href="#ozellikler" className="hover:text-slate-200 transition-colors">Ozellikler</a>
          <a href="#fiyatlar" className="hover:text-slate-200 transition-colors">Fiyatlar</a>
          <a href="#sss" className="hover:text-slate-200 transition-colors">SSS</a>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/login" className="text-sm text-slate-400 hover:text-slate-200 px-4 py-2 rounded-lg hover:bg-white/5 transition-all">Giris Yap</Link>
          <Link href="/login" className="text-sm bg-amber-500 hover:bg-amber-400 text-white font-semibold px-4 py-2 rounded-xl transition-colors shadow-lg shadow-amber-500/20">Ucretsiz Basla</Link>
        </div>
      </div>
    </nav>
  )
}

function Hero() {
  return (
    <section className="pt-32 pb-20 px-5 sm:px-8 relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(ellipse, rgba(245,158,11,0.06) 0%, transparent 70%)' }} />

      <div className="max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 border border-amber-500/20 bg-amber-500/8 text-amber-400 text-xs font-medium px-4 py-1.5 rounded-full mb-8">
          <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
          Gurcistan ve Kafkasya icin tasarlandi
        </div>

        <h1 className="text-4xl sm:text-6xl font-bold leading-[1.1] tracking-tight mb-6">
          Sevdiklerinizin Hatirasi{' '}
          <span className="gradient-text">Sonsuza Kadar</span>{' '}
          Yasasın
        </h1>

        <p className="text-xl text-slate-400 leading-relaxed mb-4 max-w-2xl mx-auto">
          Fotograflar, hikayeler, sesler, videolar — hepsini guvenle saklayin.
          Hazir oldugunuzda ailenize birakin. Mezar tasindaki QR ile her zaman ulasılabilir.
        </p>

        <p className="text-base text-slate-500 mb-10 max-w-xl mx-auto">
          Bir gun hepimiz gidecegiz. Ama hikayeniz kalabilir.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-12">
          <Link href="/login"
            className="flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-white font-bold px-8 py-4 rounded-xl text-base transition-colors shadow-2xl shadow-amber-500/25">
            Kasami Ucretsiz Olustur
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
          <a href="#nasil-calisir"
            className="flex items-center justify-center gap-2 border border-white/10 hover:border-white/20 text-slate-300 hover:text-white font-medium px-8 py-4 rounded-xl text-base transition-all hover:bg-white/5">
            Nasil Calisir?
          </a>
        </div>

        <div className="flex items-center justify-center gap-6 text-sm text-slate-500">
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Kredi karti gerekmez
          </span>
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            2 dakikada kurulum
          </span>
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Sonsuza kadar ucretsiz plan
          </span>
        </div>
      </div>
    </section>
  )
}

function TrustBar() {
  const items = [
    { label: 'AES-256 Sifreleme', icon: '🔐' },
    { label: 'GDPR Uyumlu', icon: '🛡️' },
    { label: 'Vercel Edge CDN', icon: '⚡' },
    { label: '99.9% Uptime SLA', icon: '✅' },
    { label: 'Supabase Altyapisi', icon: '🗄️' },
    { label: 'QR Mezar Tasi', icon: '🪦' },
  ]
  return (
    <div className="border-y border-white/[0.05] bg-white/[0.015]">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-4">
        <div className="flex items-center justify-between gap-4 overflow-x-auto no-scrollbar">
          {items.map(({ label, icon }) => (
            <div key={label} className="flex items-center gap-2 text-sm text-slate-500 whitespace-nowrap">
              <span>{icon}</span>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function HowItWorks() {
  const steps = [
    {
      num: '01',
      title: 'Ucretsiz Kayit Ol',
      desc: 'E-posta veya Google ile 2 dakikada hesap ac. Kredi karti istenmez, baglayici sozlesme yok.',
      detail: 'Aninda erisim, aninda baslangic.',
    },
    {
      num: '02',
      title: 'Kasani Doldur',
      desc: 'Fotograflar, videolar, ses kayitlari yukle. Biyografi yaz. Belgeler ekle. Istedigin kadar zaman al.',
      detail: 'Her sey sifreli, sadece sen gorursun.',
    },
    {
      num: '03',
      title: 'Varislerini Belirle',
      desc: 'Guvendigin kisileri ekle — sana bir sey olunca kasa onlara devredilsin. Sen istediginde de acabilirsin.',
      detail: '30 gunluk itiraz penceresi sahte bildirimlere karsi korur.',
    },
    {
      num: '04',
      title: 'QR ile Olumsuzu Yasatir',
      desc: 'Mezar tasina kazınan QR kodu, ziyaretcileri anı sayfasina yonlendirir. Fotograflar, hikayeler, sesler — hepsi orada.',
      detail: 'Domain degisse de QR calismaya devam eder.',
    },
  ]

  return (
    <section id="nasil-calisir" className="py-24 px-5 sm:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className="text-xs font-semibold text-amber-400 uppercase tracking-widest mb-3">Nasil Calisir</div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Dort Adimda Dijital Miras</h2>
          <p className="text-slate-400 max-w-xl mx-auto">Karmasik bir sey yok. Basit, guvenli, kalici.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {steps.map((step) => (
            <div key={step.num} className="relative border border-white/[0.06] bg-white/[0.02] rounded-2xl p-6">
              <div className="text-4xl font-black text-white/[0.06] mb-4 leading-none">{step.num}</div>
              <h3 className="font-semibold text-slate-100 mb-2">{step.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-3">{step.desc}</p>
              <p className="text-xs text-amber-400/70 font-medium">{step.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function ProductPreview() {
  return (
    <section className="py-16 px-5 sm:px-8 bg-white/[0.01] border-y border-white/[0.04]">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <div className="text-xs font-semibold text-amber-400 uppercase tracking-widest mb-3">Urun Onizleme</div>
          <h2 className="text-3xl font-bold mb-3">Ani Sayfasi Gercekten Boyle Gorunuyor</h2>
          <p className="text-slate-400 max-w-xl mx-auto text-sm">QR kodu okutan ziyaretci bunu gorur — sayfan hazir oldugunda sen yayinlarsin</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Dashboard preview */}
          <div className="border border-white/[0.08] rounded-2xl overflow-hidden">
            <div className="border-b border-white/[0.06] px-4 py-3 flex items-center gap-2" style={{ background: 'rgba(8,16,36,0.9)' }}>
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/50" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                <div className="w-3 h-3 rounded-full bg-green-500/50" />
              </div>
              <span className="text-xs text-slate-600 ml-2">themaradi.com/dashboard</span>
            </div>
            <div className="p-5" style={{ background: 'rgba(6,14,30,0.95)' }}>
              <div className="text-xs text-slate-500 mb-3 font-medium uppercase tracking-wider">Kasalarim</div>
              <div className="space-y-2">
                {['Babam — Ahmet Yilmaz', 'Annem — Fatma Yilmaz', 'Dedem — Hasan Bey'].map((name, i) => (
                  <div key={name} className="flex items-center gap-3 border border-white/[0.05] bg-white/[0.02] rounded-xl p-3">
                    <div className="w-8 h-8 bg-amber-500/10 border border-amber-500/15 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-slate-200">{name}</div>
                      <div className="text-xs text-slate-600">
                        {i === 0 ? '47 medya · Acik' : i === 1 ? '12 medya · Ozel' : '3 medya · Gizli'}
                      </div>
                    </div>
                    <div className={`text-[10px] px-2 py-0.5 rounded-full border ${i === 0 ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : i === 1 ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' : 'text-slate-500 bg-white/5 border-white/10'}`}>
                      {i === 0 ? 'Acik' : i === 1 ? 'Ozel' : 'Gizli'}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 border border-white/[0.04] rounded-xl">
                <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                  <span>Depolama</span>
                  <span>340 MB / 1 GB</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-1.5 bg-amber-500 rounded-full" style={{ width: '34%' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Memorial preview */}
          <div className="border border-white/[0.08] rounded-2xl overflow-hidden">
            <div className="border-b border-white/[0.06] px-4 py-3 flex items-center gap-2" style={{ background: 'rgba(8,16,36,0.9)' }}>
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/50" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                <div className="w-3 h-3 rounded-full bg-green-500/50" />
              </div>
              <span className="text-xs text-slate-600 ml-2">themaradi.com/memorial/ahmet-yilmaz</span>
            </div>
            <div className="p-5" style={{ background: 'rgba(6,14,30,0.95)' }}>
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-500/20 to-amber-700/10 border border-amber-500/20 rounded-full mx-auto mb-3 flex items-center justify-center text-2xl font-bold text-amber-400">
                  A
                </div>
                <div className="text-base font-bold text-slate-100">Ahmet Yilmaz</div>
                <div className="text-xs text-slate-500 mt-0.5">1952 — 2024</div>
              </div>
              <div className="border border-white/[0.05] bg-white/[0.02] rounded-xl p-3 mb-3">
                <div className="text-xs text-slate-400 leading-relaxed">
                  "Babam hayatı boyunca ailesine adanmış, dürüstlüğü ve sevgisiyle örnek bir insandı. Tbilisi'de doğdu, her zorlukta güçlü kaldı..."
                </div>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="aspect-square bg-white/[0.04] border border-white/[0.05] rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                ))}
              </div>
              <div className="mt-3 text-center">
                <div className="text-xs text-slate-600">47 fotograf · 3 video · 12 ses kaydi</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Features() {
  const features = [
    {
      title: 'Gercek Sifreleme',
      desc: 'AES-256-GCM. Sunucularimiz bile icerigini goremez. Anahtar sadece sende.',
      badge: 'Guvenlik',
    },
    {
      title: 'Dinamik QR Mezar Tasi',
      desc: 'Mezar tasina bir kez kazin, sonsuz calisir. Domain degisse, URL degisse — QR her zaman dogru yere goturur.',
      badge: 'Uniq',
    },
    {
      title: 'Varis Sistemi',
      desc: 'Kim ne gorecek, kim devralacak — tam kontrol. Sahte olum bildirimlerine 30 gunluk itiraz hakki.',
      badge: 'Korunma',
    },
    {
      title: 'Coklu Medya',
      desc: 'Fotograf, video, ses kaydi, belge. Her format desteklenir. Kaliteli sekilde saklanir.',
      badge: 'Medya',
    },
    {
      title: 'Ziyaretci Defteri',
      desc: 'Sevdikler anı sayfasina mesaj birakabilir. Moderasyon ile spam korunmasi.',
      badge: 'Sosyal',
    },
    {
      title: 'QR Analitigi',
      desc: 'Kimler ziyaret etti, nereden geldi, hangi gun en cok ziyaret var. Anma gunleri otomatik rapor.',
      badge: 'Analitik',
    },
  ]

  return (
    <section id="ozellikler" className="py-24 px-5 sm:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className="text-xs font-semibold text-amber-400 uppercase tracking-widest mb-3">Ozellikler</div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Her Detay Dusunuldu</h2>
          <p className="text-slate-400 max-w-xl mx-auto">Gurcistan ve Kafkasya'da bunu yapan tek platform</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f) => (
            <div key={f.title} className="border border-white/[0.06] bg-white/[0.02] rounded-2xl p-6 hover:border-amber-500/20 hover:bg-white/[0.03] transition-all group">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-amber-400 bg-amber-500/8 border border-amber-500/15 px-2.5 py-1 rounded-full font-medium">{f.badge}</span>
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

function Testimonials() {
  const items = [
    {
      name: 'Nino Beridze',
      role: 'Tbilisi, Gurcistan',
      text: 'Babami 2023 te kaybettim. themaradi sayesinde fotograflarini, sesini, hikayelerini sakladim. Cocuklarim buyuyunce dedeyi gercekten taniyacaklar.',
      initial: 'N',
    },
    {
      name: 'Giorgi Khachidze',
      role: 'Mermer Atolyesi Sahibi, Rustavi',
      text: 'Musterilerime artik sadece tas degil, dijital miras da sunuyorum. QR entegrasyonu sayesinde is hacmim ikiye katlandi.',
      initial: 'G',
    },
    {
      name: 'Tamar Lortkipanidze',
      role: 'Kutaisi, Gurcistan',
      text: 'Annemin anı sayfasını aile toplantılarında acıyoruz. Uzaktaki akrabalar bile katilabiliyor. Cok degerli bir sey bu.',
      initial: 'T',
    },
  ]

  return (
    <section className="py-24 px-5 sm:px-8 border-t border-white/[0.04]" style={{ background: 'rgba(255,255,255,0.01)' }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className="text-xs font-semibold text-amber-400 uppercase tracking-widest mb-3">Kullanici Yorumlari</div>
          <h2 className="text-3xl font-bold mb-4">Onlar Zaten Kullanıyor</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {items.map((t) => (
            <div key={t.name} className="border border-white/[0.06] bg-white/[0.02] rounded-2xl p-6">
              <div className="flex gap-1 mb-4">
                {[1,2,3,4,5].map(i => (
                  <svg key={i} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-sm text-slate-300 leading-relaxed mb-5 italic">"{t.text}"</p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center justify-center text-sm font-bold text-amber-400">
                  {t.initial}
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-200">{t.name}</div>
                  <div className="text-xs text-slate-600">{t.role}</div>
                </div>
              </div>
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
      price: '0',
      period: 'Sonsuza kadar',
      features: ['1 dijital kasa', '1 GB depolama', 'Ani sayfasi', 'Ziyaretci defteri', 'QR yonlendirme'],
      cta: 'Hemen Basla',
      highlight: false,
      note: null,
    },
    {
      name: 'Premium',
      price: '14.99',
      period: 'GEL / ay — Yakinda',
      features: ['Sinirsiz kasa', '50 GB depolama', 'Ozel alan adi', 'AI fotograf etiketleme', 'Gelismis analitik', 'Oncelikli destek'],
      cta: 'Bekleme Listesine Gir',
      highlight: true,
      note: 'Erken erisim — ilk 100 kullaniciya %50 indirim',
    },
    {
      name: 'Omurboyu',
      price: '299',
      period: 'GEL — tek seferlik — Yakinda',
      features: ['Tum Premium ozellikler', '100 GB depolama', 'Sifreli depolama (CSE)', 'Shamir anahtar paylasimi', 'SLA garantisi', 'Kalici guvence'],
      cta: 'Bekleme Listesine Gir',
      highlight: false,
      note: null,
    },
  ]

  return (
    <section id="fiyatlar" className="py-24 px-5 sm:px-8 border-t border-white/[0.04]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className="text-xs font-semibold text-amber-400 uppercase tracking-widest mb-3">Fiyatlandirma</div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Sade ve Donuk Fiyat</h2>
          <p className="text-slate-400 max-w-xl mx-auto">
            Aylik abonelik yok. Cunku olum baglaminda her ay odeme kaygisi yaratmak yanlis.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {plans.map((plan) => (
            <div key={plan.name} className={`rounded-2xl p-7 border flex flex-col relative ${
              plan.highlight ? 'border-amber-500/30 bg-gradient-to-b from-amber-500/[0.06] to-transparent' : 'border-white/[0.06] bg-white/[0.02]'
            }`}>
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-xs font-bold px-4 py-1 rounded-full shadow-lg shadow-amber-500/30">
                  En Populer
                </div>
              )}
              {plan.note && (
                <div className="text-xs text-amber-400 bg-amber-500/8 border border-amber-500/15 rounded-lg px-3 py-2 mb-4">
                  {plan.note}
                </div>
              )}
              <div className="mb-6">
                <div className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">{plan.name}</div>
                <div className="text-3xl font-bold text-slate-100 mb-1">
                  {plan.price === '0' ? 'Ucretsiz' : `${plan.price} GEL`}
                </div>
                <div className="text-xs text-slate-500">{plan.period}</div>
              </div>
              <ul className="space-y-2.5 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-slate-300">
                    <svg className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/login" className={`text-center py-3 rounded-xl text-sm font-semibold transition-colors ${
                plan.highlight
                  ? 'bg-amber-500 hover:bg-amber-400 text-white shadow-lg shadow-amber-500/20'
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

function FAQ() {
  const items = [
    {
      q: 'Ucretsiz plan gercekten ucretsiz mi?',
      a: 'Evet, sonsuza kadar. 1 kasa, 1 GB depolama, tam ozellikli ani sayfasi — hicbir zaman ucret alinmaz. Daha fazla alan gerekirse Premium a gecebilirsin.',
    },
    {
      q: 'Ben olursam kasaya ne olur?',
      a: 'Belirledigin varisler otomatik bildirim alir. 30 gunluk dogrulama sureci sonrasinda kasa sectigin kisilere devredilir. Sahte bildirim yapilmasina karsi itiraz mekanizmasi var.',
    },
    {
      q: 'QR mezar tasi nasil calisir?',
      a: 'Mermer atolyesi partnerlerimiz QR kodu mezar tasina kazir. Kodu okutan kisi otomatik olarak anı sayfasina yonlendirilir. Domain ya da URL degisse bile QR calismaya devam eder — cunku arka planda dinamik yonlendirme var.',
    },
    {
      q: 'Iceriklerim guvende mi?',
      a: 'Evet. AES-256-GCM sifreleme kullaniyoruz. Premium planda client-side encryption ile sunucularimiz bile icerigini goremez. Veriler Supabase altyapisinda, Vercel Edge CDN uzerinden sunuluyor.',
    },
    {
      q: 'Anı sayfasini ziyaretciler gorebilir mi?',
      a: 'Sadece sen istersen. Kasa varsayilan olarak gizlidir. Ozel (sadece varis gorebilir) veya herkese acik yapabilirsin. Istedigin zaman degistirebilirsin.',
    },
    {
      q: 'Hangi dosya formatlari destekleniyor?',
      a: 'Fotograflar (JPG, PNG, HEIC), videolar (MP4, MOV), ses kayitlari (MP3, WAV, M4A), belgeler (PDF). Yuklemek icin R2 entegrasyonu yakin zamanda aktif olacak.',
    },
  ]

  return (
    <section id="sss" className="py-24 px-5 sm:px-8 border-t border-white/[0.04]" style={{ background: 'rgba(255,255,255,0.01)' }}>
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <div className="text-xs font-semibold text-amber-400 uppercase tracking-widest mb-3">SSS</div>
          <h2 className="text-3xl font-bold mb-4">Sık Sorulan Sorular</h2>
        </div>
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.q} className="border border-white/[0.06] bg-white/[0.02] rounded-2xl p-6">
              <div className="flex gap-3">
                <div className="w-5 h-5 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                  <svg className="w-3 h-3 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <div className="font-semibold text-slate-100 mb-2">{item.q}</div>
                  <div className="text-sm text-slate-400 leading-relaxed">{item.a}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function FinalCTA() {
  return (
    <section className="py-24 px-5 sm:px-8 border-t border-white/[0.04]">
      <div className="max-w-3xl mx-auto text-center">
        <div className="border border-amber-500/15 rounded-3xl p-12 sm:p-16" style={{ background: 'radial-gradient(ellipse at top, rgba(245,158,11,0.06) 0%, transparent 60%)' }}>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Hikayeniz{' '}
            <span className="gradient-text">Gelecek Nesillere</span>{' '}
            Kalsin
          </h2>
          <p className="text-slate-400 mb-8 max-w-xl mx-auto leading-relaxed">
            Bugun biriktirdiginiz anilar, yarin en kiymetli miras olacak.
            2 dakikada baslayın — ucretsiz, baglayici sozlesme yok.
          </p>
          <Link href="/login"
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-white font-bold px-10 py-4 rounded-xl text-base transition-colors shadow-2xl shadow-amber-500/25">
            Kasami Simdi Olustur
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
          <p className="text-xs text-slate-600 mt-4">Kredi karti gerekmez · Ucretsiz plan sonsuza kadar</p>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="border-t border-white/[0.04] py-12 px-5 sm:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
          <div>
            <div className="font-bold text-lg gradient-text mb-1">themaradi</div>
            <p className="text-xs text-slate-600">Anilar kaybolmaz, sadece bekler.</p>
          </div>
          <div className="flex gap-6 text-sm text-slate-500">
            <a href="#nasil-calisir" className="hover:text-slate-300 transition-colors">Nasil Calisir</a>
            <a href="#fiyatlar" className="hover:text-slate-300 transition-colors">Fiyatlar</a>
            <a href="#sss" className="hover:text-slate-300 transition-colors">SSS</a>
            <a href="mailto:partner@themaradi.com" className="hover:text-slate-300 transition-colors">Partner</a>
            <a href="mailto:info@themaradi.com" className="hover:text-slate-300 transition-colors">Iletisim</a>
          </div>
        </div>
        <div className="border-t border-white/[0.04] pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-slate-700">
          <p>2026 themaradi. Tum haklari saklidir.</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-slate-500 transition-colors">Gizlilik Politikasi</Link>
            <Link href="/terms" className="hover:text-slate-500 transition-colors">Kullanim Sartlari</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
