'use client'

import { useState } from 'react'
import { banUserAction, unbanUserAction } from './actions'

type Props = {
  userId: string
  isBanned: boolean
  bannedUntil: string | null
}

const DURATIONS = [
  { value: '24h', label: '1 gün' },
  { value: '168h', label: '7 gün' },
  { value: '720h', label: '30 gün' },
  { value: '876000h', label: 'Kalıcı' },
] as const

function formatBannedUntil(value: string | null) {
  if (!value) return 'Banlı'
  return `Banlı: ${new Date(value).toLocaleDateString('tr-TR')}`
}

export default function BanUserButton({ userId, isBanned, bannedUntil }: Props) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleUnban() {
    if (!window.confirm('Bu kullanıcının banını kaldırmak istiyor musunuz?')) return
    setLoading(true)
    setError('')
    const result = await unbanUserAction(userId)
    setLoading(false)
    if (!result.success) {
      setError(result.error ?? 'Ban kaldırılamadı')
      return
    }
  }

  async function handleBan(formData: FormData) {
    setLoading(true)
    setError('')
    const result = await banUserAction(formData)
    setLoading(false)
    if (!result.success) {
      setError(result.error ?? 'Ban uygulanamadı')
      return
    }
    setOpen(false)
  }

  if (isBanned) {
    return (
      <div className="flex flex-col gap-1">
        <span className="text-xs font-medium text-red-600">{formatBannedUntil(bannedUntil)}</span>
        <button
          onClick={handleUnban}
          disabled={loading}
          className="px-3 py-1 text-xs font-semibold border border-emerald-300 text-emerald-700 rounded-lg hover:bg-emerald-50 transition-colors disabled:opacity-50"
        >
          {loading ? '...' : 'Banı Kaldır'}
        </button>
        {error && <span className="text-xs text-red-600">{error}</span>}
      </div>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((value) => !value)}
        disabled={loading}
        className="px-3 py-1 text-xs font-semibold border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
      >
        Ban
      </button>

      {open && (
        <form action={handleBan} className="absolute right-0 top-8 z-20 w-72 rounded-xl border border-slate-200 bg-white p-4 shadow-xl">
          <input type="hidden" name="user_id" value={userId} />

          <label className="block text-xs font-semibold text-slate-600 mb-1">Süre</label>
          <select
            name="duration"
            defaultValue="168h"
            className="mb-3 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none focus:border-red-400"
          >
            {DURATIONS.map((duration) => (
              <option key={duration.value} value={duration.value}>{duration.label}</option>
            ))}
          </select>

          <label className="block text-xs font-semibold text-slate-600 mb-1">Sebep</label>
          <textarea
            name="reason"
            required
            minLength={3}
            maxLength={500}
            rows={3}
            placeholder="Spam, kötüye kullanım, ödeme sahtekarlığı..."
            className="mb-3 w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none focus:border-red-400"
          />

          {error && <p className="mb-3 text-xs text-red-600">{error}</p>}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-700"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-500 disabled:opacity-50"
            >
              {loading ? 'Uygulanıyor...' : 'Banla'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
