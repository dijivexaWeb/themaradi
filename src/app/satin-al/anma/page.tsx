'use client'

import { useActionState } from 'react'
import { purchaseMemorialAction } from '../actions'
import Link from 'next/link'

const IBAN = 'GE29TB7522145061700002'
const BANK = 'TBC Bank'

export default function AnmaSatinAlPage() {
  const [state, action, pending] = useActionState(purchaseMemorialAction, null)

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
              <p className="text-xs text-slate-500">Havale ile ödeme</p>
            </div>
          </div>

          {/* IBAN Bilgisi */}
          <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 mb-6">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-3 font-semibold">Havale Bilgileri</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">IBAN</span>
                <span className="font-mono text-amber-400 select-all">{IBAN}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Banka</span>
                <span className="text-slate-200">{BANK}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Alıcı</span>
                <span className="text-slate-200">The Maradi LLC</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-700">
                <span className="text-slate-400">Tutar</span>
                <span className="text-white font-bold text-base">249 ₾</span>
              </div>
            </div>
          </div>

          <form action={action} className="space-y-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1.5 font-medium">
                Bu anma profili kim için? <span className="text-amber-400">*</span>
              </label>
              <input
                type="text"
                name="display_name"
                placeholder="Örn: Ahmet Yılmaz"
                required
                className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500"
              />
              <p className="text-xs text-slate-600 mt-1">Anma sayfasında görünecek ad</p>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1.5 font-medium">
                Adınız Soyadınız <span className="text-amber-400">*</span>
              </label>
              <input
                type="text"
                name="sender_name"
                placeholder="Havaleyi gönderecek kişinin adı"
                required
                className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1.5 font-medium">
                E-posta <span className="text-amber-400">*</span>
              </label>
              <input
                type="email"
                name="sender_email"
                placeholder="Bildirim gönderilecek adres"
                required
                className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500"
              />
            </div>

            {state?.error && (
              <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                {state.error}
              </p>
            )}

            <button
              type="submit"
              disabled={pending}
              className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
            >
              {pending ? 'İşleniyor...' : 'Havale Yaptım, Kaydı Oluştur →'}
            </button>
          </form>

          <p className="text-xs text-slate-600 mt-4 text-center leading-5">
            Havaleyi gönderdikten sonra bu formu doldurun. Ekibimiz ödemeyi doğruladıktan sonra
            hesabınız 24 saat içinde aktive edilir.
          </p>
        </div>
      </div>
    </div>
  )
}
