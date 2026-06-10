'use client'

import { useState } from 'react'
import { approveDocumentAction, rejectDocumentAction } from './actions'

export default function DocApproveButton({ docId, vaultId }: { docId: string; vaultId: string }) {
  const [state, setState] = useState<'idle' | 'loading' | 'rejecting' | 'approved' | 'rejected'>('idle')
  const [rejectReason, setRejectReason] = useState('')

  async function handleApprove() {
    if (!window.confirm('Bu belgeyi onaylamak istiyor musunuz?')) return
    setState('loading')
    const res = await approveDocumentAction(docId, vaultId)
    setState(res.success ? 'approved' : 'idle')
    if (!res.success) alert('Hata oluştu')
  }

  async function handleReject() {
    if (!rejectReason.trim()) { alert('Lütfen red gerekçesi girin.'); return }
    setState('loading')
    const res = await rejectDocumentAction(docId, vaultId, rejectReason)
    setState(res.success ? 'rejected' : 'rejecting')
    if (!res.success) alert('Hata oluştu')
  }

  if (state === 'approved') return <span className="text-xs font-semibold text-emerald-600">✓ Belge onaylandı</span>
  if (state === 'rejected') return <span className="text-xs font-semibold text-red-600">✗ Belge reddedildi</span>

  return (
    <div className="space-y-2">
      {state === 'rejecting' ? (
        <div className="flex gap-2">
          <input
            type="text"
            value={rejectReason}
            onChange={e => setRejectReason(e.target.value)}
            placeholder="Red gerekçesi..."
            className="flex-1 rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-red-400"
          />
          <button
            onClick={handleReject}
            disabled={state !== 'rejecting'}
            className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-60"
          >
            Gönder
          </button>
          <button
            onClick={() => setState('idle')}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50"
          >
            Vazgeç
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          <button
            onClick={handleApprove}
            disabled={state === 'loading'}
            className="rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-800 disabled:opacity-60"
          >
            {state === 'loading' ? '...' : 'Belgeyi Onayla'}
          </button>
          <button
            onClick={() => setState('rejecting')}
            disabled={state === 'loading'}
            className="rounded-lg border border-red-300 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60"
          >
            Reddet
          </button>
        </div>
      )}
    </div>
  )
}
