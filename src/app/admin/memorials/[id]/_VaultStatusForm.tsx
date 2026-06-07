'use client'

import { changeVaultStatus } from '../../actions'
import { useState } from 'react'

const STATUSES = ['hidden_vault', 'pending_verification', 'private_memorial', 'public_memorial', 'suspended']

export default function VaultStatusForm({ vaultId, currentStatus }: { vaultId: string; currentStatus: string }) {
  const [status, setStatus] = useState(currentStatus)
  const [loading, setLoading] = useState(false)

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newStatus = e.target.value
    if (!window.confirm(`Durumu "${newStatus}" olarak değiştir?`)) return
    setLoading(true)
    const result = await changeVaultStatus(vaultId, newStatus)
    setLoading(false)
    if (result.success) setStatus(newStatus)
    else alert(result.error)
  }

  return (
    <div className="flex gap-3 items-center">
      <select
        value={status}
        onChange={handleChange}
        disabled={loading}
        className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white text-slate-700 outline-none focus:border-emerald-400 disabled:opacity-50"
      >
        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
      </select>
      {loading && <span className="text-xs text-slate-400">Kaydediliyor...</span>}
    </div>
  )
}
