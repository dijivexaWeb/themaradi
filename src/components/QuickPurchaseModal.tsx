'use client'

import { useState, useTransition } from 'react'
import { X, ChevronRight, Loader2, CheckCircle2, Copy, ExternalLink } from 'lucide-react'
import { quickPurchaseMemorialAction } from '@/lib/actions/quick-purchase'
import { useLang } from '@/i18n/context'

interface BankInfo {
  iban: string
  bankName: string
  accountHolder: string
  amount: number
  currency: string
}

interface Props {
  familyId: string
  bankInfo: BankInfo
  paypalLink?: string | null
  onSuccess?: (vaultId: string) => void
  cardMode?: boolean
}

type Step = 'info' | 'payment' | 'confirm' | 'done'

export default function QuickPurchaseModal({ familyId, bankInfo, paypalLink, onSuccess, cardMode = false }: Props) {
  const { t } = useLang()
  const q = t.quickPurchase

  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<Step>('info')
  const [displayName, setDisplayName] = useState('')
  const [qrSame, setQrSame] = useState<'yes' | 'no' | null>(null)
  const [shippingAddr, setShippingAddr] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'bank_transfer' | 'paypal'>('bank_transfer')
  const [copiedIban, setCopiedIban] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [doneVaultId, setDoneVaultId] = useState<string | null>(null)

  const reset = () => {
    setStep('info'); setDisplayName(''); setQrSame(null)
    setShippingAddr(''); setPaymentMethod('bank_transfer')
    setError(null); setDoneVaultId(null)
  }
  const close = () => { setOpen(false); setTimeout(reset, 300) }

  const canGoPayment = displayName.trim().length > 1 && qrSame !== null && (qrSame === 'yes' || shippingAddr.trim().length > 5)

  const handleSubmit = () => {
    setError(null)
    const fd = new FormData()
    fd.set('display_name', displayName.trim())
    fd.set('qr_same_address', qrSame ?? 'yes')
    fd.set('shipping_address', shippingAddr)
    fd.set('payment_method', paymentMethod)

    const action = quickPurchaseMemorialAction.bind(null, familyId, null)
    startTransition(async () => {
      const result = await action(fd)
      if (!result.ok) { setError(result.error); return }
      setDoneVaultId(result.vaultId)
      setStep('done')
      onSuccess?.(result.vaultId)
    })
  }

  const copyIban = () => {
    navigator.clipboard.writeText(bankInfo.iban).then(() => {
      setCopiedIban(true); setTimeout(() => setCopiedIban(false), 2000)
    })
  }

  const inp = 'w-full rounded-xl border border-[#e5dccb] bg-white px-4 py-3 text-sm text-[#1f2d27] placeholder-[#adb5ab] outline-none focus:border-[#174f35] focus:ring-2 focus:ring-[#174f35]/10 transition-all'

  return (
    <>
      {/* Trigger */}
      {cardMode ? (
        <button
          onClick={() => setOpen(true)}
          className="group flex flex-col items-center justify-center rounded-t-[36px] rounded-b-xl border-2 border-dashed border-[#e5dccb] bg-white/50 w-full h-full min-h-[172px] transition-all hover:border-[#174f35]/40 hover:bg-[#f9f5ee] active:scale-[0.97]"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-dashed border-[#e5dccb] text-[#c5bba9] group-hover:border-[#174f35]/40 group-hover:text-[#174f35] transition-colors mb-2">
            <span className="text-lg leading-none">+</span>
          </div>
          <p className="text-[10px] font-medium text-[#788177] group-hover:text-[#1f2d27] text-center px-2">{q.triggerCardBtn}</p>
        </button>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-[#174f35] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#123f2b] transition-colors active:scale-[0.97]"
        >
          <span className="text-lg leading-none">+</span>
          {q.triggerBtn}
        </button>
      )}

      {/* Backdrop */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={close} />

          <div className="relative z-10 w-full sm:max-w-md bg-[#faf7f0] rounded-t-3xl sm:rounded-3xl shadow-2xl border border-[#e5dccb] overflow-hidden flex flex-col max-h-[90dvh]">
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-[#e5dccb] shrink-0">
              <div>
                <h2 className="font-semibold text-[#1f2d27]">{q.title}</h2>
                <p className="text-xs text-[#788177] mt-0.5">
                  {step === 'info' && q.steps.info}
                  {step === 'payment' && q.steps.payment}
                  {step === 'confirm' && q.steps.confirm}
                  {step === 'done' && q.steps.done}
                </p>
              </div>
              <button onClick={close} className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e5dccb]/60 text-[#788177] hover:bg-[#e5dccb] transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Steps indicator */}
            {step !== 'done' && (
              <div className="flex gap-1.5 px-6 pt-4 shrink-0">
                {(['info', 'payment', 'confirm'] as const).map((s, i) => (
                  <div key={s} className={`h-1 flex-1 rounded-full transition-all ${
                    step === s ? 'bg-[#174f35]' :
                    ['info', 'payment', 'confirm'].indexOf(step) > i ? 'bg-[#174f35]/40' : 'bg-[#e5dccb]'
                  }`} />
                ))}
              </div>
            )}

            {/* Content */}
            <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">

              {/* STEP 1: Info */}
              {step === 'info' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-[#4a5e55] mb-1.5">{q.form.forWhomLabel}</label>
                    <input
                      value={displayName}
                      onChange={e => setDisplayName(e.target.value)}
                      placeholder={q.form.forWhomPlaceholder}
                      className={inp}
                      autoFocus
                    />
                    <p className="text-[11px] text-[#adb5ab] mt-1">{q.form.forWhomHint}</p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#4a5e55] mb-2">{q.form.qrAddressLabel}</label>
                    <div className="grid grid-cols-2 gap-2">
                      {(['yes', 'no'] as const).map(v => (
                        <button
                          key={v}
                          type="button"
                          onClick={() => setQrSame(v)}
                          className={`rounded-xl border-2 py-3 text-sm font-semibold transition-all ${
                            qrSame === v
                              ? 'border-[#174f35] bg-[#174f35] text-white'
                              : 'border-[#e5dccb] bg-white text-[#4a5e55] hover:border-[#174f35]/40'
                          }`}
                        >
                          {v === 'yes' ? q.form.qrSameYes : q.form.qrSameNo}
                        </button>
                      ))}
                    </div>
                  </div>

                  {qrSame === 'no' && (
                    <div>
                      <label className="block text-xs font-semibold text-[#4a5e55] mb-1.5">{q.form.shippingLabel}</label>
                      <textarea
                        value={shippingAddr}
                        onChange={e => setShippingAddr(e.target.value)}
                        placeholder={q.form.shippingPlaceholder}
                        rows={3}
                        className={`${inp} resize-none`}
                      />
                    </div>
                  )}
                </>
              )}

              {/* STEP 2: Payment method */}
              {step === 'payment' && (
                <>
                  <p className="text-sm text-[#4a5e55]">
                    {q.payment.desc.replace('{name}', displayName)}
                  </p>
                  <div className="space-y-2">
                    {[
                      { value: 'bank_transfer' as const, emoji: '🏦', label: q.payment.bankLabel, desc: q.payment.bankDesc },
                      ...(paypalLink ? [{ value: 'paypal' as const, emoji: '💳', label: q.payment.paypalLabel, desc: q.payment.paypalDesc }] : []),
                    ].map(m => (
                      <button
                        key={m.value}
                        type="button"
                        onClick={() => setPaymentMethod(m.value)}
                        className={`w-full flex items-center gap-4 rounded-2xl border-2 p-4 text-left transition-all ${
                          paymentMethod === m.value
                            ? 'border-[#174f35] bg-[#174f35]/5'
                            : 'border-[#e5dccb] bg-white hover:border-[#174f35]/30'
                        }`}
                      >
                        <span className="text-2xl">{m.emoji}</span>
                        <div>
                          <p className="font-semibold text-sm text-[#1f2d27]">{m.label}</p>
                          <p className="text-xs text-[#788177]">{m.desc}</p>
                        </div>
                        <div className={`ml-auto h-4 w-4 rounded-full border-2 shrink-0 ${paymentMethod === m.value ? 'border-[#174f35] bg-[#174f35]' : 'border-[#c5bba9]'}`} />
                      </button>
                    ))}
                  </div>
                </>
              )}

              {/* STEP 3: Confirm */}
              {step === 'confirm' && (
                <>
                  {paymentMethod === 'bank_transfer' && (
                    <div className="space-y-3">
                      <div className="rounded-2xl border border-[#e5dccb] bg-white p-4 space-y-3">
                        <div className="flex items-center gap-2 text-[#174f35]">
                          <span className="text-lg">🏦</span>
                          <span className="font-semibold text-sm">{bankInfo.bankName}</span>
                        </div>

                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#adb5ab] mb-1">{q.confirm.accountHolder}</p>
                          <p className="font-medium text-sm text-[#1f2d27]">{bankInfo.accountHolder}</p>
                        </div>

                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#adb5ab] mb-1">IBAN</p>
                          <div className="flex items-center gap-2">
                            <p className="font-mono text-sm text-[#1f2d27] flex-1 break-all">{bankInfo.iban}</p>
                            <button type="button" onClick={copyIban} className="flex items-center gap-1 rounded-lg bg-[#f0ece2] px-2 py-1 text-[11px] font-semibold text-[#174f35] hover:bg-[#e5dccb] transition-colors shrink-0">
                              <Copy className="h-3 w-3" />
                              {copiedIban ? q.confirm.copied : q.confirm.copy}
                            </button>
                          </div>
                        </div>

                        <div className="rounded-xl bg-[#174f35]/5 border border-[#174f35]/10 px-3 py-2.5">
                          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#adb5ab] mb-0.5">{q.confirm.amountLabel}</p>
                          <p className="text-lg font-bold text-[#174f35]">{bankInfo.amount} {bankInfo.currency}</p>
                        </div>

                        <div className="rounded-xl bg-amber-50 border border-amber-100 px-3 py-2.5">
                          <p className="text-xs text-amber-700">
                            {q.confirm.referenceNote.replace('{name}', displayName)}
                          </p>
                        </div>
                      </div>

                      <p className="text-xs text-[#788177] text-center">{q.confirm.bankNote}</p>
                    </div>
                  )}

                  {paymentMethod === 'paypal' && paypalLink && (
                    <div className="space-y-3">
                      <div className="rounded-2xl border border-[#e5dccb] bg-white p-4 text-center">
                        <p className="text-3xl mb-2">💳</p>
                        <p className="font-semibold text-[#1f2d27] mb-1">{q.confirm.paypalTitle}</p>
                        <p className="text-sm text-[#788177] mb-4">
                          {q.confirm.paypalAmount.replace('{amount}', String(bankInfo.amount)).replace('{currency}', bankInfo.currency)}
                        </p>
                        <a href={paypalLink} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-xl bg-[#0070BA] px-5 py-3 text-sm font-semibold text-white hover:bg-[#003087] transition-colors">
                          {q.confirm.paypalBtn} <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </div>
                      <p className="text-xs text-[#788177] text-center">{q.confirm.paypalNote}</p>
                    </div>
                  )}

                  {error && (
                    <div className="rounded-xl bg-red-50 border border-red-200 px-3 py-2.5 text-sm text-red-600">{error}</div>
                  )}
                </>
              )}

              {/* STEP 4: Done */}
              {step === 'done' && (
                <div className="py-8 text-center">
                  <div className="flex justify-center mb-4">
                    <CheckCircle2 className="h-14 w-14 text-[#174f35]" />
                  </div>
                  <h3 className="text-lg font-bold text-[#1f2d27] mb-2">{q.done.title}</h3>
                  <p className="text-sm text-[#4a5e55]">
                    {q.done.desc.replace('{name}', displayName)}
                  </p>
                  <p className="text-xs text-[#adb5ab] mt-3">{q.done.trackNote}</p>
                </div>
              )}
            </div>

            {/* Footer buttons */}
            <div className="px-6 pb-6 pt-4 border-t border-[#e5dccb] shrink-0">
              {step === 'info' && (
                <button
                  disabled={!canGoPayment}
                  onClick={() => setStep('payment')}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#174f35] py-3.5 text-sm font-semibold text-white disabled:opacity-40 hover:bg-[#123f2b] transition-colors"
                >
                  {q.btn.continue} <ChevronRight className="h-4 w-4" />
                </button>
              )}

              {step === 'payment' && (
                <div className="flex gap-3">
                  <button onClick={() => setStep('info')} className="flex-none rounded-xl border border-[#e5dccb] bg-white px-4 py-3 text-sm font-semibold text-[#4a5e55] hover:bg-[#f9f5ee] transition-colors">
                    {q.btn.back}
                  </button>
                  <button
                    onClick={() => setStep('confirm')}
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#174f35] py-3 text-sm font-semibold text-white hover:bg-[#123f2b] transition-colors"
                  >
                    {paymentMethod === 'bank_transfer' ? q.btn.seeBankInfo : q.btn.continuePaypal} <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}

              {step === 'confirm' && (
                <div className="flex gap-3">
                  <button onClick={() => setStep('payment')} className="flex-none rounded-xl border border-[#e5dccb] bg-white px-4 py-3 text-sm font-semibold text-[#4a5e55] hover:bg-[#f9f5ee] transition-colors">
                    {q.btn.back}
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={isPending}
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#174f35] py-3 text-sm font-semibold text-white disabled:opacity-60 hover:bg-[#123f2b] transition-colors"
                  >
                    {isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> {q.btn.processing}</> : q.btn.confirmPayment}
                  </button>
                </div>
              )}

              {step === 'done' && (
                <button onClick={close} className="w-full rounded-xl bg-[#174f35] py-3.5 text-sm font-semibold text-white hover:bg-[#123f2b] transition-colors">
                  {q.btn.close}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
