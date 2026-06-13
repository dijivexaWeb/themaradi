'use client'

import { useState } from 'react'
import { saveNotableProfile } from '../../actions'

interface Props {
  vaultId: string
  initial: {
    is_notable: boolean | null
    nationality: string | null
    notable_subtitle: string | null
    notable_motto: string | null
    notable_motto_tr: string | null
    featured_quote: string | null
    notable_legacy_text: string | null
    notable_verified_note: string | null
  }
}

export default function NotableForm({ vaultId, initial }: Props) {
  const [isNotable, setIsNotable] = useState(initial.is_notable ?? false)
  const [nationality, setNationality] = useState(initial.nationality ?? '')
  const [subtitle, setSubtitle] = useState(initial.notable_subtitle ?? '')
  const [motto, setMotto] = useState(initial.notable_motto ?? '')
  const [mottoTr, setMottoTr] = useState(initial.notable_motto_tr ?? '')
  const [quote, setQuote] = useState(initial.featured_quote ?? '')
  const [legacy, setLegacy] = useState(initial.notable_legacy_text ?? '')
  const [verifiedNote, setVerifiedNote] = useState(initial.notable_verified_note ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    const result = await saveNotableProfile(vaultId, {
      is_notable: isNotable,
      nationality: nationality || null,
      notable_subtitle: subtitle.trim() || null,
      notable_motto: motto.trim() || null,
      notable_motto_tr: mottoTr.trim() || null,
      featured_quote: quote.trim() || null,
      notable_legacy_text: legacy.trim() || null,
      notable_verified_note: verifiedNote.trim() || null,
    })
    setSaving(false)
    if (result.success) {
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } else {
      setError(result.error ?? 'Kayıt başarısız.')
    }
  }

  const inp = 'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500'
  const lbl = 'mb-1 block text-xs font-semibold text-slate-500 uppercase tracking-wide'

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Toggle */}
      <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
        <div>
          <p className="text-sm font-semibold text-slate-800">Ulusal Miras Profili</p>
          <p className="text-xs text-slate-400 mt-0.5">Özel rozet, yaldız çerçeve ve miras bölümleri gösterilir</p>
        </div>
        <button
          type="button"
          onClick={() => setIsNotable(v => !v)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isNotable ? 'bg-emerald-600' : 'bg-slate-300'}`}
        >
          <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${isNotable ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
      </div>

      {isNotable && (
        <>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className={lbl}>Milliyet</label>
              <select value={nationality} onChange={e => setNationality(e.target.value)} className={inp}>
                <option value="">Seç...</option>
                <option value="GE">🇬🇪 Gürcistan</option>
                <option value="TR">🇹🇷 Türkiye</option>
                <option value="AZ">🇦🇿 Azerbaycan</option>
                <option value="AM">🇦🇲 Ermenistan</option>
                <option value="RU">🇷🇺 Rusya</option>
                <option value="UA">🇺🇦 Ukrayna</option>
                <option value="PL">🇵🇱 Polonya</option>
                <option value="DE">🇩🇪 Almanya</option>
                <option value="FR">🇫🇷 Fransa</option>
                <option value="GB">🇬🇧 İngiltere</option>
                <option value="US">🇺🇸 ABD</option>
              </select>
            </div>
            <div>
              <label className={lbl}>Altyazı / Kısa Tanım</label>
              <input type="text" value={subtitle} onChange={e => setSubtitle(e.target.value)} placeholder="Gürcü milletinin manevi sembolü..." className={inp} />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className={lbl}>Motto (Orijinal Dil)</label>
              <input type="text" value={motto} onChange={e => setMotto(e.target.value)} placeholder="მამული, ენა, სარწმუნოება" className={inp} />
            </div>
            <div>
              <label className={lbl}>Motto Çevirisi</label>
              <input type="text" value={mottoTr} onChange={e => setMottoTr(e.target.value)} placeholder="Vatan, Dil, İnanç" className={inp} />
            </div>
          </div>

          <div>
            <label className={lbl}>Öne Çıkan Alıntı</label>
            <textarea value={quote} onChange={e => setQuote(e.target.value)} rows={2} placeholder="Bu kişiden ünlü bir söz..." className={`${inp} resize-none`} />
          </div>

          <div>
            <label className={lbl}>Doğrulanmış Profil Notu <span className="font-normal normal-case text-slate-400">(boş = standart metin)</span></label>
            <input type="text" value={verifiedNote} onChange={e => setVerifiedNote(e.target.value)} placeholder="Bu profil arşiv kaynakları esas alınarak hazırlanmıştır." className={inp} />
          </div>

          <div>
            <label className={lbl}>Bugüne Uzanan Miras <span className="font-normal normal-case text-slate-400">(sayfa sonunda gösterilir)</span></label>
            <textarea value={legacy} onChange={e => setLegacy(e.target.value)} rows={4} placeholder="Bu kişinin değerleri bugün nasıl yaşıyor..." className={`${inp} resize-none`} />
          </div>
        </>
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-emerald-700 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50 transition-colors"
        >
          {saving ? 'Kaydediliyor...' : 'Kaydet'}
        </button>
        {saved && <span className="text-xs font-medium text-emerald-600">✓ Kaydedildi</span>}
      </div>
    </form>
  )
}
