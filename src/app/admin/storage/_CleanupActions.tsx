'use client'

import { useState } from 'react'
import { Trash2, AlertTriangle, Loader2 } from 'lucide-react'
import { cleanOrphanFilesAction, cleanDeletedVaultFoldersAction } from './actions'

export function CleanOrphansButton({ fileCount, bytes }: { fileCount: number; bytes: string }) {
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [result, setResult] = useState('')

  async function handle() {
    if (!confirm(`${fileCount} sahipsiz dosya (${bytes}) silinecek. Emin misin?`)) return
    setState('loading')
    const res = await cleanOrphanFilesAction()
    if (res.error) { setState('error'); setResult(res.error) }
    else { setState('done'); setResult(`${res.deleted} dosya silindi`) }
  }

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <button
        onClick={handle}
        disabled={state === 'loading' || state === 'done'}
        className="flex items-center gap-1.5 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-700 disabled:opacity-50 transition-colors"
      >
        {state === 'loading' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
        Sahipsiz Dosyaları Temizle
      </button>
      {result && (
        <span className={`text-xs font-medium ${state === 'error' ? 'text-red-600' : 'text-green-600'}`}>
          {state === 'error' ? '⚠ ' : '✓ '}{result}
        </span>
      )}
    </div>
  )
}

export function CleanDeletedVaultsButton({
  vaultIds,
  totalBytes,
}: {
  vaultIds: string[]
  totalBytes: string
}) {
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [result, setResult] = useState('')

  async function handle() {
    if (!confirm(`${vaultIds.length} silinmiş vault klasörü R2'den temizlenecek (${totalBytes}). Emin misin?`)) return
    setState('loading')
    const res = await cleanDeletedVaultFoldersAction(vaultIds)
    if (res.error) { setState('error'); setResult(res.error) }
    else { setState('done'); setResult(`${res.deleted} dosya silindi`) }
  }

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <button
        onClick={handle}
        disabled={state === 'loading' || state === 'done'}
        className="flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
      >
        {state === 'loading' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
        Silinmiş Vault Klasörlerini Temizle
      </button>
      {result && (
        <span className={`text-xs font-medium ${state === 'error' ? 'text-red-600' : 'text-green-600'}`}>
          {state === 'error' ? '⚠ ' : '✓ '}{result}
        </span>
      )}
    </div>
  )
}
