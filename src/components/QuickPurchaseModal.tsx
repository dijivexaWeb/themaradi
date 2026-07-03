'use client'

import { useState, useTransition } from 'react'
import { X, ChevronRight, Loader2, CheckCircle2, MessageCircle } from 'lucide-react'
import { quickPurchaseMemorialAction } from '@/lib/actions/quick-purchase'
import { useLang } from '@/i18n/context'

interface BankInfo {
  amount: number
  currency: string
}

interface Props {
  familyId: string
  bankInfo: BankInfo
  onSuccess?: (vaultId: string) => void
  cardMode?: boolean
}

type Step = 'info' | 'confirm' | 'done'

export default function QuickPurchaseModal({ familyId, bankInfo, onSuccess, cardMode = false }: Props) {
  const { t } = useLang()
  const q = t.quickPurchase

  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<Step>('info')
  const [displayName, setDisplayName] = useState('')
  const [qrSame, setQrSame] = useState<'yes' | 'no' | null>(null)
  const [shippingAddr, setShippingAddr] = useState('')
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [doneVaultId, setDoneVaultId] = useState<string | null>(null)
  const [waLink, setWaLink] = useState<string | null>(null)

  const reset = () => {
    setStep('info'); setDisplayName(''); setQrSame(null)
    setShippingAddr('')
    setError(null); setDoneVaultId(null); setWaLink(null)
  }
  const close = () => { setOpen(false); setTimeout(reset, 300) }

  const canGoPayment = displayName.trim().length > 1 && qrSame !== null && (qrSame === 'yes' || shippingAddr.trim().length > 5)

  const handleSubmit = () => {
    setError(null)
    const fd = new FormData()
    fd.set('display_name', displayName.trim())
    fd.set('qr_same_address', qrSame ?? 'yes')
    fd.set('shipping_address', shippingAddr)

    const action = quickPurchaseMemorialAction.bind(null, familyId, null)
    startTransition(async () => {
      const result = await action(fd)
      if (!result.ok) { setError(result.error); return }
      setDoneVaultId(result.vaultId)
      setWaLink(result.waLink)
      setStep('done')
      onSuccess?.(result.vaultId)
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
                {(['info', 'confirm'] as const).map((s, i) => (
                  <div key={s} className={`h-1 flex-1 rounded-full transition-all ${
                    step === s ? 'bg-[#174f35]' :
                    ['info', 'confirm'].indexOf(step) > i ? 'bg-[#174f35]/40' : 'bg-[#e5dccb]'
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

              {/* STEP 2: Confirm — sipariş özeti */}
              {step === 'confirm' && (
                <>
                  <div className="space-y-3">
                    <div className="rounded-2xl border border-[#e5dccb] bg-white p-4 space-y-3">
                      <div className="flex items-center gap-2 text-[#174f35]">
                        <span className="text-lg">🕯️</span>
                        <span className="font-semibold text-sm">{displayName}</span>
                      </div>

                      <div className="rounded-xl bg-[#174f35]/5 border border-[#174f35]/10 px-3 py-2.5">
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-[#adb5ab] mb-0.5">{q.confirm.amountLabel}</p>
                        <p className="text-lg font-bold text-[#174f35]">{bankInfo.amount} {bankInfo.currency}</p>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-[#25D366]/25 bg-[#25D366]/5 p-4 text-sm text-[#4a5e55] leading-6">
                      <p className="flex items-center gap-2 font-semibold text-[#1f2d27] mb-1">
                        <MessageCircle className="h-4 w-4 text-[#128C7E]" /> WhatsApp&apos;tan Devam Edin
                      </p>
                      Siparişinizi onayladıktan sonra WhatsApp üzerinden bize ulaşarak ödemeyi kişisel olarak tamamlarsınız.
                    </div>
                  </div>

                  {error && (
                    <div className="rounded-xl bg-red-50 border border-red-200 px-3 py-2.5 text-sm text-red-600">{error}</div>
                  )}
                </>
              )}

              {/* STEP 3: Done */}
              {step === 'done' && (
                <div className="py-8 text-center">
                  <div className="flex justify-center mb-4">
                    <CheckCircle2 className="h-14 w-14 text-[#174f35]" />
                  </div>
                  <h3 className="text-lg font-bold text-[#1f2d27] mb-2">{q.done.title}</h3>
                  <p className="text-sm text-[#4a5e55]">
                    {q.done.desc.replace('{name}', displayName)}
                  </p>
                  {waLink && (
                    <a
                      href={waLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-5 inline-flex items-center justify-center gap-2 w-full rounded-xl bg-gradient-to-tr from-[#128C7E] to-[#25D366] hover:brightness-110 py-3 text-sm font-semibold text-white transition-all"
                    >
                      <MessageCircle className="h-4 w-4" />
                      WhatsApp&apos;tan Devam Et
                    </a>
                  )}
                  <p className="text-xs text-[#adb5ab] mt-3">{q.done.trackNote}</p>
                </div>
              )}
            </div>

            {/* Footer buttons */}
            <div className="px-6 pb-6 pt-4 border-t border-[#e5dccb] shrink-0">
              {step === 'info' && (
                <button
                  disabled={!canGoPayment}
                  onClick={() => setStep('confirm')}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#174f35] py-3.5 text-sm font-semibold text-white disabled:opacity-40 hover:bg-[#123f2b] transition-colors"
                >
                  {q.btn.continue} <ChevronRight className="h-4 w-4" />
                </button>
              )}

              {step === 'confirm' && (
                <div className="flex gap-3">
                  <button onClick={() => setStep('info')} className="flex-none rounded-xl border border-[#e5dccb] bg-white px-4 py-3 text-sm font-semibold text-[#4a5e55] hover:bg-[#f9f5ee] transition-colors">
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
