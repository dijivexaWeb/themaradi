'use client'

import { useState } from 'react'
import { saveMemorialThemeAction } from '../actions'

const THEMES = [
  {
    key: 'classic_emerald',
    label: 'Klasik Zümrüt',
    desc: 'Derin yeşil tonlar, altın aksanlar. Klasik ve saygın.',
    bg: 'bg-[#fbf8f1]',
    accent: 'bg-[#174f35]',
    gold: 'bg-[#c7a76f]',
    borderPreview: 'border-[#174f35]',
  },
  {
    key: 'warm_sunset',
    label: 'Sıcak Gün Batımı',
    desc: 'Turuncu ve amber tonlar. Sıcak, samimi bir his.',
    bg: 'bg-[#fff8f0]',
    accent: 'bg-[#c05a1f]',
    gold: 'bg-[#e8a04a]',
    borderPreview: 'border-[#c05a1f]',
  },
  {
    key: 'midnight_silence',
    label: 'Gece Sessizliği',
    desc: 'Koyu lacivert ve gümüş. Derin, huzurlu bir atmosfer.',
    bg: 'bg-[#0d1a2d]',
    accent: 'bg-[#1e3a5f]',
    gold: 'bg-[#8ba8c8]',
    borderPreview: 'border-[#1e3a5f]',
  },
  {
    key: 'pure_light',
    label: 'Saf Işık',
    desc: 'Beyaz ve açık gri tonlar. Temiz, minimalist.',
    bg: 'bg-white',
    accent: 'bg-[#374151]',
    gold: 'bg-[#9ca3af]',
    borderPreview: 'border-[#374151]',
  },
  {
    key: 'rustic_autumn',
    label: 'Sonbahar Kırmızısı',
    desc: 'Bordo ve toprak tonlar. Nostaljik, derin.',
    bg: 'bg-[#fdf6f0]',
    accent: 'bg-[#7c2d12]',
    gold: 'bg-[#b45309]',
    borderPreview: 'border-[#7c2d12]',
  },
]

interface Props {
  vaultId: string
  initialTheme: string
  isLocked: boolean
}

export default function ThemeSelector({ vaultId, initialTheme, isLocked }: Props) {
  const [selected, setSelected] = useState(initialTheme)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const saveAction = saveMemorialThemeAction.bind(null, vaultId)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (isLocked) return
    setSaving(true)
    const fd = new FormData()
    fd.append('theme', selected)
    const result = await saveAction(fd)
    setSaving(false)
    if (result?.success) {
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-3">
        {THEMES.map(theme => {
          const isActive = selected === theme.key
          return (
            <button
              key={theme.key}
              type="button"
              disabled={isLocked}
              onClick={() => setSelected(theme.key)}
              className={`flex w-full cursor-pointer items-start gap-4 rounded-2xl border-2 p-5 text-left transition-all hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60 ${
                isActive
                  ? 'border-[#174f35] bg-[#f0faf4] shadow-sm'
                  : 'border-[#e5dccb] bg-white hover:border-[#174f35]/30'
              }`}
            >
              {/* Renk önizlemesi */}
              <div className={`relative flex h-14 w-20 shrink-0 overflow-hidden rounded-xl border ${theme.borderPreview}`}>
                <div className={`h-full w-full ${theme.bg}`} />
                <div className={`absolute bottom-0 left-0 right-0 h-5 ${theme.accent} opacity-90`} />
                <div className={`absolute right-1.5 top-1.5 h-3 w-3 rounded-full ${theme.gold}`} />
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-[#1f2d27]">{theme.label}</span>
                  {isActive && (
                    <span className="rounded-full bg-[#174f35] px-2 py-0.5 text-[10px] font-bold text-white">
                      Seçili
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-[#788177]">{theme.desc}</p>
              </div>

              {isActive && (
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#174f35]">
                  <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </button>
          )
        })}
      </div>

      <div className="mt-6 flex items-center gap-3">
        <button
          type="submit"
          disabled={isLocked || saving}
          className="rounded-xl bg-[#174f35] px-8 py-3 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(23,79,53,0.18)] transition-colors hover:bg-[#123f2b] disabled:opacity-40"
        >
          {saving ? 'Kaydediliyor...' : 'Temayı Kaydet'}
        </button>
        {saved && (
          <span className="flex items-center gap-1.5 text-sm font-medium text-[#174f35]">
            ✓ Tema kaydedildi
          </span>
        )}
      </div>
    </form>
  )
}
