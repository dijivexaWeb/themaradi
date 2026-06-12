'use client'

import { useState } from 'react'
import { confirmUserEmailAction } from './actions'

export default function ConfirmEmailButton({ userId }: { userId: string }) {
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  async function handleConfirm() {
    if (!window.confirm('Email onaylanacak ve kullanıcıya bildirim gönderilecek. Devam?')) return
    setLoading(true)
    setError('')
    const result = await confirmUserEmailAction(userId)
    setLoading(false)
    if (!result.success) {
      setError(result.error ?? 'Onaylanamadı')
      return
    }
    setDone(true)
  }

  if (done) {
    return <span className="text-xs font-semibold text-emerald-600">✓ Onaylandı</span>
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        onClick={handleConfirm}
        disabled={loading}
        className="px-3 py-1 text-xs font-semibold border border-amber-400 text-amber-700 rounded-lg hover:bg-amber-50 transition-colors disabled:opacity-50"
      >
        {loading ? '...' : 'Email Onayla'}
      </button>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  )
}
