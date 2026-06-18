'use client'

import { useState } from 'react'
import { Share2, Check } from 'lucide-react'
import type { Lang } from '@/i18n'

const LABELS: Record<Lang, { share: string; copied: string; text: string }> = {
  tr: { share: 'Bu mirası paylaş', copied: 'Bağlantı kopyalandı!', text: 'Bu önemli mirası sizinle paylaşıyorum' },
  en: { share: 'Share this heritage', copied: 'Link copied!', text: 'Sharing this important heritage with you' },
  ka: { share: 'გაიზიარე ეს მემკვიდრეობა', copied: 'ბმული დაკოპირდა!', text: 'ვიზიარებ ამ მნიშვნელოვან მემკვიდრეობას' },
  ru: { share: 'Поделиться наследием', copied: 'Ссылка скопирована!', text: 'Делюсь этим важным наследием' },
  hy: { share: 'Կիսվել այս ժառանգությամբ', copied: 'Հղումը պատճենվել է!', text: 'Կիսվում եմ ձեզ հետ այս կարևոր ժառանգությամբ' },
  az: { share: 'Bu irsi paylaş', copied: 'Link kopyalandı!', text: 'Bu mühüm irsi sizinlə paylaşıram' },
  he: { share: 'שתף את המורשת הזו', copied: 'הקישור הועתק!', text: 'משתף איתכם את המורשת החשובה הזו' },
}

export default function NotableShareButton({ displayName, lang }: { displayName: string; lang: Lang }) {
  const labels = LABELS[lang] ?? LABELS.tr
  const [copied, setCopied] = useState(false)

  async function handleShare() {
    const url = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({ title: displayName, text: `${displayName} — ${labels.text}`, url })
        return
      } catch (_) { /* cancelled */ }
    }
    try {
      await navigator.clipboard.writeText(url)
    } catch (_) {
      const el = document.createElement('textarea')
      el.value = url
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    <button
      onClick={handleShare}
      className={`inline-flex items-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-semibold transition-all duration-200 active:scale-95 ${
        copied
          ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-400'
          : 'border-[#dfbd72]/30 bg-[#dfbd72]/10 text-[#dfbd72] hover:bg-[#dfbd72]/20'
      }`}
    >
      {copied
        ? <Check className="h-4 w-4" />
        : <Share2 className="h-4 w-4" />
      }
      {copied ? labels.copied : labels.share}
    </button>
  )
}
