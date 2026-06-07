'use client'

import { updateContactStatus } from '../actions'
import { useState } from 'react'

const STATUSES = ['new', 'in_progress', 'resolved', 'spam']

export default function ContactStatusForm({
  messageId,
  currentStatus,
  currentNote,
}: {
  messageId: string
  currentStatus: string
  currentNote: string
}) {
  const [status, setStatus] = useState(currentStatus)
  const [note, setNote] = useState(currentNote)
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSave() {
    setLoading(true)
    const result = await updateContactStatus(messageId, status, note)
    setLoading(false)
    if (!result.success) { alert(result.error); return }
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="flex flex-wrap gap-3 items-end">
      <div>
        <label className="text-xs text-slate-500 block mb-1">Durum</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm bg-white text-slate-700 outline-none focus:border-emerald-400"
        >
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <div className="flex-1 min-w-48">
        <label className="text-xs text-slate-500 block mb-1">Admin Notu</label>
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="İç not..."
          className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-sm bg-white text-slate-700 outline-none focus:border-emerald-400"
        />
      </div>
      <button
        onClick={handleSave}
        disabled={loading}
        className="px-4 py-1.5 text-sm font-semibold bg-emerald-700 text-white rounded-lg hover:bg-emerald-800 transition-colors disabled:opacity-60"
      >
        {saved ? 'Kaydedildi!' : loading ? '...' : 'Kaydet'}
      </button>
    </div>
  )
}
