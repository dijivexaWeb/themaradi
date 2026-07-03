import type { Metadata } from 'next'
import Link from 'next/link'
import BrandLogo from '@/components/BrandLogo'
import { CheckCircle2, ArrowRight, Phone, Home, MessageCircle } from 'lucide-react'
import { buildWhatsAppChatLink } from '@/lib/whatsapp'

export const metadata: Metadata = {
  title: 'Teşekkürler',
  robots: { index: false, follow: true },
}

interface Props {
  searchParams: Promise<{
    type?: string
    name?: string
    pending_email?: string
    wa?: string
  }>
}

export default async function TesekkurPage({ searchParams }: Props) {
  const { type, name, pending_email, wa } = await searchParams

  const isPendingEmail = pending_email === '1'
  const displayName = name ? decodeURIComponent(name) : null
  const waLink = wa ? decodeURIComponent(wa) : null
  const fallbackWaLink = buildWhatsAppChatLink('Merhaba, siparişimle ilgili ödemeyi tamamlamak istiyorum.')

  const typeLabel =
    type === 'kasa'
      ? 'Yaşam Kasası'
      : type === 'aile'
      ? 'Aile Paketi'
      : 'Anma Profili'

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">

      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/95 backdrop-blur sticky top-0 z-10">
        <div className="mx-auto flex h-14 max-w-lg items-center px-4">
          <BrandLogo light href="/" />
        </div>
      </header>

      <div className="flex flex-1 flex-col items-center justify-center px-4 py-12">
        <div className="max-w-md w-full space-y-5">

          {/* Hero */}
          <div className="text-center">
            <div className="w-20 h-20 bg-emerald-500/15 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 className="h-10 w-10 text-emerald-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              {displayName ? `Teşekkürler, ${displayName}!` : 'Siparişiniz Alındı!'}
            </h1>
            <p className="text-slate-400 text-sm leading-6">
              <span className="text-amber-400 font-semibold">{typeLabel}</span>{' '}
              siparişiniz kaydedildi. Ödemeyi tamamlamak için WhatsApp&apos;tan bizimle
              iletişime geçin — ekibimiz size kişisel olarak yardımcı olacak.
            </p>
          </div>

          {/* WhatsApp CTA */}
          <div className="bg-slate-900 border border-[#25D366]/25 rounded-2xl p-5">
            <p className="text-xs text-[#25D366] uppercase tracking-wider font-semibold mb-4">
              Ödemeyi Tamamlayın
            </p>
            <p className="text-sm text-slate-400 leading-6 mb-4">
              Aşağıdaki butona tıklayarak WhatsApp üzerinden bize ulaşın. Sipariş
              detaylarınız otomatik olarak mesaja eklenmiş olacak.
            </p>
            <a
              href={waLink ?? fallbackWaLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 bg-gradient-to-tr from-[#128C7E] to-[#25D366] hover:brightness-110 text-white font-semibold py-3.5 rounded-xl transition-all text-sm"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp&apos;tan Devam Et
            </a>
            {!waLink && (
              <p className="text-xs text-slate-600 mt-3 leading-5">
                Sipariş özetiniz bulunamadı, ancak yukarıdaki butonla doğrudan bize
                yazabilirsiniz.
              </p>
            )}
          </div>

          {/* Adımlar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
              Süreç
            </p>
            <Step num={1} done label="Sipariş alındı" />
            <Step num={2} active label="WhatsApp'tan ödemeyi tamamlayın" sub="Ekibimiz size ödeme detaylarını iletecek" />
            <Step num={3} label="Ekibimiz ödemeyi onaylar" sub="Genellikle 24 saat içinde" />
            <Step num={4} label="Sayfanız aktive edilir" sub="Giriş yapıp içerik ekleyebilirsiniz" />
          </div>

          {/* E-posta doğrulama notu */}
          {isPendingEmail && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-sm text-amber-300 leading-6">
              <p className="font-semibold mb-1">📧 E-postanızı doğrulayın</p>
              <p className="text-amber-400/80 text-xs">
                Kayıt e-postanıza bir doğrulama bağlantısı gönderdik. Ödeme onaylandıktan
                sonra hesabınıza giriş yapabilmek için önce bu bağlantıya tıklayın.
              </p>
            </div>
          )}

          {/* Bilgi notu */}
          <div className="flex items-start gap-2.5 bg-slate-800/40 border border-slate-700/50 rounded-xl px-4 py-3 text-xs text-slate-400 leading-5">
            <span className="text-base shrink-0 mt-px">🕐</span>
            <p>
              Saat <strong className="text-slate-300">18:00</strong>&apos;dan sonra yapılan
              ödemeler bir sonraki iş günü onaylanır. Sorun yaşarsanız bizimle iletişime geçin.
            </p>
          </div>

          {/* Aksiyonlar */}
          <div className="space-y-3 pt-1">
            <Link
              href="/login"
              className="inline-flex w-full items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
            >
              Giriş Yap
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex w-full items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium py-3 rounded-xl transition-colors text-sm border border-slate-700"
            >
              <Phone className="h-4 w-4" />
              Sorun mu Yaşıyorsunuz? İletişime Geçin
            </Link>
            <Link
              href="/"
              className="flex items-center justify-center gap-2 text-sm text-slate-500 hover:text-slate-400 transition-colors py-2"
            >
              <Home className="h-3.5 w-3.5" />
              Ana Sayfaya Dön
            </Link>
          </div>

        </div>
      </div>
    </div>
  )
}

function Step({
  num,
  label,
  sub,
  done,
  active,
}: {
  num: number
  label: string
  sub?: string
  done?: boolean
  active?: boolean
}) {
  return (
    <div className="flex items-start gap-3">
      <div
        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 border
          ${done
            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
            : active
            ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
            : 'bg-slate-800 text-slate-500 border-slate-700'
          }`}
      >
        {done ? '✓' : num}
      </div>
      <div>
        <p
          className={`text-sm font-medium ${
            done ? 'text-emerald-400' : active ? 'text-white' : 'text-slate-500'
          }`}
        >
          {label}
        </p>
        {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}
