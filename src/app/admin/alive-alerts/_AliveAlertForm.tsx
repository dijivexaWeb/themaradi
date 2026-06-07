'use client'

import { resolveAliveAlert } from '../actions'
import { useState } from 'react'

export default function AliveAlertForm({ alertId, currentStatus }: { alertId: string; currentStatus: string }) {
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function handle(status: string) {
    setLoading(true)
    const result = await resolveAliveAlert(alertId, status, note)
    setLoading(false)
    if (!result.success) { alert(result.error); return }
    setDone(true)
  }

  if (done) return <p className="text-sm text-emerald-600 font-medium">İşlem tamamlandı.</p>

  return (
    <div className="space-y-3">
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Admin notu..."
        rows={2}
        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none focus:border-emerald-400 resize-none"
      />
      <div className="flex gap-2 flex-wrap">
        {currentStatus === 'open' && (
          <button
            onClick={() => handle('investigating')}
            disabled={loading}
            className="px-3 py-1.5 text-xs font-semibold bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-60"
          >
            İncelemeye Al
          </button>
        )}
        <button
          onClick={() => handle('resolved')}
          disabled={loading}
          className="px-3 py-1.5 text-xs font-semibold bg-emerald-700 text-white rounded-lg hover:bg-emerald-800 transition-colors disabled:opacity-60"
        >
          Çöz (Vault Kaldır)
        </button>
        <button
          onClick={() => handle('dismissed')}
          disabled={loading}
          className="px-3 py-1.5 text-xs font-semibold border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-60"
        >
          Reddet
        </button>
      </div>
    </div>
  )
}
