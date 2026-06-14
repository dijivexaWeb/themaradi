'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createAdminMemorial } from '../../actions'

const MONTHS = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
]

function composeDate(
  year: string, month: string, day: string
): { date: string | null; precision: string } {
  const y = parseInt(year, 10)
  if (!y) return { date: null, precision: 'year' }
  const m = parseInt(month, 10) || 0
  const d = parseInt(day, 10) || 0
  const mm = m ? String(m).padStart(2, '0') : '01'
  const dd = d ? String(d).padStart(2, '0') : '01'
  const date = `${String(y).padStart(4, '0')}-${mm}-${dd}`
  const precision = d && m ? 'day' : m ? 'month' : 'year'
  return { date, precision }
}

function DateFields({
  label,
  year, setYear,
  month, setMonth,
  day, setDay,
  inp,
}: {
  label: string
  year: string; setYear: (v: string) => void
  month: string; setMonth: (v: string) => void
  day: string; setDay: (v: string) => void
  inp: string
}) {
  const lbl = 'mb-1 block text-[10px] font-semibold text-slate-500 uppercase tracking-wide'
  return (
    <div>
      <p className="mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</p>
      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className={lbl}>Yıl</label>
          <input
            type="number" min={1800} max={2099}
            placeholder="örn. 1937"
            value={year}
            onChange={e => {
              setYear(e.target.value)
              if (!e.target.value) { setMonth(''); setDay('') }
            }}
            className={inp}
          />
        </div>
        <div>
          <label className={lbl}>Ay (opsiyonel)</label>
          <select
            value={month}
            disabled={!year}
            onChange={e => { setMonth(e.target.value); if (!e.target.value) setDay('') }}
            className={inp}
          >
            <option value="">—</option>
            {MONTHS.map((m, i) => (
              <option key={i + 1} value={String(i + 1)}>{m}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={lbl}>Gün (opsiyonel)</label>
          <input
            type="number" min={1} max={31}
            placeholder="—"
            value={day}
            disabled={!month}
            onChange={e => setDay(e.target.value)}
            className={inp}
          />
        </div>
      </div>
    </div>
  )
}

export default function CreateMemorialForm() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')

  const [birthYear, setBirthYear] = useState('')
  const [birthMonth, setBirthMonth] = useState('')
  const [birthDay, setBirthDay] = useState('')

  const [deathYear, setDeathYear] = useState('')
  const [deathMonth, setDeathMonth] = useState('')
  const [deathDay, setDeathDay] = useState('')

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

    const birth = composeDate(birthYear, birthMonth, birthDay)
    const death = composeDate(deathYear, deathMonth, deathDay)

    const result = await createAdminMemorial({
      email,
      password,
      display_name: displayName,
      birth_date: birth.date,
      birth_date_precision: birth.precision,
      death_date: death.date,
      death_date_precision: death.precision,
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

  const inp = 'w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 disabled:opacity-40'
  const lbl = 'mb-1 block text-xs font-semibold text-slate-500 uppercase tracking-wide'

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">

      {/* Hesap */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        <h2 className="font-semibold text-slate-800">Hesap Bilgileri</h2>
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
        <h2 className="font-semibold text-slate-800">Profil Bilgileri</h2>

        <div>
          <label className={lbl}>Ad Soyad *</label>
          <input type="text" value={displayName} onChange={e => setDisplayName(e.target.value)} required placeholder="Ilia Chavchavadze" className={inp} />
        </div>

        <DateFields
          label="Doğum Tarihi"
          year={birthYear} setYear={setBirthYear}
          month={birthMonth} setMonth={setBirthMonth}
          day={birthDay} setDay={setBirthDay}
          inp={inp}
        />

        <DateFields
          label="Vefat Tarihi"
          year={deathYear} setYear={setDeathYear}
          month={deathMonth} setMonth={setDeathMonth}
          day={deathDay} setDay={setDeathDay}
          inp={inp}
        />

        <div>
          <label className={lbl}>Kısa Anı Sözü</label>
          <input type="text" value={tagline} onChange={e => setTagline(e.target.value)} placeholder="Kalbimizde yaşıyor..." maxLength={200} className={inp} />
        </div>
      </div>

      {/* Ulusal Miras */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-slate-800">Ulusal Miras Profili</h2>
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
                <option value="GE">Gürcistan</option>
                <option value="TR">Türkiye</option>
                <option value="AZ">Azerbaycan</option>
                <option value="AM">Ermenistan</option>
                <option value="RU">Rusya</option>
                <option value="UA">Ukrayna</option>
                <option value="PL">Polonya</option>
                <option value="DE">Almanya</option>
                <option value="FR">Fransa</option>
                <option value="GB">İngiltere</option>
                <option value="US">ABD</option>
              </select>
            </div>
            <div>
              <label className={lbl}>Landing Sıra No</label>
              <input type="number" min={1} value={sortOrder} onChange={e => setSortOrder(e.target.value)} placeholder="1, 2, 3…" className={inp} />
            </div>
          </div>
        )}

        {isNotable && (
          <p className="text-xs text-slate-400">İtiraz bölümü otomatik gizlenir. Diğer ayrıntılar oluşturduktan sonra düzenlenebilir.</p>
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
          {saving ? 'Oluşturuluyor...' : 'Profili Oluştur'}
        </button>
        <a href="/admin/memorials" className="text-sm text-slate-500 hover:text-slate-700">İptal</a>
      </div>
    </form>
  )
}
