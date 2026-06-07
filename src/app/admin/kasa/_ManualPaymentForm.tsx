'use client'

import { useState, useTransition } from 'react'
import { Plus, X, Loader2 } from 'lucide-react'
import { addManualPayment } from '../actions'

type Vault = { id: string; display_name: string; owner_email: string; owner_name: string }

export default function ManualPaymentForm({ vaults }: { vaults: Vault[] }) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  const filtered = vaults.filter((v) =>
    v.display_name.toLowerCase().includes(search.toLowerCase()) ||
    v.owner_email.toLowerCase().includes(search.toLowerCase()) ||
    v.owner_name.toLowerCase().includes(search.toLowerCase())
  )

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await addManualPayment(fd)
      if (!result.success) { setError(result.error ?? 'Hata oluştu'); return }
      setOpen(false)
      setSearch('')
    })
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 bg-emerald-700 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-emerald-600 transition-colors"
      >
        <Plus className="h-4 w-4" />
        Manuel Ödeme Ekle
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="font-semibold text-slate-900">Manuel Ödeme Kaydı</h2>
              <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Vault search */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                  Vault / Kullanıcı Ara
                </label>
                <input
                  type="text"
                  placeholder="Ad, e-posta veya vault adı..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                  Vault Seç <span className="text-red-500">*</span>
                </label>
                <select
                  name="vault_id"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15"
                >
                  <option value="">— Vault seçin —</option>
                  {filtered.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.display_name} — {v.owner_name || v.owner_email}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-400 mt-1">{filtered.length} vault gösteriliyor</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                    Tutar (GEL) <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    placeholder="249.00"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                    Ürün Türü <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="product_type"
                    required
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15"
                  >
                    <option value="memorial_one_time">Anma Profili (249 ₾)</option>
                    <option value="vault_setup">Yaşam Kasası Kurulum (49 ₾)</option>
                    <option value="vault_monthly">Yaşam Kasası Aylık (12.90 ₾)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                    Ödeme Durumu
                  </label>
                  <select
                    name="status"
                    defaultValue="paid"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15"
                  >
                    <option value="paid">Ödendi</option>
                    <option value="pending">Bekliyor</option>
                    <option value="overdue">Vadesi Geçmiş</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                    Ödeme Tarihi
                  </label>
                  <input
                    name="paid_at"
                    type="date"
                    defaultValue={new Date().toISOString().split('T')[0]}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                  Not (opsiyonel)
                </label>
                <input
                  name="notes"
                  type="text"
                  placeholder="Banka havalesi, nakit, vs..."
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15"
                />
              </div>

              {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex-1 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-600 transition-colors disabled:opacity-60"
                >
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
