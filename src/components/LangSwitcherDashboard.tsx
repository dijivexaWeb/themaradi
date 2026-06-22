'use client'

import { useState, useRef, useEffect } from 'react'
import { useLang } from '@/i18n/context'
import { langs, type Lang } from '@/i18n'
import { ChevronDown } from 'lucide-react'

interface Props {
  className?: string
}

export default function LangSwitcherDashboard({ className }: Props) {
  const { lang, setLang } = useLang()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const current = langs.find(l => l.code === lang) ?? langs[0]

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const select = (code: Lang) => {
    setLang(code)
    setOpen(false)
    window.location.reload()
  }

  return (
    <div ref={ref} className={`relative ${className ?? ''}`}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1.5 rounded-xl border border-[#e5dccb] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#69766f] hover:bg-[#f5efdf] hover:text-[#22362e] transition-colors"
      >
        <span>{current.flag}</span>
        <span className="uppercase">{current.code}</span>
        <ChevronDown className={`h-3 w-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 z-50 min-w-[130px] rounded-2xl border border-[#e5dccb] bg-white shadow-lg py-1 overflow-hidden">
          {langs.map((item) => (
            <button
              key={item.code}
              type="button"
              onClick={() => select(item.code as Lang)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs transition-colors text-left ${
                lang === item.code
                  ? 'bg-[#174f35]/8 text-[#174f35] font-bold'
                  : 'text-[#4a5e55] hover:bg-[#f5efdf]'
              }`}
            >
              <span className="text-base">{item.flag}</span>
              <span>{item.label}</span>
              {lang === item.code && <span className="ml-auto text-[#174f35]">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
