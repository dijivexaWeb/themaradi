'use client'

import { useState } from 'react'
import { saveHideObjection } from '../../actions'

interface Props {
  vaultId: string
  initialHide: boolean
}

export default function ObjectionToggleForm({ vaultId, initialHide }: Props) {
  const [hide, setHide] = useState(initialHide)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  async function handleToggle() {
    const next = !hide
    setHide(next)
    setSaving(true)
    setError('')
    const result = await saveHideObjection(vaultId, next)
    setSaving(false)
    if (result.success) {
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } else {
      setHide(!next)
      setError(result.error ?? 'Kayıt başarısız.')
    }
  }

  return (
    <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
      <div>
        <p className="text-sm font-semibold text-slate-800">İtiraz Bölümünü Gizle</p>
        <p className="text-xs text-slate-400 mt-0.5">
          {hide
            ? 'Profil sayfasında "İtiraz Et" butonu gösterilmiyor.'
            : '"Bu kişi hayatta mı?" itiraz formu herkese görünür.'}
        </p>
      </div>
      <div className="flex items-center gap-3">
        {saving && <span className="text-xs text-slate-400">Kaydediliyor...</span>}
        {saved && <span className="text-xs font-medium text-emerald-600">✓ Kaydedildi</span>}
        {error && <span className="text-xs text-red-500">{error}</span>}
        <button
          type="button"
          onClick={handleToggle}
          disabled={saving}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-50 ${hide ? 'bg-emerald-600' : 'bg-slate-300'}`}
        >
          <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${hide ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
      </div>
    </div>
  )
}
