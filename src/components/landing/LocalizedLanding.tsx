'use client'

import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowRight,
  BookOpen,
  Camera,
  Check,
  Cloud,
  Heart,
  Image as ImageIcon,
  LockKeyhole,
  MapPin,
  MessageCircle,
  Play,
  QrCode,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react'

const quickSteps = [
  {
    icon: QrCode,
    title: 'QR kod yerleştirilir',
    text: 'Mezar taşı veya özel anı plakasına dayanıklı bir QR kod eklenir.',
  },
  {
    icon: BookOpen,
    title: 'Dijital anıt profili açılır',
    text: 'Hayat hikayesi, fotoğraflar, videolar ve aile notları tek sayfada toplanır.',
  },
  {
    icon: Users,
    title: 'Anılar nesillere aktarılır',
    text: 'Ziyaretçiler QR kodu okutarak saygılı ve güvenli anı sayfasına ulaşır.',
  },
]

const values = [
  { icon: BookOpen, title: 'Hatıraları kalıcı hale getirir', text: 'Fotoğraflar, hikayeler ve videolar düzenli bir dijital anı alanında saklanır.' },
  { icon: QrCode, title: 'Fiziksel ve dijital dünyayı birleştirir', text: 'Mezar taşı üzerindeki QR kod, anı sayfasına doğrudan kapı açar.' },
  { icon: Users, title: 'Aile için kolay yönetim', text: 'Yetkili aile üyeleri profili zaman içinde güncelleyebilir.' },
  { icon: Sparkles, title: 'Saygılı ve zarif deneyim', text: 'Tasarım sakin, okunaklı ve anma duygusuna uygun ilerler.' },
  { icon: Heart, title: 'Anlamlı ziyaret deneyimi', text: 'Yakınlar yalnızca bir isim değil, yaşanmış bir hayatla karşılaşır.' },
]

const process = [
  { icon: QrCode, title: 'QR kod hazırlanır', text: 'Kişiye özel QR plakası üretilir ve fiziksel alana yerleştirilir.' },
  { icon: BookOpen, title: 'Profil oluşturulur', text: 'Ad, yıllar, biyografi ve aile tarafından seçilen temel bilgiler eklenir.' },
  { icon: Camera, title: 'İçerikler eklenir', text: 'Fotoğraflar, videolar, belgeler ve anılar güvenli şekilde düzenlenir.' },
  { icon: MessageCircle, title: 'Ziyaretçiler ulaşır', text: 'QR okutulduğunda anı sayfası açılır; ziyaretçiler saygıyla okuyabilir.' },
]

const security = [
  { icon: Cloud, title: 'Güvenli bulut altyapısı', text: 'Veriler güvenilir sunucularda saklanır ve düzenli olarak korunur.' },
  { icon: LockKeyhole, title: 'Erişim yetkilendirme', text: 'Profil yönetimi yalnızca yetkili aile üyeleri tarafından yapılır.' },
  { icon: ShieldCheck, title: 'Yedekleme ve koruma', text: 'İçerikler kaybolmaya karşı kontrollü yedekleme mantığıyla korunur.' },
  { icon: QrCode, title: 'Uzun ömürlü QR akışı', text: 'QR kodlar sayfa adresi değişse bile yönlendirme mantığıyla yaşatılır.' },
]

const plans = [
  {
    name: 'Başlangıç',
    desc: 'Temel dijital anıt deneyimi',
    price: '₺1.490',
    features: ['Özel QR plaka', 'Dijital anıt profili', '20 fotoğrafa kadar alan', 'Hayat hikayesi', 'Temel destek'],
  },
  {
    name: 'Standart',
    desc: 'Gelişmiş anı paylaşımı',
    price: '₺2.490',
    popular: true,
    features: ['Özel QR plaka', 'Dijital anıt profili', '100 fotoğrafa kadar alan', '10 videoya kadar alan', 'Anı ve hatıra ekleme', 'Öncelikli destek'],
  },
  {
    name: 'Anı Plus',
    desc: 'Kapsamlı ve sınırsız deneyim',
    price: '₺3.990',
    features: ['Özel QR plaka', 'Dijital anıt profili', 'Geniş fotoğraf ve video alanı', 'Gelişmiş arşiv kontrolü', 'Aile yönetim paneli', 'Özel danışmanlık'],
  },
]

const faqs = [
  'The Maradi bir aile ağacı platformu mu?',
  'QR kod ne kadar dayanıklıdır?',
  'Aile üyeleri içerik ekleyebilir mi?',
  'Profil sayfası sonradan güncellenebilir mi?',
  'Veriler nasıl korunur?',
]

export default function LocalizedLanding() {
  return (
    <>
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
              fotoğraflarını, videolarını ve anlamlarını barındıran dijital anıt
              sayfalarına açılır.
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

      <section id="nasil-calisir" className="border-b border-[#e6dccb] bg-[#fbf8f1] px-5 py-8 sm:px-8">
        <div className="mx-auto grid max-w-7xl gap-5 md:grid-cols-3">
          {quickSteps.map((item, index) => (
            <InfoCard key={item.title}>
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
            </InfoCard>
          ))}
        </div>
      </section>

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
                  <p className="mt-1 text-xs text-[#8a7a64]">1940 - 2020</p>
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
                  <ProfileTab icon={BookOpen} label="Hayat Hikayesi" />
                  <ProfileTab icon={ImageIcon} label="Fotoğraflar" />
                  <ProfileTab icon={Play} label="Videolar" />
                  <ProfileTab icon={Heart} label="66 Anılar" />
                </div>
                <div className="mt-5 grid grid-cols-4 gap-3">
                  {[
                    ['/images/landing/profile-family-old.png', 'Eski aile fotoğrafı'],
                    ['/images/landing/profile-family-dinner.png', 'Aile sofrasında anı'],
                    ['/images/landing/profile-family-main.png', 'Aile portresi'],
                    ['/images/landing/profile-georgia.png', 'Anı yeri ve manzara'],
                  ].map(([src, alt]) => (
                    <Image
                      key={src}
                      src={src}
                      alt={alt}
                      width={190}
                      height={130}
                      className="h-20 rounded-md object-cover shadow-sm"
                    />
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

      <section className="border-y border-[#e6dccb] bg-[#fbf8f1] px-5 py-8 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-5 rounded-lg bg-[#fffdf8] px-4 py-5 md:grid-cols-4 md:gap-0">
            {[
              { icon: ShieldCheck, title: 'Hatıralar Güvende', text: 'Anılarınız dijital ortamda korunur, zamanla kaybolmaz.' },
              { icon: Sparkles, title: 'Anlamlı Ziyaretler', text: 'Her ziyaret, sevdiklerinizle daha derin bir bağ kurmanızı sağlar.' },
              { icon: QrCode, title: 'Kolay Erişim', text: 'QR kod ile saniyeler içinde zengin dijital anı sayfasına ulaşılır.' },
              { icon: Users, title: 'Yeni Nesillere Miras', text: 'Hikayeleriniz, değerleriniz ve anılarınız gelecek nesillere ilham olur.' },
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
            <Image
              src="/images/landing/cta-candle-olive.png"
              alt="Mum ve zeytin dallarıyla anma atmosferi"
              fill
              sizes="100vw"
              className="absolute inset-0 object-cover"
            />
            <div className="absolute inset-0 bg-[#06291f]/35" />
            <div className="relative z-10">
              <h2 className="font-serif text-2xl sm:text-3xl">Bir ismi değil, bir hayatı yaşatın.</h2>
              <Link href="/contact" className="mt-5 inline-flex items-center justify-center gap-2 rounded-md bg-[#d1a85c] px-7 py-3 text-sm font-semibold text-[#103b2c] shadow-lg shadow-black/10 transition hover:bg-[#e0ba70]">
                Bizimle İletişime Geçin
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section id="ozellikler" className="bg-[#fbf8f1] px-5 py-16 sm:px-8">
        <SectionHeader title="Neden The Maradi?" subtitle="Bir mezar taşından fazlasını, saygılı ve kalıcı bir dijital anı deneyimine dönüştürür." />
        <div className="mx-auto grid max-w-7xl gap-5 md:grid-cols-5">
          {values.map((item) => (
            <div key={item.title} className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full text-[#8a682e]">
                <item.icon className="h-8 w-8" />
              </div>
              <h3 className="mt-4 font-serif text-lg leading-6 text-[#173d31]">{item.title}</h3>
              <p className="mt-3 text-sm leading-6 text-[#665d50]">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-[#e6dccb] bg-[#f7f2e9] px-5 py-16 sm:px-8">
        <SectionHeader title="Nasıl çalışır?" subtitle="Aileler ve ziyaretçiler için basit, anlaşılır ve güvenli bir akış." />
        <div className="mx-auto grid max-w-7xl gap-5 md:grid-cols-4">
          {process.map((item, index) => (
            <InfoCard key={item.title}>
              <div className="mb-5 flex items-center justify-between">
                <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[#e1d5c3] bg-[#f4eee3] text-[#9a7132]">
                  <item.icon className="h-8 w-8" />
                </div>
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#b08340] text-sm font-semibold text-white">{index + 1}</span>
              </div>
              <h3 className="font-serif text-xl text-[#173d31]">{item.title}</h3>
              <p className="mt-3 text-sm leading-6 text-[#665d50]">{item.text}</p>
            </InfoCard>
          ))}
        </div>
      </section>

      <section className="bg-[#fbf8f1] px-5 py-16 sm:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.55fr_1fr]">
          <div>
            <h2 className="font-serif text-4xl text-[#173d31]">Güvenlik altyapısı</h2>
            <p className="mt-4 max-w-md leading-7 text-[#5b5245]">
              Sevdiklerinizin anıları bizim için emanet. En yüksek güvenlik standartlarıyla,
              erişim kontrolü ve yedekleme prensipleriyle korunur.
            </p>
            <Link href="/privacy" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#9a7132]">
              Veri güvenliği hakkında daha fazla bilgi
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {security.map((item) => (
              <InfoCard key={item.title}>
                <div className="flex gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md border border-[#e1d5c3] bg-[#f4eee3] text-[#9a7132]">
                    <item.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg text-[#173d31]">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-[#665d50]">{item.text}</p>
                  </div>
                </div>
              </InfoCard>
            ))}
          </div>
        </div>
      </section>

      <section id="fiyatlar" className="border-y border-[#e6dccb] bg-[#f7f2e9] px-5 py-16 sm:px-8">
        <SectionHeader title="Fiyatlandırma" subtitle="Tek seferlik, anlaşılır paketler. KDV ve özel üretim detayları teklif aşamasında netleştirilir." />
        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <div key={plan.name} className={`relative rounded-lg border bg-[#fffdf8] p-7 shadow-lg shadow-[#4d3d26]/8 ${plan.popular ? 'border-[#b08340] ring-2 ring-[#b08340]/15' : 'border-[#e1d5c3]'}`}>
              {plan.popular ? (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-b-md bg-[#b08340] px-7 py-2 text-xs font-semibold text-white">
                  En popüler
                </div>
              ) : null}
              <h3 className="text-center font-serif text-3xl text-[#173d31]">{plan.name}</h3>
              <p className="mt-2 text-center text-sm text-[#665d50]">{plan.desc}</p>
              <div className="mt-7 text-center font-serif text-4xl text-[#173d31]">{plan.price}</div>
              <div className="text-center text-xs text-[#8a7a64]">tek seferlik</div>
              <ul className="mt-7 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-2 text-sm text-[#554d42]">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#173d31]" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Link href="/contact" className={`mt-8 inline-flex w-full items-center justify-center rounded-md border px-4 py-3 text-sm font-semibold transition ${plan.popular ? 'border-[#103b2c] bg-[#103b2c] text-white hover:bg-[#0b2b20]' : 'border-[#c7a76f] text-[#173d31] hover:bg-[#f4eee3]'}`}>
                Paketi incele
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section id="sss" className="bg-[#fbf8f1] px-5 py-16 sm:px-8">
        <div className="mx-auto grid max-w-7xl items-center gap-8 lg:grid-cols-[0.75fr_1fr]">
          <Image
            src="/images/landing/hero-family-memory.png"
            alt="Aile anıları ve dijital anıt deneyimi"
            width={760}
            height={500}
            className="h-[320px] rounded-lg object-cover shadow-xl shadow-[#4d3d26]/12"
          />
          <div>
            <h2 className="font-serif text-4xl text-[#173d31]">Sık sorulan sorular</h2>
            <div className="mt-6 overflow-hidden rounded-lg border border-[#e1d5c3] bg-white">
              {faqs.map((faq) => (
                <button key={faq} className="flex w-full items-center justify-between border-b border-[#eee4d5] px-5 py-4 text-left font-serif text-lg text-[#173d31] last:border-b-0">
                  {faq}
                  <span className="text-2xl text-[#9a7132]">+</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#fbf8f1] px-5 pb-16 sm:px-8">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[1.35rem] px-6 py-10 text-center text-white shadow-2xl shadow-[#103b2c]/20 sm:px-10">
          <Image
            src="/images/landing/final-cta-leaves.png"
            alt="Koyu yeşil fonda altın yapraklı The Maradi iletişim alanı"
            fill
            sizes="100vw"
            className="absolute inset-0 object-cover"
          />
          <div className="absolute inset-0 bg-[#06291f]/10" />
          <div className="relative z-10 mx-auto max-w-3xl">
            <h2 className="font-serif text-3xl sm:text-4xl">Bir mezar taşından fazlasını sunun.</h2>
            <p className="mt-3 text-lg text-[#e8decc]">
              Hatıraları geleceğe taşıyan dijital anıt deneyimini keşfedin.
            </p>
            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/contact" className="inline-flex items-center justify-center gap-2 rounded-md bg-[#d1a85c] px-7 py-3 text-sm font-semibold text-[#103b2c] shadow-lg shadow-black/10 transition hover:bg-[#e0ba70]">
                Demo talep et
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/contact" className="inline-flex items-center justify-center gap-2 rounded-md border border-[#d1a85c] bg-[#103b2c]/25 px-7 py-3 text-sm font-semibold text-white transition hover:bg-[#103b2c]/45">
                Bizimle iletişime geçin
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-[#0c3327] px-5 py-12 text-[#efe7d8] sm:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr_1.2fr]">
          <div>
            <div className="font-serif text-2xl">The Maradi</div>
            <p className="mt-4 max-w-xs text-sm leading-6 text-[#cfc3ad]">
              Hatıralar taşta değil, sevgiyle emanet edilir.
            </p>
          </div>
          <FooterColumn title="Platform" links={['Ana sayfa', 'Nasıl çalışır', 'Dijital anıtlar', 'Fiyatlandırma', 'SSS']} />
          <FooterColumn title="Kurumsal" links={['Hakkımızda', 'Vizyon & Misyon', 'İletişim']} />
          <FooterColumn title="Belgeler" links={['Gizlilik politikası', 'Kullanım koşulları', 'KVKK aydınlatma metni']} />
          <div>
            <h3 className="font-serif text-lg">İletişim</h3>
            <div className="mt-4 space-y-3 text-sm text-[#cfc3ad]">
              <div className="flex items-center gap-2"><MessageCircle className="h-4 w-4" /> info@themaradi.com</div>
              <div className="flex items-center gap-2"><MapPin className="h-4 w-4" /> İstanbul, Türkiye</div>
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

function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mx-auto mb-10 max-w-3xl text-center">
      <h2 className="font-serif text-4xl text-[#173d31] sm:text-5xl">{title}</h2>
      <p className="mt-4 leading-7 text-[#665d50]">{subtitle}</p>
    </div>
  )
}

function InfoCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-[#e1d5c3] bg-[#fffdf8] p-6 shadow-sm shadow-[#4d3d26]/5">
      {children}
    </div>
  )
}

function MiniStat({ icon: Icon, label, value }: { icon: typeof BookOpen; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[#e1d5c3] bg-white p-2">
      <Icon className="mx-auto h-4 w-4 text-[#9a7132]" />
      <div className="mt-1 font-semibold text-[#173d31]">{value}</div>
      <div>{label}</div>
    </div>
  )
}

function ProfileTab({ icon: Icon, label }: { icon: typeof BookOpen; label: string }) {
  return (
    <div className="rounded-md border border-[#e1d5c3] bg-[#fbf8f1] px-3 py-3 text-center">
      <Icon className="mx-auto h-5 w-5 text-[#9a7132]" />
      <div className="mt-2 text-xs font-semibold text-[#173d31]">{label}</div>
    </div>
  )
}

function FooterColumn({ title, links }: { title: string; links: string[] }) {
  return (
    <div>
      <h3 className="font-serif text-lg">{title}</h3>
      <div className="mt-4 space-y-2">
        {links.map((link) => (
          <div key={link} className="text-sm text-[#cfc3ad]">
            {link}
          </div>
        ))}
      </div>
    </div>
  )
}
