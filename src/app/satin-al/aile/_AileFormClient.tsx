'use client'

import { useActionState } from 'react'
import { purchaseFamilyAction } from '../actions'
import Link from 'next/link'
import BrandLogo from '@/components/BrandLogo'
import { useLang } from '@/i18n/context'

export default function AileFormClient({
  amount,
  currency,
}: {
  amount: number
  currency: string
}) {
  const { t } = useLang()
  const f = t.purchasePage.aile
  const c = t.purchasePage.common
  const [state, action, pending] = useActionState(purchaseFamilyAction, null)

  const inp = 'w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500'

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
          <Link href="/satin-al" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-300 text-sm mb-4 transition-colors">
            {f.backLink}
          </Link>

          <div className="border border-emerald-500/20 bg-slate-900 rounded-2xl p-6">
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-emerald-500/15 rounded-xl flex items-center justify-center text-xl">🏡</div>
              <div>
                <h1 className="font-bold text-xl text-white">{f.title}</h1>
                <p className="text-xs text-slate-500">{amount} {currency} {f.priceLabel}</p>
              </div>
            </div>

            {/* What's included */}
            <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-xl p-3.5 mb-4 space-y-1.5 text-sm text-slate-300">
              <p className="text-xs text-emerald-400 font-semibold uppercase tracking-wide mb-2">{f.includedHeading}</p>
              {f.included.map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <span className="text-emerald-400 text-xs">✦</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>

            {/* WhatsApp bilgi kutusu */}
            <div className="mb-4 rounded-xl border border-[#25D366]/25 bg-[#25D366]/5 p-3.5 text-sm text-slate-300 leading-6">
              <p className="flex items-center gap-2 font-semibold text-white mb-1">
                <span className="text-lg">💬</span> {c.whatsappBoxHeading}
              </p>
              {c.whatsappBoxBody}
              <div className="mt-3 pt-3 border-t border-[#25D366]/15 flex justify-between">
                <span className="text-slate-400">{c.amountLabel}</span>
                <span className="text-white font-bold">{amount} {currency}</span>
              </div>
            </div>

            {/* Form */}
            <form action={action} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5 font-medium">
                    {f.form.familyName} <span className="text-emerald-400">*</span>
                  </label>
                  <input type="text" name="family_name" placeholder={f.form.familyNamePlaceholder} required className={inp} />
                  <p className="text-xs text-slate-600 mt-1">{f.form.familyNameHint}</p>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5 font-medium">
                    {f.form.yourName} <span className="text-emerald-400">*</span>
                  </label>
                  <input type="text" name="sender_name" placeholder={f.form.yourNamePlaceholder} required className={inp} />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5 font-medium">
                    {c.profileForLabel}
                  </label>
                  <select name="profile_for" className={inp}>
                    {Object.entries(c.profileForOptions).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5 font-medium">
                    {c.profileLanguageLabel}
                  </label>
                  <select name="profile_language" className={inp}>
                    {Object.entries(c.profileLanguageOptions).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5 font-medium">
                    {f.form.email} <span className="text-emerald-400">*</span>
                  </label>
                  <input type="email" name="sender_email" placeholder={f.form.emailPlaceholder} required className={inp} />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5 font-medium">
                    {f.form.phone} <span className="text-emerald-400">*</span>
                  </label>
                  <input type="tel" name="phone" placeholder={f.form.phonePlaceholder} required className={inp} />
                  <p className="text-xs text-slate-600 mt-1">{f.form.phoneHint}</p>
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1.5 font-medium">
                  {f.form.shippingAddress} <span className="text-emerald-400">*</span>
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
                    {f.form.password} <span className="text-emerald-400">*</span>
                  </label>
                  <input type="password" name="password" placeholder={f.form.passwordPlaceholder} required minLength={6} className={inp} />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5 font-medium">
                    {f.form.passwordConfirm} <span className="text-emerald-400">*</span>
                  </label>
                  <input type="password" name="password_confirm" placeholder={f.form.passwordConfirmPlaceholder} required minLength={6} className={inp} />
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-5">{f.form.accountNote}</p>

              <div className="border border-slate-700/60 bg-slate-800/30 rounded-xl p-4 space-y-4">
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">{c.consents.heading}</p>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" name="privacy_notice_ack" required className="mt-0.5 h-4 w-4 shrink-0 rounded accent-emerald-500 cursor-pointer" />
                  <div>
                    <span className="text-sm text-slate-200 leading-5">{c.consents.privacyNoticeAck}{' '}<span className="text-emerald-400 text-xs">*</span></span>
                    <p className="text-xs text-slate-500 mt-1 leading-5">{c.consents.privacyNoticeAckDesc}</p>
                  </div>
                </label>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" name="data_processing_consent" required className="mt-0.5 h-4 w-4 shrink-0 rounded accent-emerald-500 cursor-pointer" />
                  <div>
                    <span className="text-sm text-slate-200 leading-5">{c.consents.dataProcessingConsent}{' '}<span className="text-emerald-400 text-xs">*</span></span>
                    <p className="text-xs text-slate-500 mt-1 leading-5">{c.consents.dataProcessingConsentDesc}</p>
                  </div>
                </label>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" name="marketing_permission" className="mt-0.5 h-4 w-4 shrink-0 rounded accent-emerald-500 cursor-pointer" />
                  <div>
                    <span className="text-sm text-slate-200 leading-5">{c.consents.marketingConsent}</span>
                    <p className="text-xs text-slate-500 mt-1 leading-5">{c.consents.marketingConsentDesc}</p>
                  </div>
                </label>
                <p className="text-xs text-slate-600 leading-5 pt-1 border-t border-slate-700/50">
                  {c.consents.kvkkNote}{' '}
                  <Link href="/kvkk" className="text-amber-400/70 hover:text-amber-400 underline underline-offset-2">
                    {c.consents.kvkkLink}
                  </Link>
                </p>
              </div>

              {state?.error && (
                <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">{state.error}</p>
              )}

              <button
                type="submit"
                disabled={pending}
                className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
              >
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
              {f.included[3]}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
