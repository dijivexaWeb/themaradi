'use client'

import { useState, useTransition } from 'react'
import { Save, Loader2 } from 'lucide-react'
import { updateBankSettings } from '../actions'

export default function BankSettingsForm({ settings }: { settings: Record<string, string> }) {
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaved(false); setError('')
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await updateBankSettings(fd)
      if (!result.success) { setError(result.error ?? 'Hata'); return }
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    })
  }

  const inp = 'w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15'

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 space-y-5">
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">IBAN</label>
          <input name="bank_iban" type="text" defaultValue={settings.bank_iban ?? 'GE29TB7522145061700002'}
            placeholder="GE29TB7522145061700002" required className={`${inp} font-mono`} />
          <p className="text-xs text-slate-400 mt-1">Boşluksuz IBAN</p>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Banka Adı</label>
          <input name="bank_name" type="text" defaultValue={settings.bank_name ?? 'TBC Bank'}
            placeholder="TBC Bank" required className={inp} />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Alıcı</label>
          <input name="bank_recipient" type="text" defaultValue={settings.bank_recipient ?? 'The Eternal Memory LLC'}
            placeholder="The Eternal Memory LLC" required className={inp} />
        </div>
      </div>

      <div className="border-t border-slate-100 pt-4">
        <label className="block text-xs font-medium text-slate-700 mb-1">PayPal.me Linki</label>
        <input name="paypal_link" type="url" defaultValue={settings.paypal_link ?? ''}
          placeholder="https://paypal.me/kullaniciadin"
          className={inp} />
        <p className="text-xs text-slate-400 mt-1">
          Ödeme sayfasında PayPal butonu için kullanılır. Tutar otomatik eklenir: <code className="bg-slate-100 px-1 rounded">paypal.me/xxx/249</code>
        </p>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
        <button type="submit" disabled={isPending}
          className="inline-flex items-center gap-2 bg-slate-900 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-slate-700 transition-colors disabled:opacity-60">
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {isPending ? 'Kaydediliyor...' : 'Kaydet'}
        </button>
        {saved && <span className="text-sm text-emerald-600 font-medium">✓ Kaydedildi — satın alma sayfaları güncellendi</span>}
      </div>
    </form>
  )
}
