'use client'

import { saveLang, langs } from '@/i18n'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import type { Lang } from '@/i18n'

export default function LangSwitcher({ currentLang }: { currentLang: Lang }) {
  const router = useRouter()

  useEffect(() => {
    if (document.cookie.includes('googtrans')) {
      document.cookie = 'googtrans=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC'
      document.cookie = 'googtrans=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; domain=.' + window.location.hostname
    }
  }, [])

  function switchLang(code: Lang) {
    if (code === currentLang) return
    saveLang(code)
    router.refresh()
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
