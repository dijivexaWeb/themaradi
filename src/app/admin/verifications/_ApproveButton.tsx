'use client'

import { approvePaymentAction } from './actions'
import { useState } from 'react'

export default function ApproveButton({ vaultId, paymentId }: { vaultId: string; paymentId?: string }) {
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function handle() {
    if (!window.confirm('Ödemeyi onaylamak istiyor musunuz? Vault aktive edilecek.')) return
    setLoading(true)
    const result = await approvePaymentAction(vaultId, paymentId ?? '')
    setLoading(false)
    if (!result.success) { alert('Hata oluştu'); return }
    setDone(true)
  }

  if (done) return <span className="text-xs text-emerald-600 font-semibold">✓ Onaylandı</span>

  return (
    <button
      onClick={handle}
      disabled={loading}
      className="px-3 py-1.5 text-xs font-semibold bg-emerald-700 text-white rounded-lg hover:bg-emerald-800 transition-colors disabled:opacity-60"
    >
      {loading ? '...' : 'Onayla'}
    </button>
  )
}
