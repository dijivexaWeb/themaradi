'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { setBulkPrintFlag, adminPublishBulkVault, type PrintFlag } from '../../actions'

interface Row {
  id: string
  display_name: string
  qr_id: string
  login_username: string | null
  status: string
  shipping_status: string | null
  tracking_number: string | null
  qr_label_printed: boolean
  waybill_printed: boolean
  letter_printed: boolean
  guide_printed: boolean
  claimed_at: string | null
}

const SHIP_LABELS: Record<string, string> = {
  pending: 'Bekliyor',
  preparing: 'Hazırlanıyor',
  ready: 'Hazır',
  shipped: 'Kargoda',
  delivered: 'Teslim Edildi',
  confirmed: 'Teslim Alındı',
}

function CheckDot({ on, onToggle, busy }: { on: boolean; onToggle: () => void; busy: boolean }) {
  return (
    <button
      onClick={onToggle}
      disabled={busy}
      title={on ? 'Geri al' : 'İşaretli değil'}
      className={`h-5 w-5 rounded-full border text-[10px] font-bold transition ${
        on
          ? 'border-emerald-500 bg-emerald-500 text-white hover:bg-emerald-600'
          : 'border-slate-300 bg-white text-slate-300 hover:border-slate-400'
      } disabled:opacity-40`}
    >
      {on ? '✓' : ''}
    </button>
  )
}

type StatusFilter =
  | 'all'
  | 'missing_output'
  | 'not_shipped'
  | 'shipped'
  | 'delivered'
  | 'unclaimed'
  | 'published'

const FILTERS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'Hepsi' },
  { value: 'missing_output', label: 'Çıktısı eksik' },
  { value: 'not_shipped', label: 'Henüz kargoya verilmedi' },
  { value: 'shipped', label: 'Kargoda' },
  { value: 'delivered', label: 'Teslim edildi' },
  { value: 'unclaimed', label: 'Sahiplenilmedi' },
  { value: 'published', label: 'Yayında' },
]

function matchesFilter(r: Row, filter: StatusFilter): boolean {
  switch (filter) {
    case 'all':
      return true
    case 'missing_output':
      return !r.qr_label_printed || !r.waybill_printed || !r.letter_printed || !r.guide_printed
    case 'not_shipped':
      return !r.shipping_status || ['pending', 'preparing', 'ready'].includes(r.shipping_status)
    case 'shipped':
      return r.shipping_status === 'shipped'
    case 'delivered':
      return r.shipping_status === 'delivered' || r.shipping_status === 'confirmed'
    case 'unclaimed':
      return r.status === 'unclaimed'
    case 'published':
      return r.status !== 'unclaimed'
    default:
      return true
  }
}

export default function TrackingTable({ rows }: { rows: Row[] }) {
  const router = useRouter()
  const [q, setQ] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [busyId, setBusyId] = useState<string | null>(null)

  const filtered = rows
    .filter((r) => matchesFilter(r, statusFilter))
    .filter((r) => !q.trim() || r.display_name.toLowerCase().includes(q.trim().toLowerCase()))

  async function toggle(vaultId: string, field: PrintFlag, current: boolean) {
    setBusyId(vaultId + field)
    await setBulkPrintFlag(vaultId, field, !current)
    setBusyId(null)
    router.refresh()
  }

  async function publish(vaultId: string) {
    if (!confirm('Bu profili doğrudan yayına almak istediğinize emin misiniz? Doğrulama sorulmaz, geri alınamaz.')) return
    setBusyId(vaultId + 'publish')
    await adminPublishBulkVault(vaultId)
    setBusyId(null)
    router.refresh()
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="İsimle filtrele..."
          className="w-full max-w-sm rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
        />
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
                statusFilter === f.value
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>
      <p className="text-xs text-slate-400">{filtered.length} / {rows.length} kayıt gösteriliyor</p>

      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-3 py-2 text-left">Ad Soyad</th>
              <th className="px-3 py-2 text-left">Ref</th>
              <th className="px-3 py-2 text-center">Sistem</th>
              <th className="px-3 py-2 text-center">QR</th>
              <th className="px-3 py-2 text-center">İrsaliye</th>
              <th className="px-3 py-2 text-center">Mektup</th>
              <th className="px-3 py-2 text-center">Kılavuz</th>
              <th className="px-3 py-2 text-left">Kargo</th>
              <th className="px-3 py-2 text-left">Durum</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((r) => (
              <tr key={r.id} className="hover:bg-slate-50">
                <td className="px-3 py-2 font-medium text-slate-900">
                  {r.display_name}
                  <div className="text-[10px] font-mono text-slate-400">{r.login_username}</div>
                </td>
                <td className="px-3 py-2 font-mono text-xs text-slate-500">{r.qr_id.replace('mem-', '').toUpperCase()}</td>
                <td className="px-3 py-2 text-center">
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-emerald-500 bg-emerald-500 text-[10px] font-bold text-white">✓</span>
                </td>
                <td className="px-3 py-2 text-center">
                  <CheckDot on={r.qr_label_printed} busy={busyId === r.id + 'qr_label_printed'} onToggle={() => toggle(r.id, 'qr_label_printed', r.qr_label_printed)} />
                </td>
                <td className="px-3 py-2 text-center">
                  <CheckDot on={r.waybill_printed} busy={busyId === r.id + 'waybill_printed'} onToggle={() => toggle(r.id, 'waybill_printed', r.waybill_printed)} />
                </td>
                <td className="px-3 py-2 text-center">
                  <CheckDot on={r.letter_printed} busy={busyId === r.id + 'letter_printed'} onToggle={() => toggle(r.id, 'letter_printed', r.letter_printed)} />
                </td>
                <td className="px-3 py-2 text-center">
                  <CheckDot on={r.guide_printed} busy={busyId === r.id + 'guide_printed'} onToggle={() => toggle(r.id, 'guide_printed', r.guide_printed)} />
                </td>
                <td className="px-3 py-2 text-xs text-slate-500">
                  {SHIP_LABELS[r.shipping_status ?? 'pending'] ?? r.shipping_status}
                  {r.tracking_number && <div className="text-[10px] text-slate-400">{r.tracking_number}</div>}
                </td>
                <td className="px-3 py-2 text-xs">
                  {r.status === 'unclaimed' ? (
                    <span className="text-amber-600">Bekliyor</span>
                  ) : (
                    <span className="text-emerald-600">Yayında{r.claimed_at ? '' : ' (admin)'}</span>
                  )}
                </td>
                <td className="px-3 py-2 text-right">
                  {r.status === 'unclaimed' && (
                    <button
                      onClick={() => publish(r.id)}
                      disabled={busyId === r.id + 'publish'}
                      className="rounded-lg bg-slate-900 px-2.5 py-1 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
                    >
                      Yayınla
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Link href="/admin/kargo" className="text-xs text-slate-400 hover:text-slate-700">
        Kargo durumunu güncellemek için → Kargo Takibi
      </Link>
    </div>
  )
}
