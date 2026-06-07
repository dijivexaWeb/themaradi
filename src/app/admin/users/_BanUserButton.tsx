'use client'

import { banUser } from '../actions'
import { useState } from 'react'

export default function BanUserButton({ userId }: { userId: string }) {
  const [loading, setLoading] = useState(false)
  const [banned, setBanned] = useState(false)

  async function handle() {
    if (!window.confirm('Bu kullanıcıyı banlamak istediğinizden emin misiniz? Bu işlem geri alınabilir.')) return
    setLoading(true)
    const result = await banUser(userId)
    setLoading(false)
    if (!result.success) { alert(result.error); return }
    setBanned(true)
  }

  if (banned) return <span className="text-xs text-red-600 font-medium">Banlı</span>

  return (
    <button
      onClick={handle}
      disabled={loading}
      className="px-3 py-1 text-xs font-semibold border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
    >
      {loading ? '...' : 'Ban'}
    </button>
  )
}
