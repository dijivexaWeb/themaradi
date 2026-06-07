'use client'

import { useState } from 'react'
import { rejectVault } from '../actions'

interface Props {
  vaultId: string
  vaultName: string
}

export default function RejectModal({ vaultId, vaultName }: Props) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (reason.trim().length < 5) { setError('En az 5 karakter girin'); return }
    setLoading(true)
    const result = await rejectVault(vaultId, reason)
    setLoading(false)
    if (!result.success) { setError(result.error ?? 'Hata oluştu'); return }
    setOpen(false)
    setReason('')
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-3 py-1.5 text-xs font-semibold border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors"
      >
        Reddet
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
            <h3 className="font-semibold text-slate-900 mb-1">Vault Reddet</h3>
            <p className="text-sm text-slate-500 mb-4">{vaultName}</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Red gerekçesi (kullanıcıya iletilir)..."
                rows={4}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 resize-none"
              />
              {error && <p className="text-xs text-red-600">{error}</p>}
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="px-4 py-2 text-sm border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 text-sm font-semibold bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-60"
                >
                  {loading ? 'Gönderiliyor...' : 'Reddet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
