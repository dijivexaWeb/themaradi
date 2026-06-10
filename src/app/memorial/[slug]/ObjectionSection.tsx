'use client'

import { useState, useRef } from 'react'
import { submitObjectionAction } from './actions'

export default function ObjectionSection({ vaultId }: { vaultId: string }) {
  const [open, setOpen] = useState(false)
  const [state, setState] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const formRef = useRef<HTMLFormElement>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setState('submitting')
    setErrorMsg('')
    const fd = new FormData(e.currentTarget)
    const res = await submitObjectionAction(vaultId, fd)
    if (res.success) {
      setState('success')
      formRef.current?.reset()
    } else {
      setState('error')
      setErrorMsg(res.error ?? 'Bilinmeyen hata.')
    }
  }

  return (
    <div className="border-t border-white/10 bg-black/20 px-4 py-10">
      <div className="mx-auto max-w-xl text-center">
        {/* Collapsed state */}
        {!open ? (
          <>
            <p className="mb-4 text-sm text-white/50 leading-relaxed">
              Bu kişinin hâlâ hayatta olduğunu düşünüyorsanız itiraz edebilirsiniz.
            </p>
            <button
              onClick={() => setOpen(true)}
              className="rounded-xl border border-white/20 px-5 py-2.5 text-sm font-medium text-white/70 transition hover:border-white/40 hover:text-white/90"
            >
              İtiraz Et
            </button>
          </>
        ) : state === 'success' ? (
          /* Thank you message */
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-900/50 text-emerald-400 text-2xl">
              ✓
            </div>
            <h3 className="mb-2 font-serif text-xl text-white/90">Duyarlılığınız için teşekkür ederiz</h3>
            <p className="text-sm text-white/60 leading-relaxed">
              İtirazınız kayıt altına alınmıştır. 3 iş günü içinde ekibimiz tarafından değerlendirilecektir.
              Geçerli bulunması halinde bu sayfa 3 gün içinde kaldırılacaktır.
            </p>
            <p className="mt-3 text-xs text-white/40">
              İletişim bilgilerinizi paylaştıysanız sizi bilgilendireceğiz.
            </p>
          </div>
        ) : (
          /* Form */
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-left">
            <div className="mb-5">
              <h3 className="font-serif text-lg text-white/90">İtiraz Formu</h3>
              <p className="mt-1 text-xs text-white/50 leading-relaxed">
                Bu kişinin hâlâ hayatta olduğuna inanıyorsanız lütfen bilgilerinizi bırakın.
                İtirazınız 3 gün içinde değerlendirilecek, geçerliyse sayfa kaldırılacaktır.
              </p>
            </div>

            <form ref={formRef} onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-white/60">Ad Soyad *</label>
                  <input
                    name="name"
                    type="text"
                    required
                    placeholder="Adınız Soyadınız"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-white/30 focus:border-white/30 focus:outline-none focus:ring-1 focus:ring-white/20"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-white/60">Telefon *</label>
                  <input
                    name="phone"
                    type="tel"
                    required
                    placeholder="+90 5XX XXX XX XX"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-white/30 focus:border-white/30 focus:outline-none focus:ring-1 focus:ring-white/20"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-white/60">E-posta *</label>
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="ornek@eposta.com"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-white/30 focus:border-white/30 focus:outline-none focus:ring-1 focus:ring-white/20"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-white/60">Açıklama (isteğe bağlı)</label>
                <textarea
                  name="message"
                  rows={3}
                  placeholder="Bu kişinin hayatta olduğuna dair kısa bir not ekleyebilirsiniz..."
                  className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-white/30 focus:border-white/30 focus:outline-none focus:ring-1 focus:ring-white/20"
                />
              </div>

              {/* İzin onayları */}
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 space-y-2.5">
                <p className="text-xs font-semibold text-white/50 uppercase tracking-wide">İletişim Onayı</p>
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input name="consent_email" type="checkbox" className="mt-0.5 h-4 w-4 rounded accent-emerald-500" />
                  <span className="text-xs text-white/50 leading-relaxed">
                    İtirazımın sonucu hakkında e-posta ile bilgilendirilmeyi kabul ediyorum.
                  </span>
                </label>
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input name="consent_phone" type="checkbox" className="mt-0.5 h-4 w-4 rounded accent-emerald-500" />
                  <span className="text-xs text-white/50 leading-relaxed">
                    Gerekli görülmesi halinde ekibimizin telefon ile ulaşmasını kabul ediyorum.
                  </span>
                </label>
              </div>

              {state === 'error' && (
                <p className="text-xs text-red-400">{errorMsg}</p>
              )}

              <div className="flex items-center gap-3 pt-1">
                <button
                  type="submit"
                  disabled={state === 'submitting'}
                  className="flex-1 rounded-xl bg-white/10 py-2.5 text-sm font-semibold text-white transition hover:bg-white/15 disabled:opacity-60"
                >
                  {state === 'submitting' ? 'Gönderiliyor...' : 'İtirazı Gönder'}
                </button>
                <button
                  type="button"
                  onClick={() => { setOpen(false); setState('idle'); setErrorMsg('') }}
                  className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-white/50 hover:text-white/70"
                >
                  Vazgeç
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
