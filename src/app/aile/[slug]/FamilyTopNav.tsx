'use client'

import { saveLang, langs } from '@/i18n'
import { useRouter } from 'next/navigation'
import type { Lang } from '@/i18n'
import BrandLogo from '@/components/BrandLogo'

export default function FamilyTopNav({ currentLang }: { currentLang: Lang }) {
  const router = useRouter()

  function switchLang(code: Lang) {
    if (code === currentLang) return
    saveLang(code)
    router.refresh()
  }

  return (
    <nav
      className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-5 h-14"
      style={{ background: 'linear-gradient(to bottom, rgba(5,10,7,0.92) 0%, rgba(5,10,7,0) 100%)', backdropFilter: 'blur(6px)' }}
    >
      <BrandLogo light className="opacity-60 hover:opacity-90 transition-opacity scale-75 origin-left" />

      <div className="flex items-center gap-0.5">
        {langs.map(l => (
          <button
            key={l.code}
            onClick={() => switchLang(l.code)}
            title={l.label}
            className={`rounded-lg px-2 py-1 text-[10px] font-bold tracking-wider transition-all duration-150
              ${currentLang === l.code
                ? 'bg-white/12 text-white'
                : 'text-white/25 hover:bg-white/8 hover:text-white/55'
              }`}
          >
            {l.flag}
          </button>
        ))}
      </div>
    </nav>
  )
}
