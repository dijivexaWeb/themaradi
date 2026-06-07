'use client'

import { approveVault } from '../actions'
import { useState } from 'react'

export default function ApproveButton({ vaultId }: { vaultId: string }) {
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function handle() {
    if (!window.confirm('Bu vault\'u onaylamak istiyor musunuz? Durum public_memorial olarak değişecek.')) return
    setLoading(true)
    const result = await approveVault(vaultId)
    setLoading(false)
    if (!result.success) { alert(result.error); return }
    setDone(true)
  }

  if (done) return <span className="text-xs text-emerald-600 font-medium">Onaylandı</span>

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
