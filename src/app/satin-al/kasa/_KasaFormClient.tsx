'use client'

import { useActionState } from 'react'
import { purchaseVaultAction } from '../actions'
import Link from 'next/link'
import BrandLogo from '@/components/BrandLogo'
import { useLang } from '@/i18n/context'
import PaymentBrandRow from '@/components/PaymentBrandIcons'

export default function KasaFormClient({
  setupAmount,
  monthlyAmount,
  currency,
  cardPaymentAvailable,
}: {
  setupAmount: number
  monthlyAmount: number
  currency: string
  cardPaymentAvailable?: boolean
}) {
  const { t } = useLang()
  const f = t.purchasePage.kasa
  const c = t.purchasePage.common
  const cardTrustNote = t.paymentPage.cardTrustNote
  const [state, action, pending] = useActionState(purchaseVaultAction, null)

  const inp = 'w-full bg-white border border-[#e2d7c3] text-[#1f2d27] placeholder-[#a89f8c] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#b08340]'

  // E-posta doğrulama bekleniyor
  if (state && 'emailConfirmationSent' in state && state.emailConfirmationSent) {
    return (
      <div className="min-h-screen bg-[#fbf7ef] text-[#1f2d27] flex flex-col items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-[#f8efd8] rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">📧</div>
          <h1 className="text-2xl font-bold text-[#1f2d27] mb-3">{f.success.title}</h1>
          <p className="text-[#6f766f] mb-8 text-sm leading-6">
            <span className="text-[#b08340] font-medium">{'email' in state ? String(state.email) : ''}</span> {f.success.emailSentTo}
          </p>
          <div className="bg-white border border-[#e6dccb] rounded-xl p-5 text-left text-sm space-y-3">
            <div className="flex items-center gap-3 text-emerald-700"><span>✓</span><span>{f.success.statusOrderSaved}</span></div>
            <div className="flex items-center gap-3 text-[#b08340]"><span>⏳</span><span>{f.success.statusEmailPending}</span></div>
            <div className="flex items-center gap-3 text-[#a39a86]"><span>⏳</span><span>{f.success.statusPanelAfterPayment}</span></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#fbf7ef] text-[#1f2d27] flex flex-col">
      <header className="border-b border-[#e6dccb] bg-[#fbf7ef]/95 backdrop-blur sticky top-0 z-10">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <BrandLogo href="/" />
          <div className="flex items-center gap-2 text-xs text-[#8a8478]">
            <svg className="h-3.5 w-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            {c.secureOrderBadge}
          </div>
        </div>
      </header>

      <div className="flex-1 px-4 py-10">
        <div className="mx-auto max-w-5xl">
          <Link href="/satin-al" className="inline-flex items-center gap-2 text-[#8a8478] hover:text-[#6f766f] text-sm mb-4 transition-colors">
            {f.backLink}
          </Link>

          <div className="grid lg:grid-cols-[1fr_440px] gap-8 items-start">
            {/* SOL: ürün anlatımı + güven */}
            <div className="lg:sticky lg:top-24">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-11 h-11 bg-[#f8efd8] rounded-xl flex items-center justify-center text-xl shrink-0">🔐</div>
                <div>
                  <h1 className="font-bold text-2xl text-[#1f2d27]">{f.title}</h1>
                  <p className="text-sm text-[#b08340] font-semibold">{setupAmount} {currency} + {monthlyAmount} {currency}/{f.perMonthLabel}</p>
                </div>
              </div>
              <p className="text-[#6f766f] text-sm leading-6 mb-5">{f.subtitle}</p>

              {/* Güven blokları */}
              <div className="space-y-2">
                {c.trustBlocks.map((item) => (
                  <div key={item} className="flex items-start gap-2 text-sm text-[#6f766f] leading-6">
                    <span className="text-emerald-700 shrink-0 mt-0.5">✓</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* SAĞ: form / ödeme kartı */}
            <div className="border border-[#e6dccb] bg-white rounded-2xl p-6 shadow-sm">
              <div className="mb-4 rounded-xl border border-[#25D366]/30 bg-[#25D366]/[0.06] p-3.5 text-sm text-[#3d453f] leading-6">
                <p className="flex items-center gap-2 font-semibold text-[#1f2d27] mb-1">
                  <span className="text-lg">💬</span> {c.whatsappBoxHeading}
                </p>
                {c.whatsappBoxBody}
              </div>

              <form action={action} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-[#6f766f] mb-1.5 font-medium">{f.form.displayName} <span className="text-[#b08340]">*</span></label>
                    <input type="text" name="display_name" placeholder={f.form.displayNamePlaceholder} required className={inp} />
                  </div>
                  <div>
                    <label className="block text-xs text-[#6f766f] mb-1.5 font-medium">{f.form.yourName} <span className="text-[#b08340]">*</span></label>
                    <input type="text" name="sender_name" placeholder={f.form.yourNamePlaceholder} required className={inp} />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-[#6f766f] mb-1.5 font-medium">{f.form.email} <span className="text-[#b08340]">*</span></label>
                    <input type="email" name="sender_email" placeholder={f.form.emailPlaceholder} required className={inp} />
                  </div>
                  <div>
                    <label className="block text-xs text-[#6f766f] mb-1.5 font-medium">{f.form.phone} <span className="text-[#b08340]">*</span></label>
                    <input type="tel" name="phone" placeholder={f.form.phonePlaceholder} required className={inp} />
                    <p className="text-xs text-[#a39a86] mt-1">{f.form.phoneHint}</p>
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-[#6f766f] mb-1.5 font-medium">{f.form.password} <span className="text-[#b08340]">*</span></label>
                    <input type="password" name="password" placeholder={f.form.passwordPlaceholder} required minLength={6} className={inp} />
                  </div>
                  <div>
                    <label className="block text-xs text-[#6f766f] mb-1.5 font-medium">{f.form.passwordConfirm} <span className="text-[#b08340]">*</span></label>
                    <input type="password" name="password_confirm" placeholder={f.form.passwordConfirmPlaceholder} required minLength={6} className={inp} />
                  </div>
                </div>
                <p className="text-xs text-[#8a8478] leading-5">{f.form.accountNote}</p>

                <div className="border border-[#e2d7c3] bg-[#f8f4ea] rounded-xl p-4 space-y-4">
                  <p className="text-xs text-[#6f766f] font-semibold uppercase tracking-wider">{c.consents.heading}</p>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" name="marketing_permission" className="mt-0.5 h-4 w-4 shrink-0 rounded accent-[#b08340] cursor-pointer" />
                    <div>
                      <span className="text-sm text-[#1f2d27] leading-5">{c.consents.marketingConsent}</span>
                      <p className="text-xs text-[#8a8478] mt-1 leading-5">{c.consents.marketingConsentDesc}</p>
                    </div>
                  </label>
                  <p className="text-xs text-[#a39a86] leading-5 pt-1 border-t border-[#e2d7c3]">
                    {c.consents.kvkkNote}{' '}
                    <Link href="/kvkk" className="text-[#96692f] hover:text-[#b08340] underline underline-offset-2">{c.consents.kvkkLink}</Link>
                  </p>
                </div>

                {state?.error && (
                  <p className="text-red-700 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                    {state.error}
                    {'existingAccount' in state && state.existingAccount && (
                      <>{' '}<Link href="/login" className="underline font-semibold">Giriş Yap →</Link></>
                    )}
                  </p>
                )}

                <button type="submit" disabled={pending}
                  className="w-full bg-[#b08340] hover:bg-[#96692f] disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors text-sm">
                  {pending ? f.submitPending : c.submitCta}
                </button>
                {cardPaymentAvailable && (
                  <div className="flex items-center justify-center gap-2 mt-1">
                    <PaymentBrandRow size="sm" />
                    <span className="text-[10px] text-[#a39a86]">{cardTrustNote}</span>
                  </div>
                )}
                <p className="text-xs text-[#8a8478] text-center leading-5">{c.consents.implicitConsentNote}</p>
              </form>

              <p className="text-xs text-[#a39a86] mt-4 text-center leading-5">{f.footerNote}</p>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-center gap-6 text-xs text-[#8a8478]">
            <span className="flex items-center gap-1.5">
              <svg className="h-3.5 w-3.5 text-emerald-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              256-bit SSL
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="h-3.5 w-3.5 text-emerald-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {c.dataSecurityBadge}
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="h-3.5 w-3.5 text-emerald-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              {c.secureOrderBadge}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
