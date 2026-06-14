'use client'

import { saveLang, langs } from '@/i18n'
import type { Lang } from '@/i18n'

// Google Translate lang codes (same as ours, but let's be explicit)
const GT_LANGS: Record<Lang, string> = { tr: 'tr', ka: 'ka', ru: 'ru', en: 'en' }

function setGoogTrans(lang: Lang) {
  const exp = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toUTCString()
  if (lang === 'tr') {
    // Clear translation — restore original page
    document.cookie = 'googtrans=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC'
    document.cookie = `googtrans=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; domain=.${window.location.hostname}`
  } else {
    const gtLang = GT_LANGS[lang]
    document.cookie = `googtrans=/tr/${gtLang}; path=/; expires=${exp}`
    document.cookie = `googtrans=/tr/${gtLang}; path=/; expires=${exp}; domain=.${window.location.hostname}`
  }
}

export default function LangSwitcher({ currentLang }: { currentLang: Lang }) {
  function switchLang(code: Lang) {
    if (code === currentLang) return
    saveLang(code)       // tm_lang → UI strings
    setGoogTrans(code)   // googtrans → içerik çevirisi
    window.location.reload()
  }

  return (
    <div className="flex items-center gap-0.5">
      {langs.map((l) => (
        <button
          key={l.code}
          onClick={() => switchLang(l.code)}
          title={l.label}
          className={`rounded-lg px-2 py-1 text-[11px] font-bold tracking-wider transition-all duration-150
            ${currentLang === l.code
              ? 'bg-[#174f35] text-white shadow-sm'
              : 'text-[#8a7a64] hover:bg-[#f0ece3] hover:text-[#173d31]'
            }`}
        >
          {l.flag}
        </button>
      ))}
    </div>
  )
}
