'use client'

import { useLang } from '@/i18n/context'

const LOCALE_MAP: Record<string, string> = {
  tr: 'tr-TR', en: 'en-US', ka: 'ka-GE', he: 'he-IL', ru: 'ru-RU', az: 'az-AZ', hy: 'hy-AM',
}

export default function AddedBadge({ date, className }: { date: string | null | undefined; className?: string }) {
  const { t, lang } = useLang()
  if (!date) return null

  const formatted = new Intl.DateTimeFormat(LOCALE_MAP[lang] ?? 'en-US', {
    day: 'numeric', month: 'long', year: 'numeric',
  }).format(new Date(date))

  return (
    <div
      className={className}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        background: 'rgba(10,10,14,.88)', color: '#EDE8DD',
        fontSize: 11, fontWeight: 500, letterSpacing: '.01em',
        padding: '5px 10px', borderRadius: 999,
        fontFamily: 'var(--font-outfit), system-ui, sans-serif',
        whiteSpace: 'nowrap',
      }}
    >
      <span aria-hidden>📅</span>
      {t.addedBadge.label.replace('{date}', formatted)}
    </div>
  )
}
