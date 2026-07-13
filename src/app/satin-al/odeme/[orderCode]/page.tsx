import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import BrandLogo from '@/components/BrandLogo'
import { CheckCircle2, ArrowRight, Phone, Home, MessageCircle, Clock, CreditCard, AlertTriangle } from 'lucide-react'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { buildWhatsAppChatLink, buildWhatsAppPaymentSubmittedLink } from '@/lib/whatsapp'
import { markPaymentSubmitted, initiateBogPayment } from '../actions'
import { getBogSettings } from '@/lib/bog'

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

const PROFILE_FOR_LABELS: Record<string, string> = {
  baba: 'Babam için', anne: 'Annem için', es: 'Eşim için',
  kardes: 'Kardeşim için', yakin: 'Yakınım için', diger: 'Diğer',
}

const LOCALE_LABELS: Record<string, string> = {
  tr: 'Türkçe', ka: 'Gürcüce', ru: 'Rusça', en: 'İngilizce', az: 'Azerice', hy: 'Ermenice', he: 'İbranice',
}

// pending sonrası ulaşılabilecek her durum — "ödeme bildirimi alındı" ekranını gösterir
const SUBMITTED_STATUSES = new Set([
  'payment_verification', 'paid', 'info_pending', 'profile_preparing',
  'publish_approval', 'published', 'completed',
])

interface Props {
  params: Promise<{ orderCode: string }>
  searchParams: Promise<{ type?: string; name?: string; wa?: string; pending_email?: string; bog?: string }>
}

export default async function OdemePage({ params, searchParams }: Props) {
  const { orderCode: paymentId } = await params
  const { name, wa, pending_email, bog } = await searchParams

  const supabase = await createClient()
  const service = await createServiceClient()

  const { data: payment } = await service
    .from('payments')
    .select('id, order_code, amount, currency, product_type, status, user_id, order_locale, profile_for')
    .eq('id', paymentId)
    .maybeSingle()

  if (!payment) notFound()

  const { data: { user } } = await supabase.auth.getUser()
  if (user && payment.user_id !== user.id) notFound()

  const { data: customerProfile } = await service
    .from('profiles')
    .select('full_name, phone')
    .eq('id', payment.user_id)
    .maybeSingle()

  const isPendingEmail = pending_email === '1'
  const displayName = name ? decodeURIComponent(name) : (customerProfile?.full_name ?? null)
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
  const boundInitiateBog = initiateBogPayment.bind(null, payment.id)

  let bankSettings: Record<string, string> = {}
  let cardPaymentAvailable = false
  if (!alreadySubmitted) {
    const [{ data: settingsRows }, bogSettings] = await Promise.all([
      service.from('platform_settings').select('key, value').in('key', ['bank_iban', 'bank_name', 'bank_recipient']),
      getBogSettings(),
    ])
    bankSettings = Object.fromEntries((settingsRows ?? []).map((r) => [r.key, r.value]))
    cardPaymentAvailable = bogSettings.enabled && ['GEL', 'USD', 'EUR', 'GBP'].includes(payment.currency)
  }

  return (
    <div className="min-h-screen bg-[#fbf7ef] text-[#1f2d27] flex flex-col">
      <header className="border-b border-[#e6dccb] bg-[#fbf7ef]/95 backdrop-blur sticky top-0 z-10">
        <div className="mx-auto flex h-14 max-w-lg items-center px-4">
          <BrandLogo href="/" />
        </div>
      </header>

      <div className="flex flex-1 flex-col items-center justify-center px-4 py-12">
        <div className="max-w-md w-full space-y-5">

          {/* Hero */}
          <div className="text-center">
            <div className="w-20 h-20 bg-[#f2f7f0] border border-[#c9dfc9] rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 className="h-10 w-10 text-emerald-700" />
            </div>
            <h1 className="text-2xl font-bold text-[#1f2d27] mb-2">Siparişiniz Oluşturuldu</h1>
            <p className="text-[#6f766f] text-sm leading-6">
              <span className="text-[#b08340] font-semibold">{productLabel}</span> siparişiniz kaydedildi.
            </p>
          </div>

          {/* Sipariş özeti */}
          <div className="bg-white border border-[#e6dccb] rounded-2xl p-5 shadow-sm">
            <p className="text-xs text-[#8a8478] uppercase tracking-wider font-semibold mb-3 text-center">Sipariş Kodunuz</p>
            <p className="text-2xl font-bold text-[#b08340] tracking-wide font-mono text-center mb-4">{payment.order_code}</p>
            <div className="space-y-2 text-sm border-t border-[#e6dccb] pt-3">
              {displayName && (
                <div className="flex justify-between"><span className="text-[#8a8478]">Ad Soyad</span><span className="text-[#1f2d27] font-medium">{displayName}</span></div>
              )}
              {customerProfile?.phone && (
                <div className="flex justify-between"><span className="text-[#8a8478]">Telefon</span><span className="text-[#1f2d27] font-medium">{customerProfile.phone}</span></div>
              )}
              {payment.profile_for && (
                <div className="flex justify-between"><span className="text-[#8a8478]">Profil</span><span className="text-[#1f2d27] font-medium">{PROFILE_FOR_LABELS[payment.profile_for] ?? payment.profile_for}</span></div>
              )}
              <div className="flex justify-between"><span className="text-[#8a8478]">Dil</span><span className="text-[#1f2d27] font-medium">{LOCALE_LABELS[payment.order_locale] ?? payment.order_locale}</span></div>
              <div className="flex justify-between pt-2 border-t border-[#e6dccb]"><span className="text-[#8a8478]">Tutar</span><span className="text-[#1f2d27] font-bold">{payment.amount} {payment.currency}</span></div>
            </div>
          </div>

          {/* BOG'dan başarısız dönüş */}
          {bog === 'fail' && !alreadySubmitted && (
            <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-800 leading-6">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <p>Kart ödemesi tamamlanamadı. Tekrar deneyebilir veya aşağıdaki banka havalesi seçeneğini kullanabilirsiniz.</p>
            </div>
          )}

          {alreadySubmitted ? (
            <div className="bg-white border border-[#c9dfc9] rounded-2xl p-5 shadow-sm">
              <p className="text-xs text-emerald-700 uppercase tracking-wider font-semibold mb-3 flex items-center gap-2">
                <Clock className="h-3.5 w-3.5" /> Ödeme Doğrulama Bekliyor
              </p>
              <p className="text-sm text-[#3d453f] leading-6 mb-4">
                Teşekkür ederiz. Ödemeniz doğrulama sürecine alınmıştır. Kontrol tamamlandığında
                size e-posta ile bilgi verilecektir. Bu sırada hesabınıza giriş yaparak anma
                profili için gerekli bilgileri hazırlamaya başlayabilirsiniz.
              </p>
              <div className="space-y-3">
                <Link
                  href="/login"
                  className="inline-flex w-full items-center justify-center gap-2 bg-[#b08340] hover:bg-[#96692f] text-white font-semibold py-3 rounded-xl transition-colors text-sm"
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
              {/* Kartla ödeme — BOG aktifse birincil seçenek */}
              {cardPaymentAvailable && (
                <>
                  <form action={boundInitiateBog}>
                    <button
                      type="submit"
                      className="inline-flex w-full items-center justify-center gap-2 bg-[#173d31] hover:bg-[#0f2822] text-white font-semibold py-3.5 rounded-xl transition-colors text-sm"
                    >
                      <CreditCard className="h-4 w-4" />
                      Kartla Öde ({payment.amount} {payment.currency})
                    </button>
                    <p className="text-xs text-[#8a8478] text-center mt-2">
                      Visa, Mastercard, Google Pay — güvenli ödeme, anında onay
                    </p>
                  </form>
                  <div className="flex items-center gap-3 py-1">
                    <div className="h-px flex-1 bg-[#e6dccb]" />
                    <span className="text-xs text-[#a39a86] uppercase tracking-wider">veya</span>
                    <div className="h-px flex-1 bg-[#e6dccb]" />
                  </div>
                </>
              )}

              {/* Banka bilgisi */}
              <div className="bg-white border border-[#e6dccb] rounded-2xl p-5 shadow-sm">
                <p className="text-xs text-[#8a8478] uppercase tracking-wider font-semibold mb-4">
                  Banka Havalesi ile Ödeme
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-[#8a8478]">Alıcı</span><span className="text-[#1f2d27] font-medium">{bankSettings.bank_recipient || 'The Eternal Memory LLC'}</span></div>
                  <div className="flex justify-between"><span className="text-[#8a8478]">Banka</span><span className="text-[#1f2d27] font-medium">{bankSettings.bank_name || 'TBC Bank'}</span></div>
                  <div className="flex justify-between items-start gap-2"><span className="text-[#8a8478] shrink-0">IBAN</span><span className="text-[#1f2d27] font-mono text-xs text-right break-all">{bankSettings.bank_iban || 'GE29TB7522145061700002'}</span></div>
                  <div className="flex justify-between pt-2 border-t border-[#e6dccb]"><span className="text-[#8a8478]">Tutar</span><span className="text-[#1f2d27] font-bold">{payment.amount} {payment.currency}</span></div>
                  <div className="flex justify-between"><span className="text-[#8a8478]">Açıklama</span><span className="text-[#b08340] font-mono font-semibold">{payment.order_code}</span></div>
                </div>
                <p className="text-xs text-[#8a5a15] bg-[#fdf1dc] border border-[#f0d9a8] rounded-lg px-3 py-2.5 mt-4 leading-5">
                  Lütfen havale açıklamasına mutlaka sipariş kodunuzu ({payment.order_code}) yazın. Bu kod ödeme doğrulaması için gereklidir.
                </p>
              </div>

              {/* Aksiyonlar */}
              <form action={boundMarkPaid}>
                <button
                  type="submit"
                  className="inline-flex w-full items-center justify-center gap-2 bg-[#b08340] hover:bg-[#96692f] text-white font-semibold py-3.5 rounded-xl transition-colors text-sm"
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
          <div className="bg-white border border-[#e6dccb] rounded-2xl p-5 space-y-4 shadow-sm">
            <p className="text-xs text-[#8a8478] uppercase tracking-wider font-semibold">Süreç</p>
            <Step num={1} done label="Sipariş alındı" />
            <Step num={2} done={alreadySubmitted} active={!alreadySubmitted} label="Ödemeyi tamamlayın" sub="Banka havalesi veya WhatsApp üzerinden" />
            <Step num={3} active={alreadySubmitted} label="Ekibimiz ödemeyi onaylar" sub="Genellikle 24 saat içinde" />
            <Step num={4} label="Sayfanız aktive edilir" sub="Giriş yapıp içerik ekleyebilirsiniz" />
          </div>

          {/* E-posta doğrulama notu */}
          {isPendingEmail && (
            <div className="bg-[#fdf1dc] border border-[#f0d9a8] rounded-xl p-4 text-sm text-[#8a5a15] leading-6">
              <p className="font-semibold mb-1">📧 E-postanızı doğrulayın</p>
              <p className="text-[#8a5a15]/80 text-xs">
                Kayıt e-postanıza bir doğrulama bağlantısı gönderdik. Ödeme onaylandıktan
                sonra hesabınıza giriş yapabilmek için önce bu bağlantıya tıklayın.
              </p>
            </div>
          )}

          {!alreadySubmitted && (
            <div className="flex items-start gap-2.5 bg-[#f8f4ea] border border-[#e2d7c3] rounded-xl px-4 py-3 text-xs text-[#6f766f] leading-5">
              <span className="text-base shrink-0 mt-px">🕐</span>
              <p>
                Saat <strong className="text-[#1f2d27]">18:00</strong>&apos;dan sonra yapılan
                ödemeler bir sonraki iş günü onaylanır. Sorun yaşarsanız bizimle iletişime geçin.
              </p>
            </div>
          )}

          {/* Aksiyonlar */}
          <div className="space-y-3 pt-1">
            <Link
              href="/contact"
              className="inline-flex w-full items-center justify-center gap-2 bg-white hover:bg-[#f8f4ea] text-[#3d453f] font-medium py-3 rounded-xl transition-colors text-sm border border-[#e2d7c3]"
            >
              <Phone className="h-4 w-4" />
              Sorun mu Yaşıyorsunuz? İletişime Geçin
            </Link>
            <Link
              href="/"
              className="flex items-center justify-center gap-2 text-sm text-[#8a8478] hover:text-[#6f766f] transition-colors py-2"
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
            ? 'bg-[#f2f7f0] text-emerald-700 border-[#c9dfc9]'
            : active
            ? 'bg-[#f8efd8] text-[#b08340] border-[#e6d3a8]'
            : 'bg-[#f2ede0] text-[#a39a86] border-[#e2d7c3]'
          }`}
      >
        {done ? '✓' : num}
      </div>
      <div>
        <p
          className={`text-sm font-medium ${
            done ? 'text-emerald-700' : active ? 'text-[#1f2d27]' : 'text-[#a39a86]'
          }`}
        >
          {label}
        </p>
        {sub && <p className="text-xs text-[#8a8478] mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}
