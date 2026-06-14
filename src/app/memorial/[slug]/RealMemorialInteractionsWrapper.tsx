'use client'

import { LangProvider } from '@/i18n/context'
import MemorialInteractions, { type CustomAction } from './MemorialInteractions'
import type { Lang } from '@/i18n'

interface GuestbookEntry {
  id: string
  author_name: string
  relation: string | null
  message: string
  created_at: string
  react_heart: number
  react_pray: number
  react_smile: number
  react_cry: number
  react_dove: number
}

interface Props {
  entries: GuestbookEntry[]
  vaultId: string
  initialCounts: { candle: number; flower: number; prayer: number }
  siteKey: string
  customActions?: CustomAction[]
  isNotable?: boolean
  serverLang?: Lang
}

export default function RealMemorialInteractionsWrapper({ entries, vaultId, initialCounts, siteKey, customActions = [], isNotable = false, serverLang = 'tr' }: Props) {
  const condolences = entries.map((e) => ({
    id: e.id,
    name: e.author_name,
    date: new Date(e.created_at).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }),
    relation: e.relation ?? '',
    text: e.message,
    reactions: {
      heart: e.react_heart ?? 0,
      pray:  e.react_pray  ?? 0,
      smile: e.react_smile ?? 0,
      cry:   e.react_cry   ?? 0,
      dove:  e.react_dove  ?? 0,
    },
  }))

  return (
    <LangProvider serverLang={serverLang}>
      <MemorialInteractions condolences={condolences} vaultId={vaultId} initialCounts={initialCounts} siteKey={siteKey} customActions={customActions} isNotable={isNotable} />
    </LangProvider>
  )
}
