'use client'

import { useActionState, useState } from 'react'
import { purchaseMemorialAction } from '../actions'
import Link from 'next/link'
import type { BankSettings } from '@/lib/bank-settings'
import { useLang } from '@/i18n/context'

export default function AnmaFormClient({ bank, amount }: { bank: BankSettings; amount: number }) {
  const { t } = useLang()
  const f = t.purchasePage.anma
  const [state, action, pending] = useActionState(purchaseMemorialAction, null)
  const [method, setMethod] = useState<'bank' | 'card'>('bank')

  const inp = 'w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500'
  const inpDisabled = 'w-full bg-slate-900 border border-slate-800 text-slate-600 placeholder-slate-700 rounded-xl px-4 py-2.5 text-sm cursor-not-allowed'

  if (state && 'emailConfirmationSent' in state && state.emailConfirmationSent) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-amber-500/15 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">📧</div>
          <h1 className="text-2xl font-bold text-white mb-3">{f.success.title}</h1>
          <p className="text-slate-400 mb-2">
            <span className="text-amber-400 font-medium">{'email' in state ? state.email : ''}</span>{' '}
            {f.success.emailSentTo}
          </p>
          <p className="text-slate-500 text-sm mb-8 leading-6">
            {f.success.clickLinkNote}
          </p>
          <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-5 text-left text-sm space-y-3 mb-6">
            <div className="flex items-center gap-3 text-emerald-400">
              <span>✓</span><span>{f.success.statusOrderSaved}</span>
            </div>
            <div className="flex items-center gap-3 text-emerald-400">
              <span>✓</span><span>{f.success.statusBankInfoSent}</span>
            </div>
            <div className="flex items-center gap-3 text-amber-400/70">
              <span>⏳</span><span>{f.success.statusEmailPending}</span>
            </div>
            <div className="flex items-center gap-3 text-slate-500">
              <span>⏳</span><span>{f.success.statusPanelAfterPayment}</span>
            </div>
          </div>
          <p className="text-xs text-slate-600">{f.success.spamNote}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center px-4 py-16">
      <div className="max-w-lg w-full">
        <Link href="/satin-al" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-300 text-sm mb-8 transition-colors">
          {f.backLink}
        </Link>

        <div className="border border-amber-500/20 bg-slate-900 rounded-2xl p-7">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-amber-500/15 rounded-xl flex items-center justify-center text-xl">🕯️</div>
            <div>
              <h1 className="font-bold text-xl text-white">{f.title}</h1>
              <p className="text-xs text-slate-500">{amount} ₾ {f.priceLabel}</p>
            </div>
          </div>

          {/* Ödeme Yöntemi Seçimi */}
          <div className="mb-6">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-3 font-semibold">{f.paymentMethodLabel}</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setMethod('bank')}
                className={`rounded-xl border p-3.5 text-left transition-all ${
                  method === 'bank'
                    ? 'border-amber-500/50 bg-amber-500/10 ring-1 ring-amber-500/30'
                    : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                }`}
              >
                <div className="text-lg mb-1">🏦</div>
                <div className="text-sm font-semibold text-white">{f.bankTransfer.name}</div>
                <div className="text-[11px] text-emerald-400 font-medium mt-0.5">{f.bankTransfer.status}</div>
              </button>

              <button
                type="button"
                onClick={() => setMethod('card')}
                className={`rounded-xl border p-3.5 text-left transition-all ${
                  method === 'card'
                    ? 'border-slate-600 bg-slate-800/50 ring-1 ring-slate-600/30'
                    : 'border-slate-700 bg-slate-800/30 hover:border-slate-600'
                }`}
              >
                <div className="text-lg mb-1">💳</div>
                <div className="text-sm font-semibold text-slate-400">{f.cardPayment.name}</div>
                <div className="text-[11px] text-amber-500/70 font-medium mt-0.5">{f.cardPayment.status}</div>
              </button>
            </div>
          </div>

          {/* BANKA HAVALESİ */}
          {method === 'bank' && (
            <>
              <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 mb-6">
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-3 font-semibold">{f.bankDetails.heading}</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">{f.bankDetails.ibanLabel}</span>
                    <span className="font-mono text-amber-400 select-all text-xs sm:text-sm">{bank.iban}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">{f.bankDetails.bankLabel}</span>
                    <span className="text-slate-200">{bank.bankName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">{f.bankDetails.recipientLabel}</span>
                    <span className="text-slate-200">{bank.recipient}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-slate-700">
                    <span className="text-slate-400">{f.bankDetails.amountLabel}</span>
                    <span className="text-white font-bold text-base">{amount} ₾</span>
                  </div>
                </div>
              </div>

              <form action={action} className="space-y-4">
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
                  <input
                    type="tel"
                    name="phone"
                    placeholder={f.form.phonePlaceholder}
                    required
                    className={inp}
                  />
                  <p className="text-xs text-slate-600 mt-1">{f.form.phoneHint}</p>
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

                {/* İzinler */}
                <div className="border border-slate-700/60 bg-slate-800/30 rounded-xl p-4 space-y-4">
                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">{f.consents.heading}</p>

                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      name="email_consent"
                      required
                      className="mt-0.5 h-4 w-4 shrink-0 rounded accent-amber-500 cursor-pointer"
                    />
                    <div>
                      <span className="text-sm text-slate-200 leading-5">
                        {f.consents.emailConsent}{' '}
                        <span className="text-amber-400 text-xs">*</span>
                      </span>
                      <p className="text-xs text-slate-500 mt-1 leading-5">{f.consents.emailConsentDesc}</p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      name="phone_consent"
                      required
                      className="mt-0.5 h-4 w-4 shrink-0 rounded accent-amber-500 cursor-pointer"
                    />
                    <div>
                      <span className="text-sm text-slate-200 leading-5">
                        {f.consents.phoneConsent}{' '}
                        <span className="text-amber-400 text-xs">*</span>
                      </span>
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
                  {pending ? f.submitPending : f.submitBtn}
                </button>
              </form>

              <p className="text-xs text-slate-600 mt-4 text-center leading-5">{f.footerNote}</p>
            </>
          )}

          {/* KARTLA ÖDEME — YAKINDA */}
          {method === 'card' && (
            <div className="relative">
              <div className="absolute inset-0 z-10 rounded-xl bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
                <div className="text-4xl">🔒</div>
                <p className="text-white font-semibold text-sm">{f.cardPayment.comingSoonTitle}</p>
                <p className="text-slate-400 text-xs text-center max-w-[220px] leading-5">{f.cardPayment.comingSoonDesc}</p>
                <button onClick={() => setMethod('bank')}
                  className="mt-2 bg-amber-500 hover:bg-amber-400 text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition-colors">
                  {f.cardPayment.switchToBankBtn}
                </button>
              </div>

              <div className="space-y-4 opacity-30 pointer-events-none select-none p-1">
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">Kart Sahibi Ad Soyad</label>
                  <input disabled placeholder="Ad Soyad" className={inpDisabled} />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">Kart Numarası</label>
                  <input disabled placeholder="•••• •••• •••• ••••" className={inpDisabled} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5">Son Kullanma Tarihi</label>
                    <input disabled placeholder="AA / YY" className={inpDisabled} />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5">CVV</label>
                    <input disabled placeholder="•••" className={inpDisabled} />
                  </div>
                </div>
                <div className="w-full bg-slate-800 rounded-xl py-3 text-center text-slate-500 text-sm font-semibold">
                  Ödemeyi Tamamla
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
