'use client'

import { useState, useTransition } from 'react'
import { Plus, X, Loader2 } from 'lucide-react'
import { addPricingExemption } from '../actions'

type Vault = { id: string; display_name: string; owner_id: string; owner_email: string; owner_name: string }

export default function ExemptionForm({ vaults }: { vaults: Vault[] }) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [type, setType] = useState<'free' | 'discounted'>('free')

  const filtered = vaults.filter((v) =>
    v.display_name.toLowerCase().includes(search.toLowerCase()) ||
    v.owner_email.toLowerCase().includes(search.toLowerCase()) ||
    v.owner_name.toLowerCase().includes(search.toLowerCase())
  )

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setError('')
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await addPricingExemption(fd)
      if (!result.success) { setError(result.error ?? 'Hata oluştu'); return }
      setOpen(false); setSearch('')
    })
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 bg-purple-700 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-purple-600 transition-colors"
      >
        <Plus className="h-4 w-4" />
        Muafiyet Ekle
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="font-semibold text-slate-900">Ücretsiz / İndirimli Muafiyet</h2>
              <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Vault / Kullanıcı Ara</label>
                <input
                  type="text"
                  placeholder="Ad, e-posta veya vault adı..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/15"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                  Vault Seç <span className="text-red-500">*</span>
                </label>
                <select name="vault_id" required className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-purple-500">
                  <option value="">— Vault seçin —</option>
                  {filtered.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.display_name} — {v.owner_name || v.owner_email}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Muafiyet Türü</label>
                <div className="flex gap-3">
                  {(['free', 'discounted'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setType(t)}
                      className={`flex-1 rounded-xl border py-2.5 text-sm font-medium transition-colors ${type === t ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                    >
                      {t === 'free' ? 'Tamamen Ücretsiz' : 'İndirimli'}
                    </button>
                  ))}
                </div>
                <input type="hidden" name="exemption_type" value={type} />
              </div>

              {type === 'discounted' && (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">İndirim Oranı (%)</label>
                  <input
                    name="discount_percent"
                    type="number"
                    min="1"
                    max="99"
                    placeholder="50"
                    required
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-purple-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                  Sebep <span className="text-red-500">*</span>
                </label>
                <input
                  name="reason"
                  type="text"
                  required
                  placeholder="Şehit ailesi, ünlü kişi, basın ortağı..."
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Bitiş Tarihi (opsiyonel)</label>
                  <input
                    name="expires_at"
                    type="date"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Not</label>
                  <input
                    name="notes"
                    type="text"
                    placeholder="İç not..."
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {error && <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setOpen(false)} className="flex-1 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">İptal</button>
                <button type="submit" disabled={isPending} className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-purple-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-purple-600 disabled:opacity-60">
                  {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  {isPending ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
