import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  Check,
  CreditCard,
  Feather,
  FileText,
  Heart,
  HelpCircle,
  Lock,
  MessageCircle,
  QrCode,
  Shield,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Fiyatlandırma — The Maradi',
  description:
    'Anma Profili veya Yaşam Kasası — sevdiklerinizin anısını dijitale taşıyın. Gürcistan\'dan QR mezar plakası dahil.',
}

const features_memorial = [
  'Tam dijital anıt profili',
  'Fotoğraf & video galerisi',
  'Yaşam hikayesi ve kronoloji',
  'Taziye / mum / çiçek özelliği',
  'QR plaka üretimi ve gönderimi',
  'Google Haritalar mezarlık entegrasyonu',
  'Kimlik doğrulama süreci',
  '14 günlük itiraz penceresi',
  'Ömür boyu erişim',
]

const features_vault = [
  'Gizli anı kasası (hayattayken)',
  'Fotoğraf, video, ses kaydı',
  'Kişisel biyografi ve kronoloji',
  'Son mesaj bölümü',
  '3 varis belirleme',
  '2/3 onay ile otomatik yayına geçiş',
  'Aile bildirim sistemi',
  'QR plaka (kurulum ücretine dahil)',
  'Ölüm sonrası tam anıt profili',
]

const verificationSteps = [
  {
    num: '01',
    title: 'Profil başvurusu',
    desc: 'Vefat eden kişinin bilgileri girilir. Profil pending_verification durumuna alınır, hemen yayına girmez.',
  },
  {
    num: '02',
    title: 'Belge yükleme',
    desc: 'Başvuru sahibinin kimlik belgesi ve vefat belgesi (nüfus cüzdanı veya resmi vefat belgesi) yüklenir.',
  },
  {
    num: '03',
    title: 'Admin incelemesi',
    desc: 'Belgeler 24–48 saat içinde ekip tarafından incelenir. Şüpheli durumlar ek doğrulama ister.',
  },
  {
    num: '04',
    title: '14 günlük itiraz penceresi',
    desc: 'Onaylanan profil 14 gün boyunca "itiraz" alabilir. Kişi hâlâ yaşıyorsa veya bilgiler yanlışsa bildirilebilir.',
  },
  {
    num: '05',
    title: 'Yayına geçiş',
    desc: 'İtiraz yoksa profil tam yayına girer. QR plaka üretimi başlar ve adresinize gönderilir.',
  },
]

const faqs = [
  {
    q: 'Anma Profili ve Yaşam Kasası arasındaki fark nedir?',
    a: 'Anma Profili, vefat eden biri için aile tarafından oluşturulan tek seferlik profildir. Yaşam Kasası ise yaşayan bir kişinin kendi hayatını kayıt altına alıp varislere devrettiği uzun vadeli kasadır.',
  },
  {
    q: 'Neden kimlik belgesi istiyorsunuz?',
    a: 'Yaşayan biri için sahte vefat profili oluşturulmasını önlemek için. Bu kural herkese uygulanır; belgeler güvenli ortamda saklanır ve doğrulama sonrası sistemden silinir.',
  },
  {
    q: 'QR plaka nasıl ve ne zaman gelir?',
    a: 'Profil onaylandıktan sonra üretim başlar. Gürcistan içi adresler için 5–10 iş günü, yurt dışı için 10–20 iş günü hesaplanmalıdır.',
  },
  {
    q: 'Yaşam Kasası aboneliğini iptal edersem ne olur?',
    a: 'İptal tarihine kadar kasa aktif kalır. Sonrasında kasa dondurulur; vefat sonrası varisler istediklerinde yıllık ücret ödeyerek kasayı yayına alabilir.',
  },
  {
    q: 'Ödeme hangi para birimiyle yapılıyor?',
    a: 'Gürcistan Larisi (₾/GEL) ile. TBC Pay, BOG Pay, Visa/Mastercard ve banka havalesi kabul edilir.',
  },
  {
    q: 'Kişi hâlâ yaşıyor, birisi onun için profil açarsa?',
    a: '14 günlük itiraz penceresinde ilgili kişi "Ben yaşıyorum" bildiriminde bulunabilir. Profil anında askıya alınır ve başvuru sahibi hakkında hukuki süreç başlatılır.',
  },
]

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#fbf8f1] text-[#173d31]">

      {/* NAV */}
      <nav className="fixed inset-x-0 top-0 z-50 border-b border-[#e6dccb] bg-[#fbf8f1]/92 shadow-sm backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link href="/" className="flex items-center gap-3 text-[#173d31]">
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[#c7a76f] bg-[#f4eee3] text-[#9a7132]">
              <Feather className="h-5 w-5" />
            </span>
            <span className="font-serif text-2xl">The Maradi</span>
          </Link>
          <div className="hidden items-center gap-7 text-sm text-[#4c463c] lg:flex">
            <Link href="/" className="hover:text-[#9a7132]">Ana Sayfa</Link>
            <Link href="/memorial/demo" className="hover:text-[#9a7132]">Örnek Profil</Link>
            <Link href="/contact" className="hover:text-[#9a7132]">İletişim</Link>
          </div>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-md border border-[#c7a76f] px-5 py-2.5 text-sm font-semibold text-[#173d31] transition hover:bg-[#f4eee3]"
          >
            Soru sor
          </Link>
        </div>
      </nav>

      <main className="pt-16">

        {/* HERO */}
        <section className="border-b border-[#e6dccb] px-5 py-16 sm:px-8 sm:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-5 flex items-center justify-center gap-3 text-[#b08340]">
              <span className="h-px w-10 bg-[#c7a76f]" />
              <span className="text-xs tracking-[0.2em] uppercase">Fiyatlandırma</span>
              <span className="h-px w-10 bg-[#c7a76f]" />
            </div>
            <h1 className="font-serif text-5xl leading-tight text-[#173d31] sm:text-[3.75rem]">
              İki ürün,<br />
              <span className="text-[#b08340]">iki farklı ihtiyaç.</span>
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-base leading-8 text-[#5b5245]">
              Vefat eden bir yakınınız için <strong className="text-[#173d31]">Anma Profili</strong> ya da
              hayattayken kendi mirasınızı kurun — <strong className="text-[#173d31]">Yaşam Kasası</strong>.
              Her ikisinde de QR mezar plakası dahildir.
            </p>
          </div>
        </section>

        {/* ÜRÜNLER */}
        <section className="px-5 py-16 sm:px-8">
          <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-2">

            {/* ANMA PROFİLİ */}
            <div className="flex flex-col rounded-2xl border border-[#e1d5c3] bg-[#fffdf8] p-8 shadow-lg shadow-[#4d3d26]/6">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#e1d5c3] bg-[#f4eee3] text-[#b08340]">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-[#b08340]">Yakınınız vefat etti</p>
                  <h2 className="font-serif text-2xl text-[#173d31]">Anma Profili</h2>
                </div>
              </div>

              <div className="mb-6 rounded-xl border border-[#e1d5c3] bg-[#f7f2e9] p-5">
                <div className="flex items-end gap-2">
                  <span className="font-serif text-6xl text-[#173d31]">249</span>
                  <div className="mb-1.5">
                    <span className="text-2xl font-semibold text-[#b08340]">₾</span>
                    <p className="text-sm text-[#8a7a64]">tek seferlik</p>
                  </div>
                </div>
                <p className="mt-2 text-sm text-[#665d50]">QR plaka üretimi ve gönderimi dahil. Başka ödeme yok.</p>
              </div>

              <ul className="mb-8 flex-1 space-y-3">
                {features_memorial.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#b08340]" />
                    <span className="text-[#4c463c]">{f}</span>
                  </li>
                ))}
              </ul>

              <div className="mb-6 flex items-start gap-2.5 rounded-xl border border-[#d4e8dc] bg-[#edf7f1] p-4">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#2d7a53]" />
                <p className="text-sm text-[#2d5c3e]">
                  Kimlik doğrulama zorunlu. Ödeme sonrası belgeler yüklenir, admin onayıyla profil yayına girer.
                </p>
              </div>

              <Link
                href="/contact"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#c7a76f] px-5 py-3.5 text-sm font-semibold text-[#173d31] transition hover:bg-[#f4eee3]"
              >
                Anma Profili Oluştur
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* YAŞAM KASASI */}
            <div className="relative flex flex-col rounded-2xl border-2 border-[#b08340] bg-[#fffdf8] p-8 pt-12 shadow-xl shadow-[#4d3d26]/12 ring-4 ring-[#b08340]/8">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#b08340] px-5 py-1.5 text-xs font-semibold text-white shadow">
                Kendiniz için — hayattayken başlayın
              </div>

              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#c7a76f] bg-[#f4eee3] text-[#b08340]">
                  <Heart className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-[#b08340]">Kendi mirasınızı kurun</p>
                  <h2 className="font-serif text-2xl text-[#173d31]">Yaşam Kasası</h2>
                </div>
              </div>

              <div className="mb-6 rounded-xl border border-[#c7a76f]/40 bg-[#f7f2e9] p-5">
                <div className="flex items-center gap-5">
                  <div>
                    <p className="text-xs text-[#8a7a64]">Kurulum ücreti</p>
                    <div className="flex items-end gap-1">
                      <span className="font-serif text-4xl text-[#173d31]">49</span>
                      <span className="mb-1 text-xl font-semibold text-[#b08340]">₾</span>
                    </div>
                    <p className="text-xs text-[#8a7a64]">QR plaka dahil</p>
                  </div>
                  <div className="h-12 w-px bg-[#e1d5c3]" />
                  <div>
                    <p className="text-xs text-[#8a7a64]">Sonrasında</p>
                    <div className="flex items-end gap-1">
                      <span className="font-serif text-4xl text-[#173d31]">12,90</span>
                      <span className="mb-1 text-xl font-semibold text-[#b08340]">₾</span>
                    </div>
                    <p className="text-xs text-[#8a7a64]">/ ay</p>
                  </div>
                </div>
                <div className="mt-3 border-t border-[#e1d5c3] pt-3">
                  <p className="text-sm text-[#665d50]">
                    Veya <strong className="text-[#173d31]">99 ₾/yıl</strong> ile %36 tasarruf edin.
                  </p>
                </div>
              </div>

              <ul className="mb-8 flex-1 space-y-3">
                {features_vault.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#b08340]" />
                    <span className="text-[#4c463c]">{f}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/contact"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#103b2c] px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#103b2c]/20 transition hover:bg-[#0b2b20]"
              >
                Yaşam Kasası Aç
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <p className="mt-8 text-center text-sm text-[#8a7a64]">
            Kurumsal veya toplu sipariş için{' '}
            <Link href="/contact" className="font-semibold text-[#9a7132] underline-offset-2 hover:underline">
              bizimle iletişime geçin
            </Link>
            .
          </p>
        </section>

        {/* HANGI ÜRÜN SIZE UYGUN */}
        <section className="border-y border-[#e6dccb] bg-[#f7f2e9] px-5 py-16 sm:px-8">
          <div className="mx-auto max-w-4xl">
            <div className="mb-10 text-center">
              <h2 className="font-serif text-4xl text-[#173d31]">Hangisi size uygun?</h2>
              <p className="mt-3 text-[#665d50]">Farklı ihtiyaçlar, farklı ürünler.</p>
            </div>

            <div className="overflow-hidden rounded-2xl border border-[#e1d5c3] bg-[#fffdf8]">
              <div className="grid grid-cols-3 border-b border-[#e1d5c3] bg-[#f4eee3] px-6 py-3 text-xs font-semibold uppercase tracking-wider text-[#8a7a64]">
                <span>Durum</span>
                <span className="text-center">Anma Profili</span>
                <span className="text-center">Yaşam Kasası</span>
              </div>

              {[
                ['Yakınınız yeni vefat etti', true, false],
                ['Hayattayken miras hazırlamak istiyorsunuz', false, true],
                ['Hızlı profil, tek ödeme', true, false],
                ['Yıllarca içerik biriktirmek istiyorsunuz', false, true],
                ['Varisler ölüm sonrası onaylıyor', false, true],
                ['Belge doğrulama gerekli', true, false],
                ['QR plaka dahil', true, true],
                ['Ömür boyu erişim', true, true],
              ].map(([label, memorial, vault], i, arr) => (
                <div
                  key={String(label)}
                  className={`grid grid-cols-3 items-center px-6 py-4 ${i < arr.length - 1 ? 'border-b border-[#e1d5c3]' : ''}`}
                >
                  <span className="text-sm text-[#4c463c]">{label as string}</span>
                  <div className="flex justify-center">
                    {memorial
                      ? <Check className="h-5 w-5 text-[#2d7a53]" />
                      : <span className="text-xl text-[#d1c4ae]">—</span>}
                  </div>
                  <div className="flex justify-center">
                    {vault
                      ? <Check className="h-5 w-5 text-[#b08340]" />
                      : <span className="text-xl text-[#d1c4ae]">—</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* DOĞRULAMA SÜRECİ */}
        <section className="px-5 py-16 sm:px-8">
          <div className="mx-auto max-w-4xl">
            <div className="mb-10 text-center">
              <div className="mb-4 flex items-center justify-center gap-2 text-[#2d7a53]">
                <ShieldCheck className="h-5 w-5" />
                <span className="text-sm font-semibold uppercase tracking-widest">Güvenlik & Doğrulama</span>
              </div>
              <h2 className="font-serif text-4xl text-[#173d31]">Anma Profili nasıl doğrulanır?</h2>
              <p className="mx-auto mt-3 max-w-xl text-[#665d50]">
                Sahte profil oluşturulmasını önlemek için belge doğrulama ve itiraz penceresi uyguluyoruz.
              </p>
            </div>

            <div className="relative">
              <div className="absolute left-8 top-0 h-full w-px bg-[#e1d5c3] sm:left-10" />
              <div className="space-y-6">
                {verificationSteps.map((step) => (
                  <div key={step.num} className="relative flex gap-6 sm:gap-8">
                    <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-[#c7a76f] bg-[#fbf8f1] sm:h-14 sm:w-14">
                      <span className="font-serif text-sm font-bold text-[#b08340]">{step.num}</span>
                    </div>
                    <div className="pt-2 pb-2">
                      <h3 className="font-serif text-lg text-[#173d31]">{step.title}</h3>
                      <p className="mt-1 text-sm leading-6 text-[#5b5245]">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-10 flex items-start gap-3 rounded-xl border border-[#d4e8dc] bg-[#edf7f1] p-5">
              <Lock className="mt-0.5 h-5 w-5 shrink-0 text-[#2d7a53]" />
              <div className="text-sm text-[#2d5c3e]">
                <strong>Belgeleriniz güvende.</strong>{' '}
                Yüklenen kimlik ve vefat belgeleri yalnızca doğrulama amacıyla kullanılır,
                onay sonrasında sistemden kalıcı olarak silinir. GDPR ve Gürcistan Kişisel Veri Kanunu uyumlu.
              </div>
            </div>
          </div>
        </section>

        {/* ÖDEME YÖNTEMLERİ */}
        <section className="border-t border-[#e6dccb] bg-[#f7f2e9] px-5 py-16 sm:px-8">
          <div className="mx-auto max-w-4xl">
            <div className="mb-10 text-center">
              <h2 className="font-serif text-4xl text-[#173d31]">Ödeme yöntemleri</h2>
              <p className="mt-3 text-[#665d50]">Gürcistan ve Türkiye&apos;den tüm yaygın yöntemler desteklenir.</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { name: 'Visa / Mastercard', desc: 'Tüm kredi ve banka kartları', icon: CreditCard },
                { name: 'TBC Pay', desc: 'TBC Bank online ödeme', icon: Sparkles },
                { name: 'BOG Pay', desc: 'Bank of Georgia ödeme', icon: Sparkles },
                { name: 'Banka Havalesi', desc: 'TBC, BOG, Liberty Bank', icon: FileText },
              ].map((m) => (
                <div key={m.name} className="flex items-center gap-4 rounded-xl border border-[#e1d5c3] bg-[#fffdf8] p-5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#e1d5c3] bg-[#f4eee3] text-[#b08340]">
                    <m.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-serif text-sm font-semibold text-[#173d31]">{m.name}</div>
                    <div className="text-xs text-[#8a7a64]">{m.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-center gap-3 rounded-xl border border-[#e1d5c3] bg-[#f4eee3] p-4">
              <Shield className="h-5 w-5 shrink-0 text-[#b08340]" />
              <p className="text-sm text-[#5b5245]">
                Tüm ödemeler SSL şifreli ve güvenli altyapı üzerinden işlenir. Kart bilgileriniz sistemimizde saklanmaz.
              </p>
            </div>
          </div>
        </section>

        {/* SSS */}
        <section className="px-5 py-16 sm:px-8">
          <div className="mx-auto max-w-3xl">
            <div className="mb-10 text-center">
              <h2 className="font-serif text-4xl text-[#173d31]">Sık sorulan sorular</h2>
            </div>
            <div className="overflow-hidden rounded-2xl border border-[#e1d5c3] bg-[#fffdf8]">
              {faqs.map((faq, i) => (
                <div
                  key={faq.q}
                  className={`px-6 py-5 ${i < faqs.length - 1 ? 'border-b border-[#e1d5c3]' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    <HelpCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#b08340]" />
                    <div>
                      <p className="font-serif text-lg text-[#173d31]">{faq.q}</p>
                      <p className="mt-2 text-sm leading-7 text-[#5b5245]">{faq.a}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="bg-[#0c3327] px-5 py-16 sm:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <Feather className="mx-auto mb-4 h-8 w-8 text-[#c7a76f]" />
            <h2 className="font-serif text-4xl text-white sm:text-5xl">
              Sevdiklerinizin anısını<br />
              <span className="text-[#c7a76f]">yaşatın.</span>
            </h2>
            <p className="mt-5 text-lg text-[#cfc3ad]">
              Önce örnek profili görün, sonra kararınızı verin.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/memorial/demo"
                className="inline-flex items-center gap-2 rounded-xl bg-[#c7a76f] px-8 py-3.5 text-sm font-semibold text-[#0c3327] transition hover:bg-[#d4b87c]"
              >
                Örnek Profili Gör
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-xl border border-[#c7a76f]/40 px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                <MessageCircle className="h-4 w-4" />
                Soru sor
              </Link>
            </div>
          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="border-t border-[#e6dccb] bg-[#fbf8f1] px-5 py-8 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-sm text-[#8a7a64] sm:flex-row">
          <Link href="/" className="font-serif text-lg text-[#173d31]">The Maradi</Link>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-[#173d31]">Gizlilik</Link>
            <Link href="/terms" className="hover:text-[#173d71]">Koşullar</Link>
            <Link href="/contact" className="hover:text-[#173d31]">İletişim</Link>
          </div>
          <span>© 2026 The Maradi</span>
        </div>
      </footer>

    </div>
  )
}
