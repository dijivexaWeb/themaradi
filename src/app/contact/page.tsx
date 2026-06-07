import type { Metadata } from 'next'
import Link from 'next/link'
import { Clock, Feather, Mail, MapPin, Phone } from 'lucide-react'
import ContactForm from './ContactForm'

export const metadata: Metadata = {
  title: 'İletişim — The Maradi',
  description:
    'The Maradi ile iletişime geçin. Batumi, Gürcistan ofisimiz — Anma Profili, Yaşam Kasası ve QR plaka soruları için.',
}

const contactItems = [
  {
    icon: Phone,
    label: 'Telefon',
    lines: [
      { text: '+995 555 511 884', href: 'tel:+995555511884', tag: 'Gürcistan' },
    ],
  },
  {
    icon: Mail,
    label: 'E-posta',
    lines: [
      { text: 'info@themaradi.com', href: 'mailto:info@themaradi.com', tag: 'Genel' },
      { text: 'support@themaradi.com', href: 'mailto:support@themaradi.com', tag: 'Destek' },
    ],
  },
  {
    icon: MapPin,
    label: 'Adres',
    lines: [
      { text: 'Petre Bagrationi Str. 220', href: null, tag: null },
      { text: 'Batumi / Gürcistan', href: null, tag: null },
    ],
  },
  {
    icon: Clock,
    label: 'Çalışma saatleri',
    lines: [
      { text: 'Pzt–Cum  09:00 – 18:00', href: null, tag: 'GE saati' },
      { text: 'Cmt  10:00 – 14:00', href: null, tag: null },
    ],
  },
]

const departments = [
  {
    email: 'support@themaradi.com',
    title: 'Destek',
    desc: 'Hesap, profil ve teknik sorular.',
  },
  {
    email: 'partner@themaradi.com',
    title: 'İş birliği',
    desc: 'Mezar taşı atölyeleri, cenaze hizmetleri ve B2B.',
  },
  {
    email: 'privacy@themaradi.com',
    title: 'Gizlilik',
    desc: 'GDPR ve kişisel veri talepleri.',
  },
]

export default function ContactPage() {
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
            <Link href="/pricing" className="hover:text-[#9a7132]">Fiyatlar</Link>
            <Link href="/memorial/demo" className="hover:text-[#9a7132]">Örnek Profil</Link>
          </div>
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 rounded-md bg-[#103b2c] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#103b2c]/15 transition hover:bg-[#0b2b20]"
          >
            Başla
          </Link>
        </div>
      </nav>

      <main className="pt-16">

        {/* HERO */}
        <section className="border-b border-[#e6dccb] px-5 py-14 sm:px-8 sm:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-4 flex items-center justify-center gap-3 text-[#b08340]">
              <span className="h-px w-10 bg-[#c7a76f]" />
              <span className="text-xs tracking-[0.2em] uppercase">İletişim</span>
              <span className="h-px w-10 bg-[#c7a76f]" />
            </div>
            <h1 className="font-serif text-5xl leading-tight text-[#173d31] sm:text-[3.5rem]">
              Size nasıl<br />
              <span className="text-[#b08340]">yardımcı olabiliriz?</span>
            </h1>
            <p className="mx-auto mt-5 max-w-lg text-base leading-8 text-[#5b5245]">
              Anma Profili, Yaşam Kasası veya QR plaka konusunda aklınızdaki her soruyu yanıtlamak için buradayız.
              Genellikle 24 saat içinde dönüş yapıyoruz.
            </p>
          </div>
        </section>

        {/* İLETİŞİM BİLGİLERİ + FORM */}
        <section className="px-5 py-16 sm:px-8">
          <div className="mx-auto grid max-w-5xl gap-12 lg:grid-cols-[1fr_1.4fr]">

            {/* SOL — İletişim bilgileri */}
            <div className="space-y-8">
              {contactItems.map((item) => (
                <div key={item.label} className="flex gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#e1d5c3] bg-[#f4eee3] text-[#b08340]">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="mb-1.5 text-xs font-semibold uppercase tracking-widest text-[#8a7a64]">
                      {item.label}
                    </p>
                    {item.lines.map((line, i) => (
                      <div key={i} className="flex items-center gap-2">
                        {line.href ? (
                          <a
                            href={line.href}
                            className="font-serif text-base text-[#173d31] transition hover:text-[#9a7132]"
                          >
                            {line.text}
                          </a>
                        ) : (
                          <span className="font-serif text-base text-[#173d31]">{line.text}</span>
                        )}
                        {line.tag && (
                          <span className="rounded-full border border-[#e1d5c3] bg-[#f4eee3] px-2 py-0.5 text-[10px] font-semibold text-[#b08340]">
                            {line.tag}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Harita */}
              <div className="overflow-hidden rounded-2xl border border-[#e1d5c3] shadow-sm">
                <iframe
                  title="The Maradi — Batumi ofisi"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d734.4!2d41.6265!3d41.6406!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4053b8b9b4e4c5a7%3A0x0!2sPetre+Bagrationi+St+220%2C+Batumi!5e0!3m2!1str!2sge!4v1717750000000!5m2!1str!2sge"
                  width="100%"
                  height="220"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>

            {/* SAĞ — Form */}
            <div className="rounded-2xl border border-[#e1d5c3] bg-[#fffdf8] p-7 shadow-lg shadow-[#4d3d26]/6 sm:p-9">
              <h2 className="mb-1 font-serif text-2xl text-[#173d31]">Mesaj gönderin</h2>
              <p className="mb-7 text-sm text-[#8a7a64]">Tüm alanlar zorunludur.</p>
              <ContactForm />
            </div>
          </div>
        </section>

        {/* DEPARTMANLAR */}
        <section className="border-t border-[#e6dccb] bg-[#f7f2e9] px-5 py-14 sm:px-8">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-8 text-center font-serif text-3xl text-[#173d31]">
              Doğrudan departmanlarımıza yazın
            </h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {departments.map((d) => (
                <a
                  key={d.email}
                  href={`mailto:${d.email}`}
                  className="group flex flex-col gap-2 rounded-2xl border border-[#e1d5c3] bg-[#fffdf8] p-6 shadow-sm transition hover:border-[#c7a76f] hover:shadow-md"
                >
                  <h3 className="font-serif text-lg text-[#173d31]">{d.title}</h3>
                  <p className="text-sm leading-6 text-[#5b5245]">{d.desc}</p>
                  <span className="mt-auto text-sm font-medium text-[#9a7132] underline-offset-2 group-hover:underline">
                    {d.email}
                  </span>
                </a>
              ))}
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
            <Link href="/terms" className="hover:text-[#173d31]">Koşullar</Link>
            <Link href="/pricing" className="hover:text-[#173d31]">Fiyatlar</Link>
          </div>
          <span>© 2026 The Maradi</span>
        </div>
      </footer>

    </div>
  )
}
