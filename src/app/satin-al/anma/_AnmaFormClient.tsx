'use client'

import { useActionState, useState } from 'react'
import { purchaseMemorialAction } from '../actions'
import Link from 'next/link'
import type { BankSettings } from '@/lib/bank-settings'

export default function AnmaFormClient({ bank, amount }: { bank: BankSettings; amount: number }) {
  const [state, action, pending] = useActionState(purchaseMemorialAction, null)
  const [method, setMethod] = useState<'bank' | 'card'>('bank')

  const inp = 'w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500'
  const inpDisabled = 'w-full bg-slate-900 border border-slate-800 text-slate-600 placeholder-slate-700 rounded-xl px-4 py-2.5 text-sm cursor-not-allowed'

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center px-4 py-16">
      <div className="max-w-lg w-full">
        <Link href="/satin-al" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-300 text-sm mb-8 transition-colors">
          ← Paket seçimine dön
        </Link>

        <div className="border border-amber-500/20 bg-slate-900 rounded-2xl p-7">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-amber-500/15 rounded-xl flex items-center justify-center text-xl">🕯️</div>
            <div>
              <h1 className="font-bold text-xl text-white">Anma Profili</h1>
              <p className="text-xs text-slate-500">{amount} ₾ — tek seferlik ödeme</p>
            </div>
          </div>

          {/* Ödeme Yöntemi Seçimi */}
          <div className="mb-6">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-3 font-semibold">Ödeme Yöntemi</p>
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
                <div className="text-sm font-semibold text-white">Banka Havalesi</div>
                <div className="text-[11px] text-emerald-400 font-medium mt-0.5">✓ Aktif</div>
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
                <div className="text-sm font-semibold text-slate-400">Kartla Ödeme</div>
                <div className="text-[11px] text-amber-500/70 font-medium mt-0.5">⏳ Çok Yakında</div>
              </button>
            </div>
          </div>

          {/* BANKA HAVALESİ */}
          {method === 'bank' && (
            <>
              <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 mb-6">
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-3 font-semibold">Havale Bilgileri</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">IBAN</span>
                    <span className="font-mono text-amber-400 select-all text-xs sm:text-sm">{bank.iban}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Banka</span>
                    <span className="text-slate-200">{bank.bankName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Alıcı</span>
                    <span className="text-slate-200">{bank.recipient}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-slate-700">
                    <span className="text-slate-400">Tutar</span>
                    <span className="text-white font-bold text-base">{amount} ₾</span>
                  </div>
                </div>
              </div>

              <form action={action} className="space-y-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5 font-medium">
                    Bu anma profili kim için? <span className="text-amber-400">*</span>
                  </label>
                  <input type="text" name="display_name" placeholder="Örn: Ahmet Yılmaz" required className={inp} />
                  <p className="text-xs text-slate-600 mt-1">Anma sayfasında görünecek ad</p>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5 font-medium">
                    Adınız Soyadınız <span className="text-amber-400">*</span>
                  </label>
                  <input type="text" name="sender_name" placeholder="Havaleyi gönderecek kişinin adı" required className={inp} />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5 font-medium">
                    E-posta <span className="text-amber-400">*</span>
                  </label>
                  <input type="email" name="sender_email" placeholder="Bildirim gönderilecek adres" required className={inp} />
                </div>
                {state?.error && (
                  <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">{state.error}</p>
                )}
                <button type="submit" disabled={pending}
                  className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors text-sm">
                  {pending ? 'İşleniyor...' : 'Havale Yaptım, Kaydı Oluştur →'}
                </button>
              </form>

              <p className="text-xs text-slate-600 mt-4 text-center leading-5">
                Havaleyi gönderdikten sonra bu formu doldurun. Ekibimiz ödemeyi doğruladıktan sonra
                paneliniz 24 saat içinde aktive edilir.
              </p>
            </>
          )}

          {/* KARTLA ÖDEME — YAKINDA */}
          {method === 'card' && (
            <div className="relative">
              <div className="absolute inset-0 z-10 rounded-xl bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
                <div className="text-4xl">🔒</div>
                <p className="text-white font-semibold text-sm">Bu ödeme yöntemi yakında aktif olacak</p>
                <p className="text-slate-400 text-xs text-center max-w-[220px] leading-5">
                  Kart ödemeleri entegrasyonu üzerinde çalışıyoruz. Şimdilik banka havalesi ile devam edebilirsiniz.
                </p>
                <button onClick={() => setMethod('bank')}
                  className="mt-2 bg-amber-500 hover:bg-amber-400 text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition-colors">
                  Banka Havalesi ile Öde →
                </button>
              </div>

              {/* Grayed out card form — for show only */}
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
