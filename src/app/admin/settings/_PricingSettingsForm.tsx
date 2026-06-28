'use client'

import { useState, useTransition } from 'react'
import { Save, Loader2 } from 'lucide-react'
import { updatePricingSettings } from '../actions'

const CURRENCIES = [
  {
    code: 'gel',
    symbol: '₾',
    label: 'GEL',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    langs: ['ka'],
    langLabel: 'Gürcüce',
    flagLabel: 'KA',
  },
  {
    code: 'try',
    symbol: '₺',
    label: 'TRY',
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
    langs: ['tr'],
    langLabel: 'Türkçe',
    flagLabel: 'TR',
  },
  {
    code: 'usd',
    symbol: '$',
    label: 'USD',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    langs: ['he', 'en', 'hy', 'az', 'ru'],
    langLabel: 'İbranice · İngilizce · Ermenice · Azerice · Rusça',
    flagLabel: 'IL/EN/AM/AZ/RU',
  },
]

const PRODUCTS = [
  {
    id: 'memorial',
    icon: '🕯️',
    label: 'Anma Profili',
    desc: 'Faz 2 (Standart): 299 ₾ · Faz 1 (Erken Erişim): 199 ₾',
    fields: {
      gel: { normal: 'price_memorial_one_time', campaign: 'campaign_price_memorial', default: '299' },
      try: { normal: 'price_memorial_try', campaign: 'campaign_price_memorial_try', default: '' },
      usd: { normal: 'price_memorial_usd', campaign: 'campaign_price_memorial_usd', default: '' },
    },
  },
  {
    id: 'family',
    icon: '👨‍👩‍👧‍👦',
    label: 'Aile Paketi',
    desc: '4 üye dahil',
    fields: {
      gel: { normal: 'price_family_gel', campaign: 'campaign_price_family_gel', default: '399' },
      try: { normal: 'price_family_try', campaign: 'campaign_price_family_try', default: '' },
      usd: { normal: 'price_family_usd', campaign: 'campaign_price_family_usd', default: '' },
    },
  },
]

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
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* Kampanya Toggle */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-800">Kampanya Modu</p>
            <p className="text-xs text-slate-400 mt-0.5">
              Açıkken kampanya fiyatları gösterilir. Kampanya fiyatı boşsa normal fiyat geçerli.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setCampaignActive(v => !v)}
            className={`relative w-12 h-6 rounded-full transition-colors ${campaignActive ? 'bg-emerald-500' : 'bg-slate-200'}`}
          >
            <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${campaignActive ? 'translate-x-7' : 'translate-x-1'}`} />
          </button>
        </div>

        {campaignActive && (
          <div className="mt-4 pt-4 border-t border-slate-100 grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Kampanya Etiketi</label>
              <input
                name="campaign_label"
                type="text"
                defaultValue={settings.campaign_label ?? ''}
                placeholder='örn: "Kuruluş İndirimi — %20"'
                className="w-full rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-slate-800 outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Bitiş Tarihi</label>
              <input
                name="campaign_ends_at"
                type="date"
                defaultValue={settings.campaign_ends_at?.split('T')[0] ?? ''}
                className="w-full rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-slate-800 outline-none focus:border-amber-400"
              />
            </div>
          </div>
        )}
      </div>

      {/* Ürün Kartları */}
      {PRODUCTS.map(product => (
        <div key={product.id} className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          {/* Kart başlığı */}
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
            <span className="text-xl">{product.icon}</span>
            <div>
              <p className="text-sm font-semibold text-slate-800">{product.label}</p>
              <p className="text-xs text-slate-400">{product.desc}</p>
            </div>
          </div>

          {/* Başlık satırı */}
          <div className="grid grid-cols-[1fr_140px_140px] gap-3 px-5 py-2 bg-slate-50 border-b border-slate-100">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Para Birimi & Diller</p>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-center">Normal</p>
            <p className={`text-[11px] font-semibold uppercase tracking-wider text-center ${campaignActive ? 'text-amber-500' : 'text-slate-300'}`}>
              Kampanya
            </p>
          </div>

          {/* Para birimi satırları */}
          <div className="divide-y divide-slate-50">
            {CURRENCIES.map(cur => {
              const fieldKey = cur.code as keyof typeof product.fields
              const field = product.fields[fieldKey]
              if (!field) return null
              return (
                <div key={cur.code} className="grid grid-cols-[1fr_140px_140px] gap-3 px-5 py-3 items-center">
                  {/* Para birimi + dil bilgisi */}
                  <div className="flex items-start gap-2.5">
                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-sm font-bold shrink-0 ${cur.bg} ${cur.text} border ${cur.border}`}>
                      {cur.symbol}
                    </span>
                    <div>
                      <p className="text-xs font-semibold text-slate-700">{cur.label}</p>
                      <p className="text-[10px] text-slate-400 leading-tight mt-0.5">{cur.langLabel}</p>
                    </div>
                  </div>

                  {/* Normal fiyat */}
                  <div className="relative">
                    <input
                      name={field.normal}
                      type="number"
                      step="0.01"
                      min="0"
                      defaultValue={settings[field.normal] ?? field.default}
                      required={cur.code === 'gel'}
                      placeholder="—"
                      className="w-full rounded-lg border border-slate-200 pl-3 pr-7 py-2 text-sm text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">{cur.symbol}</span>
                  </div>

                  {/* Kampanya fiyat */}
                  <div className="relative">
                    <input
                      name={field.campaign}
                      type="number"
                      step="0.01"
                      min="0"
                      defaultValue={settings[field.campaign] ?? ''}
                      disabled={!campaignActive}
                      placeholder="—"
                      className={`w-full rounded-lg border pl-3 pr-7 py-2 text-sm outline-none transition-colors
                        ${campaignActive
                          ? 'border-amber-200 bg-amber-50 text-slate-800 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/15'
                          : 'border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed'
                        }`}
                    />
                    <span className={`absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-medium ${campaignActive ? 'text-amber-400' : 'text-slate-300'}`}>
                      {cur.symbol}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}

      {/* Ek Üye (sadece GEL) */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
          <span className="text-xl">➕</span>
          <div>
            <p className="text-sm font-semibold text-slate-800">Ek Üye</p>
            <p className="text-xs text-slate-400">Aile paketine sonradan eklenen her üye için</p>
          </div>
        </div>
        <div className="grid grid-cols-[1fr_140px_140px] gap-3 px-5 py-2 bg-slate-50 border-b border-slate-100">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Para Birimi & Diller</p>
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-center">Normal</p>
          <p className={`text-[11px] font-semibold uppercase tracking-wider text-center ${campaignActive ? 'text-amber-500' : 'text-slate-300'}`}>
            Kampanya
          </p>
        </div>
        <div className="px-5 py-3 grid grid-cols-[1fr_140px_140px] gap-3 items-center">
          <div className="flex items-start gap-2.5">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-sm font-bold shrink-0 bg-emerald-50 text-emerald-700 border border-emerald-200">₾</span>
            <div>
              <p className="text-xs font-semibold text-slate-700">GEL</p>
              <p className="text-[10px] text-slate-400 leading-tight mt-0.5">Gürcüce</p>
            </div>
          </div>
          <div className="relative">
            <input
              name="price_additional_member_gel"
              type="number"
              step="0.01"
              min="0"
              defaultValue={settings.price_additional_member_gel ?? '129'}
              required
              placeholder="0.00"
              className="w-full rounded-lg border border-slate-200 pl-3 pr-7 py-2 text-sm text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15"
            />
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">₾</span>
          </div>
          <div className="relative">
            <input
              name="campaign_price_additional_member_gel"
              type="number"
              step="0.01"
              min="0"
              defaultValue={settings.campaign_price_additional_member_gel ?? ''}
              disabled={!campaignActive}
              placeholder="—"
              className={`w-full rounded-lg border pl-3 pr-7 py-2 text-sm outline-none transition-colors
                ${campaignActive
                  ? 'border-amber-200 bg-amber-50 text-slate-800 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/15'
                  : 'border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed'
                }`}
            />
            <span className={`absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-medium ${campaignActive ? 'text-amber-400' : 'text-slate-300'}`}>₾</span>
          </div>
        </div>
      </div>

      {/* Koruma Yenileme (Faz 3) */}
      <div className="bg-white border border-emerald-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-emerald-100 flex items-center gap-3 bg-emerald-50/50">
          <span className="text-xl">🔄</span>
          <div>
            <p className="text-sm font-semibold text-slate-800">Koruma Yenileme <span className="ml-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-full uppercase tracking-wide">Faz 3</span></p>
            <p className="text-xs text-slate-400">3. yıldan sonra yıllık ücret — platform_settings tablosunda</p>
          </div>
        </div>
        <div className="p-5 grid sm:grid-cols-3 gap-4">
          {[
            { name: 'hosting_renewal_price_gel', label: 'GEL (₾)', sym: '₾', def: '29' },
            { name: 'hosting_renewal_price_usd', label: 'USD ($)', sym: '$', def: '9' },
            { name: 'hosting_renewal_price_try', label: 'TRY (₺)', sym: '₺', def: '350' },
          ].map(f => (
            <div key={f.name}>
              <label className="block text-xs font-medium text-slate-600 mb-1">{f.label} · yıllık</label>
              <div className="relative">
                <input
                  name={f.name}
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={settings[f.name] ?? f.def}
                  placeholder="—"
                  className="w-full rounded-lg border border-emerald-200 bg-emerald-50/30 pl-3 pr-7 py-2 text-sm text-slate-800 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/15"
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">{f.sym}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="px-5 pb-4 flex items-start gap-2">
          <span className="text-emerald-600 text-xs mt-0.5">ℹ️</span>
          <p className="text-[11px] text-slate-400">İlk 3 yıl barındırma satın alma fiyatına dahildir. Bu fiyat 4. yıldan itibaren uygulanır. Ödeme yapılmazsa galeri gizlenir, sayfa silinmez (Dormant Mode).</p>
        </div>
      </div>

      {/* Yaşam Kasası */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
          <span className="text-xl">🗄️</span>
          <div>
            <p className="text-sm font-semibold text-slate-800">Yaşam Kasası</p>
            <p className="text-xs text-slate-400">Kurulum + Aylık abonelik</p>
          </div>
        </div>
        <div className="p-5 grid sm:grid-cols-3 gap-4">
          {[
            { name: 'price_vault_setup', label: 'Kurulum', sym: '₾', def: '49', sub: 'GEL · kurulum' },
            { name: 'price_vault_monthly', label: 'Aylık', sym: '₾', def: '12.90', sub: 'GEL · aylık tekrarlayan' },
            { name: 'price_vault_setup_try', label: 'Kurulum', sym: '₺', def: '', sub: 'TRY · kurulum' },
            { name: 'price_vault_monthly_try', label: 'Aylık', sym: '₺', def: '', sub: 'TRY · aylık tekrarlayan' },
            { name: 'price_vault_setup_usd', label: 'Kurulum', sym: '$', def: '', sub: 'USD · kurulum' },
            { name: 'price_vault_monthly_usd', label: 'Aylık', sym: '$', def: '', sub: 'USD · aylık tekrarlayan' },
          ].map(f => (
            <div key={f.name}>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                {f.label} <span className="text-slate-400">· {f.sub}</span>
              </label>
              <div className="relative">
                <input
                  name={f.name}
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={settings[f.name] ?? f.def}
                  required={f.sym === '₾' && f.def !== ''}
                  placeholder="—"
                  className="w-full rounded-lg border border-slate-200 pl-3 pr-7 py-2 text-sm text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15"
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">{f.sym}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</p>}

      <div className="flex items-center gap-3">
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
