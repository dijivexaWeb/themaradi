'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createAdminMemorial } from '../../actions'
import PartialDateInput from '@/components/PartialDateInput'

export default function CreateMemorialForm() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [birthPrec, setBirthPrec] = useState('year')
  const [deathDate, setDeathDate] = useState('')
  const [deathPrec, setDeathPrec] = useState('year')
  const [tagline, setTagline] = useState('')
  const [isNotable, setIsNotable] = useState(false)
  const [nationality, setNationality] = useState('')
  const [sortOrder, setSortOrder] = useState('')

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !password || !displayName) {
      setError('E-posta, şifre ve ad soyad zorunludur.')
      return
    }
    setSaving(true)
    setError('')

    const result = await createAdminMemorial({
      email,
      password,
      display_name: displayName,
      birth_date: birthDate || null,
      birth_date_precision: birthPrec,
      death_date: deathDate || null,
      death_date_precision: deathPrec,
      tagline: tagline || null,
      is_notable: isNotable,
      nationality: nationality || null,
      notable_sort_order: sortOrder ? parseInt(sortOrder, 10) : null,
    })

    setSaving(false)
    if (result.success && result.vaultId) {
      router.push(`/admin/memorials/${result.vaultId}`)
    } else {
      setError(result.error ?? 'Bir hata oluştu.')
    }
  }

  const inp = 'w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500'
  const lbl = 'mb-1 block text-xs font-semibold text-slate-500 uppercase tracking-wide'

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">

      {/* Hesap */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        <h2 className="font-semibold text-slate-800">🔐 Hesap Bilgileri</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={lbl}>E-posta *</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="ornek@theeternalmemory.com" className={inp} />
          </div>
          <div>
            <label className={lbl}>Şifre *</label>
            <input type="text" value={password} onChange={e => setPassword(e.target.value)} required placeholder="Güçlü bir şifre girin" className={inp} />
          </div>
        </div>
        <p className="text-xs text-slate-400">Bu bilgilerle anma-paneline giriş yapılabilir. E-posta doğrulama maili gönderilmez.</p>
      </div>

      {/* Profil */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        <h2 className="font-semibold text-slate-800">👤 Profil Bilgileri</h2>

        <div>
          <label className={lbl}>Ad Soyad *</label>
          <input type="text" value={displayName} onChange={e => setDisplayName(e.target.value)} required placeholder="Ilia Chavchavadze" className={inp} />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={lbl}>Doğum Tarihi</label>
            <PartialDateInput
              name="birth_date_ctrl"
              inputCls={inp}
              onChange={(d, p) => { setBirthDate(d); setBirthPrec(p) }}
            />
          </div>
          <div>
            <label className={lbl}>Ölüm Tarihi</label>
            <PartialDateInput
              name="death_date_ctrl"
              inputCls={inp}
              onChange={(d, p) => { setDeathDate(d); setDeathPrec(p) }}
            />
          </div>
        </div>

        <div>
          <label className={lbl}>Kısa Anı Sözü</label>
          <input type="text" value={tagline} onChange={e => setTagline(e.target.value)} placeholder="Kalbimizde yaşıyor..." maxLength={200} className={inp} />
        </div>
      </div>

      {/* Ulusal Miras */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-slate-800">🏛 Ulusal Miras Profili</h2>
          <button
            type="button"
            onClick={() => setIsNotable(v => !v)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isNotable ? 'bg-emerald-600' : 'bg-slate-300'}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${isNotable ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>

        {isNotable && (
          <div className="grid sm:grid-cols-2 gap-4">
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
              <label className={lbl}>Landing Sıra No</label>
              <input type="number" min={1} value={sortOrder} onChange={e => setSortOrder(e.target.value)} placeholder="1, 2, 3…" className={inp} />
            </div>
          </div>
        )}

        {isNotable && (
          <p className="text-xs text-slate-400">İtiraz bölümü otomatik gizlenir. Diğer ayrıntılar (motto, biyografi, alıntı) oluşturduktan sonra Ulusal Miras formundan eklenebilir.</p>
        )}
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-emerald-700 px-6 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50 transition-colors"
        >
          {saving ? 'Oluşturuluyor...' : '✓ Profili Oluştur'}
        </button>
        <a href="/admin/memorials" className="text-sm text-slate-500 hover:text-slate-700">İptal</a>
      </div>
    </form>
  )
}
