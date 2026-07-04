'use client'

import { useState, useTransition } from 'react'
import { updatePaymentAdminNotes } from '../../actions'

export default function AdminNotesForm({ paymentId, initialNotes }: { paymentId: string; initialNotes: string | null }) {
  const [notes, setNotes] = useState(initialNotes ?? '')
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  function handleSave() {
    setSaved(false); setError('')
    startTransition(async () => {
      const result = await updatePaymentAdminNotes(paymentId, notes)
      if (!result.success) { setError(result.error ?? 'Hata'); return }
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    })
  }

  return (
    <div className="space-y-2">
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={5}
        placeholder="WhatsApp görüşme özeti, önemli notlar, takip edilmesi gerekenler..."
        className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15"
      />
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-700 transition-colors disabled:opacity-60"
        >
          {isPending ? 'Kaydediliyor...' : 'Notu Kaydet'}
        </button>
        {saved && <span className="text-xs font-medium text-emerald-600">✓ Kaydedildi</span>}
        {error && <span className="text-xs font-medium text-red-600">{error}</span>}
      </div>
    </div>
  )
}
