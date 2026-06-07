'use client'

import { resolveGdprRequest } from '../actions'
import { useState } from 'react'

export default function GdprResolveForm({ requestId, currentStatus }: { requestId: string; currentStatus: string }) {
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function handle(status: string) {
    setLoading(true)
    const result = await resolveGdprRequest(requestId, status, note)
    setLoading(false)
    if (!result.success) { alert(result.error); return }
    setDone(true)
  }

  if (done) return <span className="text-xs text-emerald-600 font-medium">Güncellendi</span>

  return (
    <div className="flex gap-2 items-center">
      <input
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Not..."
        className="text-xs border border-slate-200 rounded px-2 py-1 w-24 outline-none focus:border-emerald-400"
      />
      {currentStatus !== 'in_progress' && (
        <button onClick={() => handle('in_progress')} disabled={loading} className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
          İşleme Al
        </button>
      )}
      <button onClick={() => handle('completed')} disabled={loading} className="px-2 py-1 text-xs bg-emerald-700 text-white rounded hover:bg-emerald-800 disabled:opacity-50">
        Tamamla
      </button>
      <button onClick={() => handle('rejected')} disabled={loading} className="px-2 py-1 text-xs border border-red-300 text-red-600 rounded hover:bg-red-50 disabled:opacity-50">
        Reddet
      </button>
    </div>
  )
}
