'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import {
  ArrowRight,
  BookOpen,
  Camera,
  Check,
  ChevronDown,
  Clock,
  Database,
  Heart,
  Image as ImageIcon,
  Key,
  LockKeyhole,
  MapPin,
  MessageCircle,
  Play,
  QrCode,
  Server,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react'

/* ─── DATA ──────────────────────────────────────────────────────── */

const quickSteps = [
  {
    icon: QrCode,
    title: 'QR plaka yerleştirilir',
    text: 'Kişiye özel, dayanıklı QR plaka üretilir ve mezar taşına ya da anı alanına eklenir. Plaka ömür boyu geçerlidir — URL değişse bile yönlendirme çalışır.',
  },
  {
    icon: BookOpen,
    title: 'Dijital anıt profili açılır',
    text: 'Hayat hikayesi, fotoğraflar, videolar, ses kayıtları ve mezarlık konumu tek sayfada toplanır. Aile üyeleri içerikleri zaman içinde güncelleyebilir.',
  },
  {
    icon: Users,
    title: 'Anılar nesillere aktarılır',
    text: 'Ziyaretçiler QR kodu telefona okuttuğunda sayfa açılır; mum yakar, çiçek bırakır, taziye mesajı gönderir. Bildirimler varislerine iletilir.',
  },
]

const securityItems = [
  {
    icon: LockKeyhole,
    title: 'TLS 1.3 şifreli iletim',
    text: 'Tarayıcıdan sunucuya tüm veri trafiği TLS 1.3 protokolüyle şifrelenir. Araya girme saldırılarına karşı tam koruma.',
  },
  {
    icon: Database,
    title: 'Satır bazlı veri izolasyonu',
    text: 'Supabase PostgreSQL Row Level Security (RLS) ile her kullanıcı yalnızca kendi verilerine erişebilir. Diğer profillere hiçbir şekilde ulaşılamaz.',
  },
  {
    icon: Server,
    title: 'AES-256 medya şifreleme',
    text: 'Fotoğraf, video ve ses kayıtları Cloudflare R2 üzerinde AES-256 ile şifreli depolanır. Doğrulama belgeleri onay sonrası 30 gün içinde kalıcı silinir.',
  },
  {
    icon: Key,
    title: 'bcrypt şifre karması',
    text: 'Şifreler asla düz metin olarak tutulmaz; bcrypt algoritmasıyla karmalanır. Bir güvenlik ihlalinde bile şifreleriniz okunamaz.',
  },
  {
    icon: QrCode,
    title: 'Kalıcı QR yönlendirme',
    text: 'QR plakaya basan URL slug veya alan adından bağımsız bir kimlikle çalışır. Sayfa adresi değişse bile plakalar sonsuza dek geçerli kalır.',
  },
  {
    icon: ShieldCheck,
    title: 'Belge doğrulama + itiraz penceresi',
    text: 'Anma Profili başvurularında kimlik ve vefat belgesi zorunludur. 24-48 saat admin incelemesi ve 14 günlük itiraz penceresiyle sahte profil riski en aza indirilir.',
  },
]

const faqs = [
  {
    q: 'Anma Profili ile Yaşam Kasası arasındaki fark nedir?',
    a: 'Anma Profili, vefat eden bir yakınınız için aile tarafından oluşturulan tek seferlik (249 ₾) hizmettir. Yaşam Kasası ise hayattayken kendi dijital mirasınızı kurduğunuz, varislerin vefat sonrası yayına aldığı abonelik hizmetidir (49 ₾ kurulum + 12,90 ₾/ay).',
  },
  {
    q: 'QR plakanın ömrü ne kadar?',
    a: 'The Maradi QR kodu slug veya alan adına değil, veritabanındaki benzersiz bir kimliğe bağlıdır. Alan adı değişse bile plaka çalışır. The Maradi ömür boyu açık kalma taahhüdü kapsamındadır; QR plakalar hiçbir zaman geçersiz hale gelmez.',
  },
  {
    q: 'Neden kimlik belgesi istiyorsunuz?',
    a: 'Yaşayan biri adına sahte vefat profili oluşturulmasını önlemek için. Bu kural tüm başvurulara eşit uygulanır. Belgeler doğrulama sonrası 30 gün içinde kalıcı silinir; hiçbir şekilde başka amaçla kullanılmaz.',
  },
  {
    q: 'Platform kapanırsa ne olur?',
    a: 'The Maradi ömür boyu açık kalma taahhüdü vermektedir. Oluşturulan Anma Profilleri kalıcıdır; ek ücret, abonelik veya yenileme gerekmez. QR plakalar hiçbir zaman geçersiz hale gelmez — alan adı veya URL değişse bile yönlendirme çalışır.',
  },
  {
    q: 'Aile üyeleri içerik ekleyebilir mi?',
    a: 'Evet. Yetkili aile üyeleri profil yöneticisi olarak eklenebilir. Fotoğraf, video ve biyografi güncellemesi yapabilirler. Taziye mesajlarını görebilir ve yönetebilirler.',
  },
  {
    q: 'Yaşam Kasası aboneliğini iptal edersem ne olur?',
    a: 'İptal tarihine kadar tüm özellikler aktif kalır. Sonrasında kasa dondurulur — içerikler silinmez. Varisler vefat sonrası aboneliği yeniden açarak kasayı yayına alabilir.',
  },
  {
    q: 'QR plaka fiziksel olarak ne zaman gelir?',
    a: 'Profil onaylandıktan sonra plaka üretimi başlar. Gürcistan ve Türkiye içi teslimatlar 5-10 iş günü, diğer ülkeler 10-20 iş günüdür.',
  },
  {
    q: 'Ödeme hangi para birimiyle yapılıyor?',
    a: 'Gürcistan Larisi (₾/GEL) ile. TBC Pay, BOG Pay, Visa/Mastercard ve banka havalesi kabul edilir. Gürcistan dışından yapılan ödemelerde döviz karşılığı otomatik hesaplanır.',
  },
]

/* ─── COMPONENT ─────────────────────────────────────────────────── */

export default function LocalizedLanding() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-[#e6dccb] bg-[#fbf8f1] px-5 pt-24 sm:px-8 lg:pt-28">
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,#fbf8f1_0%,#fbf8f1_38%,rgba(251,248,241,0.72)_58%,rgba(251,248,241,0)_78%)]" />
        <div className="mx-auto grid max-w-7xl items-center gap-8 lg:grid-cols-[0.78fr_1.22fr]">
          <div className="relative z-10 max-w-2xl py-12 lg:py-24">
            <div className="mb-5 flex items-center gap-3 text-[#b08340]">
              <span className="h-px w-24 bg-[#c7a76f]" />
              <Sparkles className="h-4 w-4" />
            </div>
            <h1 className="font-serif text-5xl leading-[0.98] text-[#173d31] sm:text-6xl lg:text-[74px]">
              Hatıralar Taşta Değil,
              <span className="block font-semibold">Zamanda Yaşasın.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-[#4c463c] sm:text-lg">
              Mezar taşına yerleştirilen QR kodlar; sevdiklerinizin hikayelerini,
              fotoğraflarını ve anlamlarını barındıran dijital anıt sayfalarına açılır.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="#nasil-calisir" className="inline-flex items-center justify-center gap-2 rounded-md bg-[#103b2c] px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#103b2c]/20 transition hover:bg-[#0b2b20]">
                Nasıl çalışır?
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/memorial/demo" className="inline-flex items-center justify-center gap-2 rounded-md border border-[#c7a76f] bg-white px-6 py-3.5 text-sm font-semibold text-[#173d31] shadow-sm transition hover:bg-[#f8f1e6]">
                Örnek profili gör
                <Users className="h-4 w-4" />
              </Link>
            </div>
          </div>
          <div className="relative -mr-5 min-h-[360px] sm:-mr-8 lg:min-h-[560px]">
            <Image
              src="/images/landing/hero-memorial-qr.png"
              alt="Mezar taşı üzerinde QR kod ve yanında telefonda dijital anıt profili"
              fill
              priority
              sizes="(min-width: 1024px) 62vw, 100vw"
              className="object-cover object-center lg:rounded-bl-[2rem]"
            />
            <div className="absolute inset-y-0 left-0 w-1/3 bg-[linear-gradient(90deg,#fbf8f1_0%,rgba(251,248,241,0.82)_42%,rgba(251,248,241,0)_100%)]" />
          </div>
        </div>
      </section>

      {/* HIZLI 3 ADIM */}
      <section id="nasil-calisir" className="border-b border-[#e6dccb] bg-[#fbf8f1] px-5 py-8 sm:px-8">
        <div className="mx-auto grid max-w-7xl gap-5 md:grid-cols-3">
          {quickSteps.map((item, index) => (
            <div key={item.title} className="rounded-lg border border-[#e1d5c3] bg-[#fffdf8] p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-[#e1d5c3] bg-[#f4eee3] text-[#9a7132]">
                  <item.icon className="h-7 w-7" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-[#b08340]">{String(index + 1).padStart(2, '0')}</div>
                  <h3 className="mt-1 font-serif text-xl text-[#173d31]">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#665d50]">{item.text}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PROFİL ÖNIZLEME */}
      <section className="border-b border-[#e6dccb] bg-[#fbf8f1] px-5 py-8 sm:px-8">
        <div className="mx-auto grid max-w-7xl items-center gap-7 lg:grid-cols-[0.28fr_0.72fr]">
          <div className="lg:pl-2">
            <h2 className="font-serif text-3xl text-[#173d31] sm:text-4xl">Dijital Anıt Profili</h2>
            <div className="mt-3 flex items-center gap-3 text-[#b08340]">
              <span className="h-px w-16 bg-[#c7a76f]" />
              <Sparkles className="h-3.5 w-3.5" />
            </div>
            <p className="mt-5 max-w-sm text-sm leading-7 text-[#5b5245]">
              Sevdiklerinizin hayatına dair her detayın özenle sunulduğu,
              zengin ve anlamlı dijital anıt sayfaları.
            </p>
            <Link href="/memorial/demo" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#9a7132]">
              Örnek Profili Gör
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="rounded-lg border border-[#e1d5c3] bg-white/92 p-4 shadow-xl shadow-[#4d3d26]/10">
            <div className="grid gap-5 lg:grid-cols-[170px_1fr_1.45fr]">
              <Image
                src="/images/landing/profile-ahmet.png"
                alt="Ahmet Yılmaz dijital anıt profil fotoğrafı"
                width={340}
                height={340}
                className="h-[190px] w-full rounded-md object-cover object-top lg:h-full"
              />
              <div className="flex flex-col justify-between">
                <div>
                  <h3 className="font-serif text-2xl text-[#173d31]">Ahmet Yılmaz</h3>
                  <p className="mt-1 text-xs text-[#8a7a64]">1940 – 2020</p>
                  <p className="mt-4 text-sm leading-6 text-[#5b5245]">
                    Hayat hikayesi, ailesiyle anıları ve yaşadığı güzel anlar
                    bu zarif dijital profilde korunur.
                  </p>
                </div>
                <Link href="/memorial/demo" className="mt-4 inline-flex w-fit items-center justify-center rounded-md border border-[#c7a76f] px-4 py-2 text-xs font-semibold text-[#173d31] transition hover:bg-[#f8f1e6]">
                  Hayat Hikayesini Oku
                </Link>
              </div>
              <div className="border-t border-[#eee4d5] pt-4 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
                <div className="grid grid-cols-4 gap-2 text-center text-xs text-[#5b5245]">
                  {[
                    { icon: BookOpen, label: 'Hayat Hikayesi' },
                    { icon: ImageIcon, label: 'Fotoğraflar' },
                    { icon: Play, label: 'Videolar' },
                    { icon: Heart, label: '66 Anı' },
                  ].map(({ icon: Icon, label }) => (
                    <div key={label} className="rounded-md border border-[#e1d5c3] bg-[#fbf8f1] px-3 py-3 text-center">
                      <Icon className="mx-auto h-5 w-5 text-[#9a7132]" />
                      <div className="mt-2 text-xs font-semibold text-[#173d31]">{label}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-5 grid grid-cols-4 gap-3">
                  {[
                    ['/images/landing/profile-family-old.png', 'Eski aile fotoğrafı'],
                    ['/images/landing/profile-family-dinner.png', 'Aile sofrasında anı'],
                    ['/images/landing/profile-family-main.png', 'Aile portresi'],
                    ['/images/landing/profile-georgia.png', 'Anı yeri'],
                  ].map(([src, alt]) => (
                    <Image key={src} src={src} alt={alt} width={190} height={130} className="h-20 rounded-md object-cover shadow-sm" />
                  ))}
                </div>
                <Link href="/memorial/demo" className="mx-auto mt-5 inline-flex items-center justify-center gap-2 rounded-md border border-[#c7a76f] px-6 py-2 text-xs font-semibold text-[#173d31] transition hover:bg-[#f8f1e6]">
                  Tüm İçeriği Görüntüle
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4 DEĞER + CTA BANT */}
      <section className="border-y border-[#e6dccb] bg-[#fbf8f1] px-5 py-8 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-5 rounded-lg bg-[#fffdf8] px-4 py-5 md:grid-cols-4 md:gap-0">
            {[
              { icon: ShieldCheck, title: 'Hatıralar Güvende', text: 'Anılarınız dijital ortamda korunur, zamanla kaybolmaz.' },
              { icon: Sparkles, title: 'Anlamlı Ziyaretler', text: 'Her ziyaret, sevdiklerinizle daha derin bir bağ kurmanızı sağlar.' },
              { icon: QrCode, title: 'Kolay Erişim', text: 'QR kod ile saniyeler içinde zengin dijital anı sayfasına ulaşılır.' },
              { icon: Users, title: 'Yeni Nesillere Miras', text: 'Hikayeleriniz ve değerleriniz gelecek nesillere ilham olur.' },
            ].map((item, index) => (
              <div key={item.title} className={`flex items-center gap-4 px-3 ${index > 0 ? 'md:border-l md:border-[#d7c7ae]' : ''}`}>
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-[#e1d5c3] bg-[#f4eee3] text-[#8a682e]">
                  <item.icon className="h-7 w-7" />
                </div>
                <div>
                  <h3 className="font-serif text-lg text-[#173d31]">{item.title}</h3>
                  <p className="mt-1 text-xs leading-5 text-[#665d50]">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="relative mt-6 overflow-hidden rounded-lg bg-[#103b2c] px-6 py-8 text-center text-white shadow-xl shadow-[#103b2c]/15">
            <Image src="/images/landing/cta-candle-olive.png" alt="Mum ve zeytin dallarıyla anma atmosferi" fill sizes="100vw" className="absolute inset-0 object-cover" />
            <div className="absolute inset-0 bg-[#06291f]/35" />
            <div className="relative z-10">
              <h2 className="font-serif text-2xl sm:text-3xl">Bir ismi değil, bir hayatı yaşatın.</h2>
              <Link href="/contact" className="mt-5 inline-flex items-center justify-center gap-2 rounded-md bg-[#d1a85c] px-7 py-3 text-sm font-semibold text-[#103b2c] shadow-lg shadow-black/10 transition hover:bg-[#e0ba70]">
                Bizimle İletişime Geçin <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* NEDEN THE MARADI */}
      <section id="ozellikler" className="bg-[#fbf8f1] px-5 py-16 sm:px-8">
        <div className="mx-auto mb-10 max-w-3xl text-center">
          <h2 className="font-serif text-4xl text-[#173d31] sm:text-5xl">Neden The Maradi?</h2>
          <p className="mt-4 leading-7 text-[#665d50]">Bir mezar taşından fazlasını, saygılı ve kalıcı bir dijital anı deneyimine dönüştürür.</p>
        </div>
        <div className="mx-auto grid max-w-7xl gap-5 md:grid-cols-3">
          {[
            {
              icon: BookOpen,
              title: 'Hatıraları kalıcı hale getirir',
              text: 'Fotoğraflar, hikayeler, ses ve videolar düzenli bir dijital anı alanında saklanır. Zamanla solar değil, nesiller boyu erişilebilir kalır.',
            },
            {
              icon: QrCode,
              title: 'Fiziksel ve dijital dünyayı birleştirir',
              text: 'Mezar taşı üzerindeki QR kod anı sayfasına doğrudan kapı açar. Ziyaretçiler için kolay, aile için anlamlı.',
            },
            {
              icon: Users,
              title: 'Aile için kolay yönetim',
              text: 'Yetkili aile üyeleri profili zaman içinde güncelleyebilir. Taziye bildirimlerini takip edebilir, içerikleri düzenleyebilir.',
            },
            {
              icon: Heart,
              title: 'İnsana dokunan deneyim',
              text: 'Ziyaretçiler bir isim değil yaşanmış bir hayatla karşılaşır. Mum yakar, çiçek bırakır, dua eder — her etkileşim varislerine bildirim gönderir.',
            },
            {
              icon: ShieldCheck,
              title: 'Doğrulanmış, güvenilir profiller',
              text: 'Her Anma Profili kimlik ve vefat belgesiyle doğrulanır. 14 günlük itiraz penceresi ile sahte profil riski sıfıra yaklaşır.',
            },
            {
              icon: Clock,
              title: 'Ömür boyu açık kalma taahhüdü',
              text: 'The Maradi kalıcı çalışmayı taahhüt eder. Anma Profilleri ömür boyu erişilebilir kalır; ek ücret veya yenileme gerekmez. QR plakalar hiçbir zaman geçersiz olmaz.',
            },
          ].map((item) => (
            <div key={item.title} className="rounded-lg border border-[#e1d5c3] bg-[#fffdf8] p-6 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#e1d5c3] bg-[#f4eee3] text-[#8a682e]">
                <item.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-serif text-lg text-[#173d31]">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-[#665d50]">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* NASIL ÇALIŞIR — DETAYLI */}
      <section className="border-y border-[#e6dccb] bg-[#f7f2e9] px-5 py-16 sm:px-8">
        <div className="mx-auto mb-10 max-w-3xl text-center">
          <h2 className="font-serif text-4xl text-[#173d31] sm:text-5xl">Nasıl çalışır?</h2>
          <p className="mt-4 leading-7 text-[#665d50]">İki farklı senaryo — her ikisi de aynı platforma çıkar.</p>
        </div>
        <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-2">
          {/* Senaryo A */}
          <div className="rounded-2xl border border-[#e1d5c3] bg-[#fffdf8] p-7 shadow-sm">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#e1d5c3] bg-[#f4eee3] px-3 py-1 text-xs font-semibold text-[#b08340]">
              Senaryo A — Yakınınız vefat etti
            </div>
            <h3 className="font-serif text-xl text-[#173d31]">Aile oluşturur, hemen yayına girer</h3>
            <div className="mt-5 space-y-4">
              {[
                { icon: BookOpen, step: '01', text: 'Anma Profili formu doldurulur, biyografi ve fotoğraflar eklenir.' },
                { icon: ShieldCheck, step: '02', text: 'Kimlik ve vefat belgesi yüklenir; 24-48 saat içinde admin incelemesi yapılır.' },
                { icon: Clock, step: '03', text: '14 günlük itiraz penceresi boyunca profil hazır bekler.' },
                { icon: QrCode, step: '04', text: 'İtiraz yoksa profil yayına girer, QR plaka üretilip gönderilir.' },
              ].map((s) => (
                <div key={s.step} className="flex gap-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#c7a76f] bg-[#f4eee3]">
                    <span className="font-serif text-xs font-bold text-[#b08340]">{s.step}</span>
                  </div>
                  <p className="pt-1 text-sm leading-6 text-[#5b5245]">{s.text}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 flex items-center justify-between border-t border-[#e1d5c3] pt-5">
              <div>
                <p className="text-xs text-[#8a7a64]">Tek seferlik</p>
                <p className="font-serif text-2xl text-[#173d31]">249 <span className="text-base text-[#b08340]">₾</span></p>
              </div>
              <Link href="/pricing" className="inline-flex items-center gap-2 rounded-xl border border-[#c7a76f] px-5 py-2.5 text-sm font-semibold text-[#173d31] transition hover:bg-[#f4eee3]">
                Detaylar <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Senaryo B */}
          <div className="rounded-2xl border-2 border-[#b08340] bg-[#fffdf8] p-7 shadow-lg ring-4 ring-[#b08340]/8">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#c7a76f] bg-[#f4eee3] px-3 py-1 text-xs font-semibold text-[#b08340]">
              Senaryo B — Hayattayken kendiniz kurun
            </div>
            <h3 className="font-serif text-xl text-[#173d31]">Yaşam Kasası — miras biriktirin</h3>
            <div className="mt-5 space-y-4">
              {[
                { icon: Heart, step: '01', text: 'Yaşam Kasası açılır; fotoğraf, video, ses kaydı ve biyografi eklenir.' },
                { icon: Users, step: '02', text: '3 varis belirlenir. Kasanız gizli kalır, yalnızca siz yönetirsiniz.' },
                { icon: Camera, step: '03', text: 'Yıllarca anı biriktirirsiniz. Son mesaj bölümünüze varislerinize özel not ekleyebilirsiniz.' },
                { icon: ShieldCheck, step: '04', text: 'Vefat sonrası varislerden en az 2\'si onayladığında kasa otomatik Anma Profili\'ne dönüşür.' },
              ].map((s) => (
                <div key={s.step} className="flex gap-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#c7a76f] bg-[#f4eee3]">
                    <span className="font-serif text-xs font-bold text-[#b08340]">{s.step}</span>
                  </div>
                  <p className="pt-1 text-sm leading-6 text-[#5b5245]">{s.text}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 flex items-center justify-between border-t border-[#e1d5c3] pt-5">
              <div>
                <p className="text-xs text-[#8a7a64]">49 ₾ kurulum + QR plaka</p>
                <p className="font-serif text-2xl text-[#173d31]">12,90 <span className="text-base text-[#b08340]">₾/ay</span></p>
                <p className="text-xs text-[#8a7a64]">veya 99 ₾/yıl</p>
              </div>
              <Link href="/pricing" className="inline-flex items-center gap-2 rounded-xl bg-[#103b2c] px-5 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-[#0b2b20]">
                Başla <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* GÜVENLİK ALTYAPISI */}
      <section className="bg-[#fbf8f1] px-5 py-16 sm:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.5fr_1fr]">
          <div>
            <h2 className="font-serif text-4xl text-[#173d31]">Güvenlik altyapısı</h2>
            <p className="mt-4 max-w-md leading-7 text-[#5b5245]">
              Sevdiklerinizin anıları bizim için emanettir. Verileriniz endüstri standardı
              şifreleme, erişim izolasyonu ve kalıcı yönlendirme altyapısıyla korunur.
            </p>
            <div className="mt-6 rounded-xl border border-[#d4e8dc] bg-[#edf7f1] p-4 text-sm text-[#2d5c3e]">
              <strong>Ömür boyu açık kalma taahhüdü.</strong> Oluşturulan Anma Profilleri kalıcıdır; ek ücret veya yenileme gerekmez. QR plakalar hiçbir zaman geçersiz hale gelmez.
            </div>
            <Link href="/privacy" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#9a7132]">
              Gizlilik politikasını oku <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {securityItems.map((item) => (
              <div key={item.title} className="rounded-lg border border-[#e1d5c3] bg-[#fffdf8] p-5 shadow-sm">
                <div className="flex gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-[#e1d5c3] bg-[#f4eee3] text-[#9a7132]">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-serif text-base text-[#173d31]">{item.title}</h3>
                    <p className="mt-1.5 text-sm leading-6 text-[#665d50]">{item.text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FİYATLANDIRMA */}
      <section id="fiyatlar" className="border-y border-[#e6dccb] bg-[#f7f2e9] px-5 py-16 sm:px-8">
        <div className="mx-auto mb-10 max-w-3xl text-center">
          <h2 className="font-serif text-4xl text-[#173d31] sm:text-5xl">Fiyatlandırma</h2>
          <p className="mt-4 leading-7 text-[#665d50]">İki ürün, iki ihtiyaç. QR plaka her ikisinde de dahildir.</p>
        </div>
        <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
          {/* Anma Profili */}
          <div className="flex flex-col rounded-2xl border border-[#e1d5c3] bg-[#fffdf8] p-7 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#8a7a64]">Yakınınız vefat etti</p>
            <h3 className="mt-1 font-serif text-2xl text-[#173d31]">Anma Profili</h3>
            <div className="my-5 flex items-end gap-2">
              <span className="font-serif text-5xl text-[#173d31]">249</span>
              <div className="mb-1.5">
                <span className="text-xl font-semibold text-[#b08340]">₾</span>
                <p className="text-sm text-[#8a7a64]">tek seferlik</p>
              </div>
            </div>
            <ul className="flex-1 space-y-2.5">
              {['Tam dijital anıt profili', 'Fotoğraf & video galerisi', 'Mezarlık konumu & Harita', 'Taziye / mum / çiçek özelliği', 'QR plaka üretimi ve gönderimi', 'Kimlik doğrulama + 14 gün itiraz', 'Ömür boyu erişim'].map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-[#4c463c]">
                  <Check className="h-4 w-4 shrink-0 text-[#b08340]" /> {f}
                </li>
              ))}
            </ul>
            <Link href="/pricing" className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#c7a76f] px-5 py-3 text-sm font-semibold text-[#173d31] transition hover:bg-[#f4eee3]">
              Detayları İncele <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Yaşam Kasası */}
          <div className="relative flex flex-col rounded-2xl border-2 border-[#b08340] bg-[#fffdf8] p-7 pt-11 shadow-lg ring-4 ring-[#b08340]/8">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#b08340] px-5 py-1.5 text-xs font-semibold text-white shadow">
              Hayattayken başlayın
            </div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#8a7a64]">Kendi mirasınızı kurun</p>
            <h3 className="mt-1 font-serif text-2xl text-[#173d31]">Yaşam Kasası</h3>
            <div className="my-5">
              <div className="flex items-end gap-2">
                <span className="font-serif text-5xl text-[#173d31]">12,90</span>
                <div className="mb-1.5">
                  <span className="text-xl font-semibold text-[#b08340]">₾/ay</span>
                  <p className="text-sm text-[#8a7a64]">veya 99 ₾/yıl</p>
                </div>
              </div>
              <p className="text-sm text-[#8a7a64]">+ 49 ₾ kurulum ücreti (QR plaka dahil)</p>
            </div>
            <ul className="flex-1 space-y-2.5">
              {['Gizli anı kasası (hayattayken)', 'Fotoğraf, video, ses kaydı', 'Son mesaj & kişisel biyografi', '3 varis belirleme', '2/3 onay → otomatik anıt profili', 'Aile bildirim sistemi', 'QR plaka kurulumda dahil'].map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-[#4c463c]">
                  <Check className="h-4 w-4 shrink-0 text-[#b08340]" /> {f}
                </li>
              ))}
            </ul>
            <Link href="/pricing" className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#103b2c] px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-[#0b2b20]">
              Yaşam Kasası Aç <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
        <p className="mt-6 text-center text-sm text-[#8a7a64]">
          Tüm detaylar için{' '}
          <Link href="/pricing" className="font-semibold text-[#9a7132] underline-offset-2 hover:underline">fiyatlandırma sayfasına</Link> bakın.
        </p>
      </section>

      {/* SSS ACCORDION */}
      <section id="sss" className="bg-[#fbf8f1] px-5 py-16 sm:px-8">
        <div className="mx-auto grid max-w-7xl items-start gap-10 lg:grid-cols-[0.65fr_1fr]">
          <div>
            <Image
              src="/images/landing/hero-family-memory.png"
              alt="Aile anıları ve dijital anıt deneyimi"
              width={760}
              height={500}
              className="h-[320px] rounded-lg object-cover shadow-xl shadow-[#4d3d26]/12"
            />
            <div className="mt-6 rounded-xl border border-[#d4e8dc] bg-[#edf7f1] p-5">
              <p className="font-serif text-lg text-[#173d31]">Başka sorunuz mu var?</p>
              <p className="mt-2 text-sm text-[#5b5245]">7 gün içinde yanıtlıyoruz — genellikle çok daha hızlı.</p>
              <Link href="/contact" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#2d7a53]">
                İletişime geçin <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div>
            <h2 className="mb-6 font-serif text-4xl text-[#173d31]">Sık sorulan sorular</h2>
            <div className="overflow-hidden rounded-2xl border border-[#e1d5c3] bg-[#fffdf8]">
              {faqs.map((faq, i) => (
                <div key={faq.q} className={i < faqs.length - 1 ? 'border-b border-[#e1d5c3]' : ''}>
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="flex w-full items-center justify-between px-6 py-4 text-left transition hover:bg-[#f7f2e9]"
                  >
                    <span className="font-serif text-lg text-[#173d31]">{faq.q}</span>
                    <ChevronDown
                      className={`h-5 w-5 shrink-0 text-[#b08340] transition-transform duration-200 ${openFaq === i ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {openFaq === i && (
                    <div className="border-t border-[#e1d5c3] bg-[#f7f2e9] px-6 py-4">
                      <p className="text-sm leading-7 text-[#5b5245]">{faq.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="bg-[#fbf8f1] px-5 pb-16 sm:px-8">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[1.35rem] px-6 py-10 text-center text-white shadow-2xl shadow-[#103b2c]/20 sm:px-10">
          <Image src="/images/landing/final-cta-leaves.png" alt="Koyu yeşil fonda altın yapraklı The Maradi iletişim alanı" fill sizes="100vw" className="absolute inset-0 object-cover" />
          <div className="absolute inset-0 bg-[#06291f]/10" />
          <div className="relative z-10 mx-auto max-w-3xl">
            <h2 className="font-serif text-3xl sm:text-4xl">Sevdiklerinizin anısını yaşatın.</h2>
            <p className="mt-3 text-lg text-[#e8decc]">Hatıraları geleceğe taşıyan dijital anıt deneyimine bugün başlayın.</p>
            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/pricing" className="inline-flex items-center justify-center gap-2 rounded-md bg-[#d1a85c] px-7 py-3 text-sm font-semibold text-[#103b2c] shadow-lg shadow-black/10 transition hover:bg-[#e0ba70]">
                Hemen Başla <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/contact" className="inline-flex items-center justify-center gap-2 rounded-md border border-[#d1a85c] bg-[#103b2c]/25 px-7 py-3 text-sm font-semibold text-white transition hover:bg-[#103b2c]/45">
                Bizimle iletişime geçin
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#0c3327] px-5 py-12 text-[#efe7d8] sm:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr_1.2fr]">
          <div>
            <div className="font-serif text-2xl">The Maradi</div>
            <p className="mt-4 max-w-xs text-sm leading-6 text-[#cfc3ad]">Hatıralar taşta değil, sevgiyle emanet edilir.</p>
            <p className="mt-4 text-xs text-[#8a7a64]">Ömür boyu açık kalma taahhüdü.</p>
          </div>
          <FooterColumn title="Platform" links={[
            { href: '/', label: 'Ana sayfa' },
            { href: '#nasil-calisir', label: 'Nasıl çalışır' },
            { href: '#ozellikler', label: 'Neden The Maradi?' },
            { href: '/memorial/demo', label: 'Örnek Profil' },
            { href: '/pricing', label: 'Fiyatlandırma' },
            { href: '#sss', label: 'SSS' },
          ]} />
          <FooterColumn title="Kurumsal" links={[
            { href: '/contact', label: 'Hakkımızda' },
            { href: '/contact', label: 'İletişim' },
          ]} />
          <FooterColumn title="Belgeler" links={[
            { href: '/privacy', label: 'Gizlilik Politikası' },
            { href: '/terms', label: 'Kullanım Koşulları' },
            { href: '/legal/verification-policy', label: 'Doğrulama Politikası' },
          ]} />
          <div>
            <h3 className="font-serif text-lg">İletişim</h3>
            <div className="mt-4 space-y-3 text-sm text-[#cfc3ad]">
              <div className="flex items-center gap-2"><MessageCircle className="h-4 w-4" /> info@themaradi.com</div>
              <div className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Batumi, Gürcistan</div>
            </div>
          </div>
        </div>
        <div className="mx-auto mt-10 max-w-7xl border-t border-white/10 pt-6 text-center text-xs text-[#b8aa93]">
          © 2026 The Maradi. Tüm hakları saklıdır.
        </div>
      </footer>
    </>
  )
}

function FooterColumn({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div>
      <h3 className="font-serif text-lg">{title}</h3>
      <div className="mt-4 space-y-2">
        {links.map((link) => (
          <Link key={`${link.href}-${link.label}`} href={link.href} className="block text-sm text-[#cfc3ad] transition hover:text-white">
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  )
}
