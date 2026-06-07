'use client'

import { useState, useTransition } from 'react'
import { Save, Loader2, Eye, EyeOff } from 'lucide-react'
import { updateGatewaySettings } from '../actions'

const PROVIDERS = [
  { value: '', label: 'Seçilmedi (kart ödemesi kapalı)' },
  { value: 'payball', label: 'PayBall' },
  { value: 'stripe', label: 'Stripe' },
  { value: 'bog_pay', label: 'BOG Pay (Bank of Georgia)' },
  { value: 'tbc_pay', label: 'TBC Pay' },
  { value: 'other', label: 'Diğer' },
]

export default function PaymentGatewayForm({ settings }: { settings: Record<string, string> }) {
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [showSecret, setShowSecret] = useState(false)
  const [provider, setProvider] = useState(settings.payment_gateway_provider ?? '')
  const [enabled, setEnabled] = useState(settings.payment_gateway_enabled === 'true')

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaved(false); setError('')
    const fd = new FormData(e.currentTarget)
    fd.set('payment_gateway_provider', provider)
    fd.set('payment_gateway_enabled', enabled ? 'true' : 'false')
    startTransition(async () => {
      const result = await updateGatewaySettings(fd)
      if (!result.success) { setError(result.error ?? 'Hata'); return }
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    })
  }

  const inp = 'w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15'

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 space-y-5">
      {/* Durum + Sağlayıcı */}
      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
        <div>
          <p className="text-sm font-semibold text-slate-800">Kartla Ödeme Durumu</p>
          <p className="text-xs text-slate-500 mt-0.5">
            {enabled && provider ? `${PROVIDERS.find(p => p.value === provider)?.label ?? provider} aktif` : 'Kapalı — satın alma sayfasında "Çok Yakında" gösterilir'}
          </p>
        </div>
        <button type="button" onClick={() => setEnabled(v => !v)}
          className={`relative w-11 h-6 rounded-full transition-colors ${enabled && provider ? 'bg-emerald-600' : 'bg-slate-200'}`}>
          <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${enabled && provider ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Ödeme Sağlayıcısı</label>
          <select value={provider} onChange={e => setProvider(e.target.value)}
            className={`${inp} bg-white`}>
            {PROVIDERS.map(p => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </div>
      </div>

      {provider && (
        <div className="grid gap-4 sm:grid-cols-2 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">API Key / Public Key</label>
            <div className="relative">
              <input name="payment_gateway_api_key" type={showKey ? 'text' : 'password'}
                defaultValue={settings.payment_gateway_api_key ?? ''}
                placeholder="pk_live_..."
                className={`${inp} pr-10 font-mono text-xs`} />
              <button type="button" onClick={() => setShowKey(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Secret Key / Webhook Secret</label>
            <div className="relative">
              <input name="payment_gateway_secret" type={showSecret ? 'text' : 'password'}
                defaultValue={settings.payment_gateway_secret ?? ''}
                placeholder="sk_live_..."
                className={`${inp} pr-10 font-mono text-xs`} />
              <button type="button" onClick={() => setShowSecret(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div className="sm:col-span-2">
            <p className="text-xs text-amber-700 bg-amber-100 rounded-lg px-3 py-2">
              ⚠️ API anahtarları şifresiz saklanır. Güvenlik için production'da environment variable kullanmanız önerilir.
            </p>
          </div>
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
        <button type="submit" disabled={isPending}
          className="inline-flex items-center gap-2 bg-slate-900 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-slate-700 transition-colors disabled:opacity-60">
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {isPending ? 'Kaydediliyor...' : 'Kaydet'}
        </button>
        {saved && <span className="text-sm text-emerald-600 font-medium">✓ Kaydedildi</span>}
      </div>
    </form>
  )
}
