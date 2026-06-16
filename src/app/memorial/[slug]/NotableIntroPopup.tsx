'use client'

import { useEffect, useState } from 'react'
import type { Lang } from '@/i18n'

const CLOSE_LABELS: Record<Lang, string> = {
  tr: 'Devam Et',
  ka: 'გაგრძელება',
  ru: 'Продолжить',
  en: 'Continue',
  hy: 'Շարունակել',
}

const BADGE_LABELS: Record<Lang, string> = {
  tr: 'Ulusal Miras Profili',
  ka: 'ეროვნული მემკვიდრეობის პროფილი',
  ru: 'Профиль Национального Наследия',
  en: 'National Heritage Profile',
  hy: 'Ազգային ժառանգության պրոֆիլ',
}

interface Props {
  slug: string
  introText: string
  displayName: string
  lang: Lang
}

export default function NotableIntroPopup({ slug, introText, displayName, lang }: Props) {
  const [visible, setVisible] = useState(false)
  const [closing, setClosing] = useState(false)

  useEffect(() => {
    const key = `notable_intro_seen_${slug}`
    if (!sessionStorage.getItem(key)) {
      const timer = setTimeout(() => setVisible(true), 300)
      return () => clearTimeout(timer)
    }
  }, [slug])

  function close() {
    setClosing(true)
    setTimeout(() => {
      sessionStorage.setItem(`notable_intro_seen_${slug}`, '1')
      setVisible(false)
    }, 380)
  }

  if (!visible) return null

  return (
    <>
      <style>{`
        @keyframes notableIntroIn {
          0%   { opacity: 0; transform: perspective(900px) rotateX(14deg) scale(0.88) translateY(-28px); }
          55%  { opacity: 1; transform: perspective(900px) rotateX(-2deg) scale(1.02) translateY(5px); }
          100% { opacity: 1; transform: perspective(900px) rotateX(0deg) scale(1) translateY(0); }
        }
        @keyframes notableIntroOut {
          0%   { opacity: 1; transform: scale(1) translateY(0); }
          100% { opacity: 0; transform: scale(0.93) translateY(18px); }
        }
        @keyframes notableGoldPulse {
          0%, 100% { opacity: 0.4; }
          50%       { opacity: 0.9; }
        }
      `}</style>

      <div
        className="fixed inset-0 z-[300] flex items-center justify-center px-4"
        style={{
          backgroundColor: 'rgba(5, 15, 10, 0.82)',
          backdropFilter: 'blur(6px)',
          transition: 'opacity 0.38s ease',
          opacity: closing ? 0 : 1,
        }}
        onClick={close}
      >
        <div
          onClick={e => e.stopPropagation()}
          className="relative mx-auto w-full max-w-md rounded-2xl border border-[#dfbd72]/25 bg-[#081310] px-8 py-9 text-center shadow-[0_32px_80px_rgba(0,0,0,0.7)]"
          style={{
            animation: closing
              ? 'notableIntroOut 0.38s cubic-bezier(0.4,0,1,1) forwards'
              : 'notableIntroIn 0.65s cubic-bezier(0.2,0.8,0.3,1) forwards',
          }}
        >
          {/* Üst dekoratif şerit */}
          <div className="mb-5 flex items-center justify-center gap-3">
            <span className="h-px flex-1 bg-gradient-to-r from-transparent via-[#dfbd72]/50 to-[#dfbd72]/80" />
            <span
              className="text-[#dfbd72] text-2xl"
              style={{ animation: 'notableGoldPulse 2.4s ease-in-out infinite' }}
            >
              🏛
            </span>
            <span className="h-px flex-1 bg-gradient-to-l from-transparent via-[#dfbd72]/50 to-[#dfbd72]/80" />
          </div>

          {/* Badge */}
          <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.22em] text-[#c7a76f]/70">
            {BADGE_LABELS[lang]}
          </p>

          {/* İsim */}
          <h2 className="font-serif text-2xl leading-snug text-[#efe7d8] sm:text-3xl">
            {displayName}
          </h2>

          {/* Altın ayırıcı */}
          <div className="my-6 flex items-center gap-3">
            <span className="h-px flex-1 bg-[#dfbd72]/15" />
            <span className="text-[#dfbd72]/40 text-xs">✦</span>
            <span className="h-px flex-1 bg-[#dfbd72]/15" />
          </div>

          {/* Admin'in yazdığı metin */}
          <p className="text-[15px] leading-[1.85] text-[#cfc3ad]">
            {introText}
          </p>

          {/* Alt ayırıcı */}
          <div className="mt-7 mb-5 h-px bg-[#dfbd72]/15" />

          {/* Devam butonu */}
          <button
            onClick={close}
            className="group inline-flex items-center gap-2 rounded-xl border border-[#dfbd72]/35 bg-[#dfbd72]/8 px-7 py-2.5 text-sm font-semibold text-[#dfbd72] transition-all duration-200 hover:bg-[#dfbd72]/18 hover:border-[#dfbd72]/60"
          >
            {CLOSE_LABELS[lang]}
            <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
          </button>

          {/* Alt köşe dekorasyon */}
          <div className="absolute bottom-3 right-4 text-[10px] text-[#dfbd72]/20 tracking-widest font-serif">
            ✦ ✦ ✦
          </div>
        </div>
      </div>
    </>
  )
}
