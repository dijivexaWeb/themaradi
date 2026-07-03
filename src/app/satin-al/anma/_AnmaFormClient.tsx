'use client'

import { useActionState } from 'react'
import { purchaseMemorialAction } from '../actions'
import Link from 'next/link'
import { useLang } from '@/i18n/context'
import BrandLogo from '@/components/BrandLogo'

export default function AnmaFormClient({
  amount,
  currency,
}: {
  amount: number
  currency: string
}) {
  const { t } = useLang()
  const f = t.purchasePage.anma
  const c = t.purchasePage.common
  const [state, action, pending] = useActionState(purchaseMemorialAction, null)

  const inp = 'w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500'

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <header className="border-b border-slate-800 bg-slate-950/95 backdrop-blur sticky top-0 z-10">
        <div className="mx-auto flex h-14 max-w-xl items-center justify-between px-4">
          <BrandLogo light href="/" />
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <svg className="h-3.5 w-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            {c.secureOrderBadge}
          </div>
        </div>
      </header>

      <div className="flex flex-1 flex-col items-center justify-center px-4 py-10">
        <div className="max-w-xl w-full">
          <div className="mb-4 text-center">
            <p className="text-slate-400 text-sm leading-6">{f.subtitle}</p>
          </div>

          <Link href="/satin-al" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-300 text-sm mb-4 transition-colors">
            {f.backLink}
          </Link>

          <div className="border border-amber-500/20 bg-slate-900 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-amber-500/15 rounded-xl flex items-center justify-center text-xl">🕯️</div>
              <div>
                <h1 className="font-bold text-xl text-white">{f.title}</h1>
                <p className="text-xs text-slate-500">{amount} {currency} {f.priceLabel}</p>
              </div>
            </div>

            {/* Hosting policy — dahil olanlar */}
            <div className="mb-4 rounded-xl border border-emerald-500/20 bg-emerald-950/30 p-3.5">
              <span className="inline-block rounded-full bg-emerald-600 px-2.5 py-0.5 text-[10px] font-bold text-white uppercase tracking-wide mb-2.5">
                {f.hostingBadge}
              </span>
              <div className="space-y-1.5 mb-2.5">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-emerald-400 font-bold shrink-0">✓</span>
                  <span className="text-slate-300">{f.hostingLine1}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm border-t border-emerald-500/15 pt-2.5">
                <span className="text-amber-400 shrink-0">↻</span>
                <span className="text-slate-400">{f.hostingLine2}</span>
              </div>
              <p className="text-xs text-slate-600 mt-2 leading-5">
                {f.hostingRenewalNote}
              </p>
            </div>

            {/* WhatsApp bilgi kutusu */}
            <div className="mb-4 rounded-xl border border-[#25D366]/25 bg-[#25D366]/5 p-3.5 text-sm text-slate-300 leading-6">
              <p className="flex items-center gap-2 font-semibold text-white mb-1">
                <span className="text-lg">💬</span> {c.whatsappBoxHeading}
              </p>
              {c.whatsappBoxBody}
            </div>

            <form action={action} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5 font-medium">
                    {f.form.forWhom} <span className="text-amber-400">*</span>
                  </label>
                  <input type="text" name="display_name" placeholder={f.form.forWhomPlaceholder} required className={inp} />
                  <p className="text-xs text-slate-600 mt-1">{f.form.forWhomHint}</p>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5 font-medium">
                    {f.form.yourName} <span className="text-amber-400">*</span>
                  </label>
                  <input type="text" name="sender_name" placeholder={f.form.yourNamePlaceholder} required className={inp} />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5 font-medium">
                    {f.form.email} <span className="text-amber-400">*</span>
                  </label>
                  <input type="email" name="sender_email" placeholder={f.form.emailPlaceholder} required className={inp} />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5 font-medium">
                    {f.form.phone} <span className="text-amber-400">*</span>
                  </label>
                  <input type="tel" name="phone" placeholder={f.form.phonePlaceholder} required className={inp} />
                  <p className="text-xs text-slate-600 mt-1">{f.form.phoneHint}</p>
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1.5 font-medium">
                  {f.form.shippingAddress} <span className="text-amber-400">*</span>
                </label>
                <textarea
                  name="shipping_address"
                  placeholder={f.form.shippingAddressPlaceholder}
                  required
                  rows={2}
                  className={`${inp} resize-none`}
                />
                <p className="text-xs text-slate-600 mt-1">{f.form.shippingAddressHint}</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5 font-medium">
                    {f.form.password} <span className="text-amber-400">*</span>
                  </label>
                  <input type="password" name="password" placeholder={f.form.passwordPlaceholder} required minLength={6} className={inp} />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5 font-medium">
                    {f.form.passwordConfirm} <span className="text-amber-400">*</span>
                  </label>
                  <input type="password" name="password_confirm" placeholder={f.form.passwordConfirmPlaceholder} required minLength={6} className={inp} />
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-5">{f.form.accountNote}</p>

              <div className="border border-slate-700/60 bg-slate-800/30 rounded-xl p-4 space-y-4">
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">{f.consents.heading}</p>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" name="email_consent" required className="mt-0.5 h-4 w-4 shrink-0 rounded accent-amber-500 cursor-pointer" />
                  <div>
                    <span className="text-sm text-slate-200 leading-5">{f.consents.emailConsent}{' '}<span className="text-amber-400 text-xs">*</span></span>
                    <p className="text-xs text-slate-500 mt-1 leading-5">{f.consents.emailConsentDesc}</p>
                  </div>
                </label>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" name="phone_consent" required className="mt-0.5 h-4 w-4 shrink-0 rounded accent-amber-500 cursor-pointer" />
                  <div>
                    <span className="text-sm text-slate-200 leading-5">{f.consents.phoneConsent}{' '}<span className="text-amber-400 text-xs">*</span></span>
                    <p className="text-xs text-slate-500 mt-1 leading-5">{f.consents.phoneConsentDesc}</p>
                  </div>
                </label>
                <p className="text-xs text-slate-600 leading-5 pt-1 border-t border-slate-700/50">
                  {f.consents.kvkkNote}{' '}
                  <Link href="/kvkk" className="text-amber-400/70 hover:text-amber-400 underline underline-offset-2">
                    {f.consents.kvkkLink}
                  </Link>
                </p>
              </div>

              {state?.error && (
                <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">{state.error}</p>
              )}

              <button type="submit" disabled={pending}
                className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors text-sm">
                {pending ? f.submitPending : c.submitCta}
              </button>
            </form>
            <p className="text-xs text-slate-600 mt-4 text-center leading-5">{f.footerNote}</p>
          </div>

          <div className="mt-6 flex items-center justify-center gap-6 text-xs text-slate-600">
            <span className="flex items-center gap-1.5">
              <svg className="h-3.5 w-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              256-bit SSL
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="h-3.5 w-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {c.dataSecurityBadge}
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="h-3.5 w-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
