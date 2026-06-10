'use client'

import { useLang } from '@/i18n/context'
import { langs } from '@/i18n'

interface Props {
  className?: string
}

export default function LangSwitcherDashboard({ className }: Props) {
  const { lang, setLang } = useLang()

  return (
    <div className={className ?? "flex gap-1 px-2 py-2 border-t border-[#e5dccb] mt-3 justify-center items-center"}>
      {langs.map((item) => (
        <button
          key={item.code}
          type="button"
          onClick={() => {
            setLang(item.code)
            // Force a reload so that Next.js Server Components read the new tm_lang cookie
            window.location.reload()
          }}
          title={item.label}
          className={`text-[10px] border px-2 py-1 rounded-lg transition-colors flex items-center gap-1 ${
            lang === item.code
              ? 'border-[#174f35] bg-[#174f35]/15 text-[#174f35] font-bold shadow-sm'
              : 'border-[#e5dccb] bg-white text-[#69766f] hover:text-[#22362e] hover:bg-[#f5efdf]'
          }`}
        >
          <span>{item.flag}</span>
          <span className="hidden sm:inline uppercase">{item.code}</span>
        </button>
      ))}
    </div>
  )
}
