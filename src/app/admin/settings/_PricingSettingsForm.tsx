'use client'

import { useState, useTransition } from 'react'
import { Save, Loader2 } from 'lucide-react'
import { updatePricingSettings } from '../actions'

export default function PricingSettingsForm({ settings }: { settings: Record<string, string> }) {
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [campaignActive, setCampaignActive] = useState(settings.campaign_active === 'true')

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaved(false); setError('')
    const fd = new FormData(e.currentTarget)
    fd.set('campaign_active', campaignActive ? 'true' : 'false')
    startTransition(async () => {
      const result = await updatePricingSettings(fd)
      if (!result.success) { setError(result.error ?? 'Hata'); return }
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 space-y-6">
      {/* Base prices */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">Normal Fiyatlar</p>
        <div className="grid gap-4 sm:grid-cols-3">
          <PriceField name="price_memorial_one_time" label="Anma Profili" sub="Tek seferlik" defaultValue={settings.price_memorial_one_time ?? '249'} />
          <PriceField name="price_vault_setup" label="Yaşam Kasası Kurulum" sub="Tek seferlik" defaultValue={settings.price_vault_setup ?? '49'} />
          <PriceField name="price_vault_monthly" label="Yaşam Kasası Aylık" sub="Aylık tekrarlayan" defaultValue={settings.price_vault_monthly ?? '12.90'} />
        </div>
      </div>

      {/* Campaign toggle */}
      <div className="border-t border-slate-100 pt-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Kampanya</p>
            <p className="text-xs text-slate-400 mt-0.5">Kampanya açıkken landing sayfasında kampanya fiyatları gösterilir</p>
          </div>
          <button
            type="button"
            onClick={() => setCampaignActive((v) => !v)}
            className={`relative w-11 h-6 rounded-full transition-colors ${campaignActive ? 'bg-emerald-600' : 'bg-slate-200'}`}
          >
            <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${campaignActive ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>

        {campaignActive && (
          <div className="space-y-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Kampanya Etiketi</label>
              <input
                name="campaign_label"
                type="text"
                defaultValue={settings.campaign_label}
                placeholder='örn: "Kuruluş indirimi — %20"'
                className="w-full rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-amber-400"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <PriceField name="campaign_price_memorial" label="Kampanya: Anma" sub="Boşsa kampanya yok" defaultValue={settings.campaign_price_memorial ?? ''} required={false} />
              <PriceField name="campaign_price_vault_setup" label="Kampanya: Kurulum" sub="Boşsa kampanya yok" defaultValue={settings.campaign_price_vault_setup ?? ''} required={false} />
              <PriceField name="campaign_price_vault_monthly" label="Kampanya: Aylık" sub="Boşsa kampanya yok" defaultValue={settings.campaign_price_vault_monthly ?? ''} required={false} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Kampanya Bitiş Tarihi</label>
              <input
                name="campaign_ends_at"
                type="date"
                defaultValue={settings.campaign_ends_at?.split('T')[0] ?? ''}
                className="rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-amber-400"
              />
            </div>
          </div>
        )}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 bg-slate-900 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-slate-700 transition-colors disabled:opacity-60"
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {isPending ? 'Kaydediliyor...' : 'Kaydet'}
        </button>
        {saved && <span className="text-sm text-emerald-600 font-medium">✓ Kaydedildi</span>}
      </div>
    </form>
  )
}

function PriceField({ name, label, sub, defaultValue, required = true }: { name: string; label: string; sub: string; defaultValue: string; required?: boolean }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-700 mb-1">{label}</label>
      <div className="relative">
        <input
          name={name}
          type="number"
          step="0.01"
          min="0"
          defaultValue={defaultValue}
          required={required}
          placeholder="0.00"
          className="w-full rounded-xl border border-slate-200 pl-3 pr-10 py-2.5 text-sm text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">₾</span>
      </div>
      <p className="text-xs text-slate-400 mt-1">{sub}</p>
    </div>
  )
}
