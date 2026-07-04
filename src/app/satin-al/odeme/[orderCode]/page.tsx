import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import BrandLogo from '@/components/BrandLogo'
import { CheckCircle2, ArrowRight, Phone, Home, MessageCircle, Clock } from 'lucide-react'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { buildWhatsAppChatLink, buildWhatsAppPaymentSubmittedLink } from '@/lib/whatsapp'
import { markPaymentSubmitted } from '../actions'

export const metadata: Metadata = {
  title: 'Ödeme',
  robots: { index: false, follow: true },
}

const PRODUCT_LABELS: Record<string, string> = {
  memorial_one_time: 'Anma Profili',
  vault_setup: 'Yaşam Kasası',
  vault_monthly: 'Yaşam Kasası (Aylık)',
  family_package: 'Aile Paketi',
}

// pending sonrası ulaşılabilecek her durum — "ödeme bildirimi alındı" ekranını gösterir
const SUBMITTED_STATUSES = new Set([
  'payment_verification', 'paid', 'info_pending', 'profile_preparing',
  'publish_approval', 'published', 'completed',
])

interface Props {
  params: Promise<{ orderCode: string }>
  searchParams: Promise<{ type?: string; name?: string; wa?: string; pending_email?: string }>
}

export default async function OdemePage({ params, searchParams }: Props) {
  const { orderCode: paymentId } = await params
  const { name, wa, pending_email } = await searchParams

  const supabase = await createClient()
  const service = await createServiceClient()

  const { data: payment } = await service
    .from('payments')
    .select('id, order_code, amount, currency, product_type, status, user_id, order_locale')
    .eq('id', paymentId)
    .maybeSingle()

  if (!payment) notFound()

  const { data: { user } } = await supabase.auth.getUser()
  if (user && payment.user_id !== user.id) notFound()

  const isPendingEmail = pending_email === '1'
  const displayName = name ? decodeURIComponent(name) : null
  const fallbackWaLink = buildWhatsAppChatLink('Merhaba, siparişimle ilgili ödemeyi tamamlamak istiyorum.')
  const waLink = wa ? decodeURIComponent(wa) : fallbackWaLink
  const productLabel = PRODUCT_LABELS[payment.product_type] ?? 'Sipariş'
  const alreadySubmitted = SUBMITTED_STATUSES.has(payment.status)
  const paymentSubmittedWaLink = buildWhatsAppPaymentSubmittedLink({
    senderName: displayName ?? 'Müşteri',
    orderCode: payment.order_code,
    locale: payment.order_locale,
  })

  const passthroughParams = new URLSearchParams()
  if (name) passthroughParams.set('name', name)
  if (wa) passthroughParams.set('wa', wa)
  if (isPendingEmail) passthroughParams.set('pending_email', '1')
  const queryString = passthroughParams.toString() ? `?${passthroughParams.toString()}` : ''

  const boundMarkPaid = markPaymentSubmitted.bind(null, payment.id, queryString)

  let bankSettings: Record<string, string> = {}
  if (!alreadySubmitted) {
    const { data: settingsRows } = await service
      .from('platform_settings')
      .select('key, value')
      .in('key', ['bank_iban', 'bank_name', 'bank_recipient'])
    bankSettings = Object.fromEntries((settingsRows ?? []).map((r) => [r.key, r.value]))
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
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
              <span className="text-amber-400 font-semibold">{productLabel}</span> siparişiniz kaydedildi.
            </p>
          </div>

          {/* Sipariş kodu */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-center">
            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1.5">Sipariş Kodunuz</p>
            <p className="text-2xl font-bold text-amber-400 tracking-wide font-mono">{payment.order_code}</p>
            <p className="text-xs text-slate-600 mt-2">{payment.amount} {payment.currency} — {productLabel}</p>
          </div>

          {alreadySubmitted ? (
            <div className="bg-slate-900 border border-emerald-500/25 rounded-2xl p-5">
              <p className="text-xs text-emerald-400 uppercase tracking-wider font-semibold mb-3 flex items-center gap-2">
                <Clock className="h-3.5 w-3.5" /> Ödeme Doğrulama Bekliyor
              </p>
              <p className="text-sm text-slate-300 leading-6 mb-4">
                Teşekkür ederiz. Ödemeniz doğrulama sürecine alınmıştır. Kontrol tamamlandığında
                size e-posta ile bilgi verilecektir. Bu sırada hesabınıza giriş yaparak anma
                profili için gerekli bilgileri hazırlamaya başlayabilirsiniz.
              </p>
              <div className="space-y-3">
                <Link
                  href="/login"
                  className="inline-flex w-full items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
                >
                  Hesabıma Giriş Yap
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href={paymentSubmittedWaLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full items-center justify-center gap-2 bg-gradient-to-tr from-[#128C7E] to-[#25D366] hover:brightness-110 text-white font-semibold py-3 rounded-xl transition-all text-sm"
                >
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp ile Bilgi Ver
                </a>
              </div>
            </div>
          ) : (
            <>
              {/* Banka bilgisi */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-4">
                  Banka Havalesi ile Ödeme
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-slate-500">Alıcı</span><span className="text-slate-200 font-medium">{bankSettings.bank_recipient || 'The Eternal Memory LLC'}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Banka</span><span className="text-slate-200 font-medium">{bankSettings.bank_name || 'TBC Bank'}</span></div>
                  <div className="flex justify-between items-start gap-2"><span className="text-slate-500 shrink-0">IBAN</span><span className="text-slate-200 font-mono text-xs text-right break-all">{bankSettings.bank_iban || 'GE29TB7522145061700002'}</span></div>
                  <div className="flex justify-between pt-2 border-t border-slate-800"><span className="text-slate-500">Tutar</span><span className="text-white font-bold">{payment.amount} {payment.currency}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Açıklama</span><span className="text-amber-400 font-mono font-semibold">{payment.order_code}</span></div>
                </div>
                <p className="text-xs text-amber-400/80 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2.5 mt-4 leading-5">
                  Lütfen havale açıklamasına mutlaka sipariş kodunuzu ({payment.order_code}) yazın. Bu kod ödeme doğrulaması için gereklidir.
                </p>
              </div>

              {/* Aksiyonlar */}
              <form action={boundMarkPaid}>
                <button
                  type="submit"
                  className="inline-flex w-full items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-white font-semibold py-3.5 rounded-xl transition-colors text-sm"
                >
                  Ödemeyi Tamamladım
                </button>
              </form>

              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center gap-2 bg-gradient-to-tr from-[#128C7E] to-[#25D366] hover:brightness-110 text-white font-semibold py-3.5 rounded-xl transition-all text-sm"
              >
                <MessageCircle className="h-4 w-4" />
                Sorularım Var, WhatsApp&apos;a Yaz
              </a>
            </>
          )}

          {/* Adımlar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Süreç</p>
            <Step num={1} done label="Sipariş alındı" />
            <Step num={2} done={alreadySubmitted} active={!alreadySubmitted} label="Ödemeyi tamamlayın" sub="Banka havalesi veya WhatsApp üzerinden" />
            <Step num={3} active={alreadySubmitted} label="Ekibimiz ödemeyi onaylar" sub="Genellikle 24 saat içinde" />
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

          {!alreadySubmitted && (
            <div className="flex items-start gap-2.5 bg-slate-800/40 border border-slate-700/50 rounded-xl px-4 py-3 text-xs text-slate-400 leading-5">
              <span className="text-base shrink-0 mt-px">🕐</span>
              <p>
                Saat <strong className="text-slate-300">18:00</strong>&apos;dan sonra yapılan
                ödemeler bir sonraki iş günü onaylanır. Sorun yaşarsanız bizimle iletişime geçin.
              </p>
            </div>
          )}

          {/* Aksiyonlar */}
          <div className="space-y-3 pt-1">
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
