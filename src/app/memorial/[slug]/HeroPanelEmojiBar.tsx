'use client'

import { useState, useTransition } from 'react'
import { reactToHeroPanelAction } from '@/lib/actions/condolences'

type EntryEmoji = 'heart' | 'pray' | 'smile' | 'cry' | 'dove'

const EMOJIS: { key: EntryEmoji; emoji: string }[] = [
  { key: 'heart', emoji: '❤️' },
  { key: 'pray',  emoji: '🙏' },
  { key: 'smile', emoji: '😊' },
  { key: 'cry',   emoji: '😢' },
  { key: 'dove',  emoji: '🕊️' },
]

interface Props {
  vaultId: string
  panel: 'left' | 'right'
  initialCounts: Record<EntryEmoji, number>
}

export default function HeroPanelEmojiBar({ vaultId, panel, initialCounts }: Props) {
  const lsKey = `hp_${vaultId}_${panel}`

  const [counts, setCounts] = useState<Record<EntryEmoji, number>>(initialCounts)
  const [userReacted, setUserReacted] = useState<Set<EntryEmoji>>(() => {
    if (typeof window === 'undefined') return new Set()
    try {
      const stored = JSON.parse(localStorage.getItem(lsKey) ?? '[]') as EntryEmoji[]
      return new Set(stored)
    } catch (_) { return new Set() }
  })
  const [, startTransition] = useTransition()

  function handleReact(emoji: EntryEmoji) {
    const alreadyReacted = userReacted.has(emoji)
    const delta: 1 | -1 = alreadyReacted ? -1 : 1

    setCounts(prev => ({ ...prev, [emoji]: Math.max(0, prev[emoji] + delta) }))

    const next = new Set(userReacted)
    if (alreadyReacted) { next.delete(emoji) } else { next.add(emoji) }
    setUserReacted(next)

    try {
      localStorage.setItem(lsKey, JSON.stringify([...next]))
    } catch (_) { /* ignore */ }

    startTransition(async () => {
      await reactToHeroPanelAction(vaultId, panel, emoji, delta)
    })
  }

  return (
    <div className="mt-4 flex flex-wrap gap-1.5">
      {EMOJIS.map(({ key, emoji }) => {
        const count = counts[key]
        const active = userReacted.has(key)
        return (
          <button
            key={key}
            type="button"
            onClick={() => handleReact(key)}
            className={`flex items-center gap-1 rounded-full border px-2.5 py-1 text-sm transition-all duration-150 active:scale-90 ${
              active
                ? 'border-[#c7a76f]/60 bg-[#c7a76f]/15 text-[#c7a76f]'
                : 'border-white/15 bg-white/[0.05] text-[#8f9f96] hover:border-white/30 hover:bg-white/[0.1]'
            }`}
          >
            <span>{emoji}</span>
            {count > 0 && <span className="text-[11px] font-medium">{count}</span>}
          </button>
        )
      })}
    </div>
  )
}
