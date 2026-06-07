'use client'

import { resolveObjection } from '../actions'
import { useState } from 'react'

export default function ObjectionResolveForm({ objectionId }: { objectionId: string }) {
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function handle(resolution: 'upheld' | 'dismissed') {
    if (!window.confirm(`İtirazı "${resolution}" olarak çözmek istiyor musunuz?`)) return
    setLoading(true)
    const result = await resolveObjection(objectionId, resolution, note)
    setLoading(false)
    if (!result.success) { alert(result.error); return }
    setDone(true)
  }

  if (done) return <p className="text-sm text-emerald-600 font-medium">İtiraz çözüldü.</p>

  return (
    <div className="space-y-3">
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Admin notu (isteğe bağlı)..."
        rows={2}
        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none focus:border-emerald-400 resize-none"
      />
      <div className="flex gap-3">
        <button
          onClick={() => handle('upheld')}
          disabled={loading}
          className="px-4 py-2 text-sm font-semibold bg-emerald-700 text-white rounded-lg hover:bg-emerald-800 transition-colors disabled:opacity-60"
        >
          Onayla (Upheld)
        </button>
        <button
          onClick={() => handle('dismissed')}
          disabled={loading}
          className="px-4 py-2 text-sm font-semibold border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-60"
        >
          Reddet (Dismissed)
        </button>
      </div>
    </div>
  )
}
