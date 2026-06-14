'use client'

import { useActionState, useState } from 'react'
import { updateShippingStatusAction } from '../actions'
import Link from 'next/link'

const STATUS_LABELS: Record<string, { label: string; cls: string }> = {
  pending:    { label: 'Bekliyor',          cls: 'bg-slate-100 text-slate-600' },
  preparing:  { label: 'Hazırlanıyor',      cls: 'bg-blue-100 text-blue-700' },
  ready:      { label: 'Hazır / Paketlendi', cls: 'bg-yellow-100 text-yellow-700' },
  shipped:    { label: 'Kargoda',           cls: 'bg-orange-100 text-orange-700' },
  delivered:  { label: 'Teslim Edildi',     cls: 'bg-emerald-100 text-emerald-700' },
  confirmed:  { label: 'Teslim Alındı ✓',  cls: 'bg-emerald-200 text-emerald-800 font-bold' },
}

const NEXT_STATUS: Record<string, string> = {
  pending:   'preparing',
  preparing: 'ready',
  ready:     'shipped',
  shipped:   'delivered',
  delivered: 'confirmed',
}

const NEXT_LABEL: Record<string, string> = {
  pending:   '→ Hazırlanıyor',
  preparing: '→ Hazır / Paketlendi',
  ready:     '→ Kargoya Ver',
  shipped:   '→ Teslim Edildi',
  delivered: '→ Teslim Alındı',
}

type Vault = {
  id: string
  display_name: string
  shipping_address: string | null
  shipping_status: string
  tracking_number: string | null
  tracking_carrier: string | null
  shipped_at: string | null
  delivered_at: string | null
  shipping_confirmed_at: string | null
  ownerName: string | null
  ownerEmail: string | null
  ownerPhone: string | null
}

function StatusRow({ vault }: { vault: Vault }) {
  const [showShipForm, setShowShipForm] = useState(false)
  const [state, action, pending] = useActionState(updateShippingStatusAction, null)
  const statusCfg = STATUS_LABELS[vault.shipping_status] ?? STATUS_LABELS.pending
  const nextStatus = NEXT_STATUS[vault.shipping_status]
  const isCompleted = vault.shipping_status === 'confirmed'

  return (
    <div className="border border-slate-200 rounded-xl bg-white p-5 space-y-3 hover:border-slate-300 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <Link href={`/admin/memorials/${vault.id}`} className="font-semibold text-slate-900 hover:text-emerald-700 transition-colors">
            {vault.display_name}
          </Link>
          {vault.ownerName && (
            <p className="text-xs text-slate-500 mt-0.5">{vault.ownerName} · {vault.ownerEmail}</p>
          )}
          {vault.ownerPhone && (
            <p className="text-xs text-slate-500">{vault.ownerPhone}</p>
          )}
        </div>
        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusCfg.cls}`}>
          {statusCfg.label}
        </span>
      </div>

      {/* Adres */}
      {vault.shipping_address && (
        <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 whitespace-pre-wrap font-mono leading-5">
          {vault.shipping_address}
        </div>
      )}

      {/* Kargo bilgisi */}
      {vault.tracking_number && (
        <div className="flex flex-wrap gap-4 text-xs text-slate-600 bg-orange-50 border border-orange-200 rounded-lg px-3 py-2">
          <span><strong>Firma:</strong> {vault.tracking_carrier ?? '—'}</span>
          <span><strong>Takip No:</strong> <span className="font-mono font-bold text-orange-800">{vault.tracking_number}</span></span>
          {vault.shipped_at && <span><strong>Kargoya:</strong> {new Date(vault.shipped_at).toLocaleDateString('tr-TR')}</span>}
        </div>
      )}

      {vault.shipping_confirmed_at && (
        <p className="text-xs text-emerald-700">
          ✅ Teslim alındı: {new Date(vault.shipping_confirmed_at).toLocaleDateString('tr-TR')}
        </p>
      )}

      {/* State error */}
      {state?.error && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{state.error}</p>
      )}
      {state?.success && (
        <p className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded px-3 py-2">Güncellendi.</p>
      )}

      {/* Actions */}
      {!isCompleted && nextStatus && (
        <div className="pt-1">
          {nextStatus === 'shipped' && !showShipForm ? (
            <button
              onClick={() => setShowShipForm(true)}
              className="rounded-lg bg-emerald-700 px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-800"
            >
              {NEXT_LABEL[vault.shipping_status]}
            </button>
          ) : nextStatus === 'shipped' && showShipForm ? (
            <form action={action} className="space-y-2">
              <input type="hidden" name="vault_id" value={vault.id} />
              <input type="hidden" name="status" value="shipped" />
              <div className="flex gap-2 flex-wrap">
                <input
                  type="text"
                  name="tracking_carrier"
                  placeholder="Kargo firması (ör: MRG Kargo)"
                  className="flex-1 min-w-0 rounded border border-slate-300 px-3 py-1.5 text-xs focus:border-emerald-500 focus:outline-none"
                />
                <input
                  type="text"
                  name="tracking_number"
                  placeholder="Takip numarası *"
                  required
                  className="flex-1 min-w-0 rounded border border-slate-300 px-3 py-1.5 text-xs focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={pending}
                  className="rounded-lg bg-emerald-700 px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-800 disabled:opacity-50"
                >
                  {pending ? 'Kaydediliyor...' : '🚚 Kargoya Verildi'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowShipForm(false)}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-600 hover:bg-slate-50"
                >
                  İptal
                </button>
              </div>
            </form>
          ) : (
            <form action={action}>
              <input type="hidden" name="vault_id" value={vault.id} />
              <input type="hidden" name="status" value={nextStatus} />
              <button
                type="submit"
                disabled={pending}
                className="rounded-lg bg-emerald-700 px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-800 disabled:opacity-50"
              >
                {pending ? 'İşleniyor...' : NEXT_LABEL[vault.shipping_status]}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  )
}

const FILTER_TABS = [
  { key: 'all',       label: 'Tümü' },
  { key: 'pending',   label: 'Bekliyor' },
  { key: 'preparing', label: 'Hazırlanıyor' },
  { key: 'ready',     label: 'Hazır' },
  { key: 'shipped',   label: 'Kargoda' },
  { key: 'delivered', label: 'Teslim Edildi' },
  { key: 'confirmed', label: 'Tamamlandı' },
] as const

export default function KargoClient({ vaults }: { vaults: Vault[] }) {
  const [activeFilter, setActiveFilter] = useState<string>('all')

  const filtered = activeFilter === 'all'
    ? vaults
    : vaults.filter((v) => v.shipping_status === activeFilter)

  const counts: Record<string, number> = {}
  for (const v of vaults) {
    counts[v.shipping_status] = (counts[v.shipping_status] ?? 0) + 1
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900">📦 Kargo Takibi</h1>
        <p className="text-sm text-slate-500 mt-1">{vaults.length} kayıt — kargo adresi dolu memorial profiller</p>
      </div>

      {/* Filtre sekmeleri */}
      <div className="flex flex-wrap gap-2 mb-6">
        {FILTER_TABS.map(({ key, label }) => {
          const count = key === 'all' ? vaults.length : (counts[key] ?? 0)
          return (
            <button
              key={key}
              onClick={() => setActiveFilter(key)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                activeFilter === key
                  ? 'bg-emerald-700 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {label} {count > 0 && <span className="ml-1 opacity-70">({count})</span>}
            </button>
          )
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <p className="text-4xl mb-3">📦</p>
          <p>Bu filtrede kayıt yok.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((v) => (
            <StatusRow key={v.id} vault={v} />
          ))}
        </div>
      )}
    </div>
  )
}
