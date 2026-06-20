'use client'

import { useState, useEffect } from 'react'
import { useLang } from '@/i18n/context'

export default function WhatsAppButton() {
  const { lang, t } = useLang()
  const [mounted, setMounted] = useState(false)
  const [showBubble, setShowBubble] = useState(false)
  const [bubbleDismissed, setBubbleDismissed] = useState(false)

  useEffect(() => {
    setMounted(true)

    // Check if the user already dismissed the bubble in this session
    const dismissed = sessionStorage.getItem('tm_wa_bubble_dismissed')
    if (dismissed === 'true') {
      setBubbleDismissed(true)
    }

    // Show bubble after 3 seconds if not dismissed
    const timer = setTimeout(() => {
      if (!dismissed) {
        setShowBubble(true)
      }
    }, 3000)

    // Auto-hide bubble after 10 seconds to keep the UI clean
    const autoHideTimer = setTimeout(() => {
      setShowBubble(false)
    }, 13000)

    return () => {
      clearTimeout(timer)
      clearTimeout(autoHideTimer)
    }
  }, [])

  if (!mounted) return null

  const handleDismissBubble = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setShowBubble(false)
    setBubbleDismissed(true)
    sessionStorage.setItem('tm_wa_bubble_dismissed', 'true')
  }

  // Formatting WhatsApp link: +995 555 511 884 -> 995555511884
  const whatsappUrl = `https://wa.me/995555511884?text=${encodeURIComponent(t.whatsapp.message)}`
  const isRtl = lang === 'he'

  return (
    <div
      className="fixed z-40 flex flex-col items-end"
      style={{
        bottom: '24px',
        right: isRtl ? 'auto' : '24px',
        left: isRtl ? '24px' : 'auto',
      }}
    >
      {/* Speech Bubble Prompt */}
      {showBubble && !bubbleDismissed && (
        <div
          className="relative mb-3 max-w-xs scale-100 rounded-xl border border-[#c7a76f]/50 bg-[#0c1628]/95 px-4 py-2.5 text-xs text-[#fbf8f1] shadow-2xl backdrop-blur-md transition-all duration-500 ease-out"
          style={{
            transformOrigin: isRtl ? 'bottom left' : 'bottom right',
          }}
        >
          {/* Close Button */}
          <button
            onClick={handleDismissBubble}
            className="absolute top-1.5 right-1.5 text-zinc-400 hover:text-zinc-200"
            aria-label="Close message"
          >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>

          {/* Text Content */}
          <p className="pr-4 font-outfit font-light leading-relaxed">
            {t.whatsapp.bubble}
          </p>

          {/* Arrow pointing to button */}
          <div
            className="absolute bottom-[-6px] h-3 w-3 rotate-45 border-r border-b border-[#c7a76f]/50 bg-[#0c1628]/95"
            style={{
              right: isRtl ? 'auto' : '20px',
              left: isRtl ? '20px' : 'auto',
            }}
          />
        </div>
      )}

      {/* Floating Action Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        title={t.whatsapp.tooltip}
        className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-[#128C7E] to-[#25D366] text-white shadow-lg transition-all duration-300 hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:ring-offset-2 focus:ring-offset-[#07070d]"
        aria-label={t.whatsapp.tooltip}
      >
        {/* Pulsing Outer Ring */}
        <span className="absolute -inset-1 animate-ping rounded-full bg-[#25D366]/40 opacity-75 duration-1000" />
        
        {/* Hover Inner Shadow Glow */}
        <span className="absolute inset-0 rounded-full bg-white/0 transition-all duration-300 group-hover:bg-white/10" />

        {/* WhatsApp SVG Icon */}
        <svg
          viewBox="0 0 24 24"
          className="relative h-7 w-7 transition-transform duration-300 group-hover:rotate-6"
          fill="currentColor"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.705 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </a>
    </div>
  )
}
