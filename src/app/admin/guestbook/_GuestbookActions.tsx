'use client'

import { moderateGuestbook } from '../actions'
import { useState } from 'react'

export default function GuestbookActions({ entryId }: { entryId: string }) {
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState('')

  async function handle(status: 'approved' | 'rejected' | 'spam') {
    setLoading(true)
    const result = await moderateGuestbook(entryId, status)
    setLoading(false)
    if (!result.success) { alert(result.error); return }
    setDone(status)
  }

  if (done) return <span className="text-xs text-emerald-600 font-medium">{done}</span>

  return (
    <div className="flex gap-2">
      <button onClick={() => handle('approved')} disabled={loading} className="px-3 py-1.5 text-xs font-semibold bg-emerald-700 text-white rounded-lg hover:bg-emerald-800 transition-colors disabled:opacity-60">
        Onayla
      </button>
      <button onClick={() => handle('rejected')} disabled={loading} className="px-3 py-1.5 text-xs font-semibold border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-60">
        Reddet
      </button>
      <button onClick={() => handle('spam')} disabled={loading} className="px-3 py-1.5 text-xs font-semibold border border-slate-300 text-slate-500 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-60">
        Spam
      </button>
    </div>
  )
}
