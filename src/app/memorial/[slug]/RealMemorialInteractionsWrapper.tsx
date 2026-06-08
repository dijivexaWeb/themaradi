'use client'

import { LangProvider } from '@/i18n/context'
import MemorialInteractions from './MemorialInteractions'

interface GuestbookEntry {
  id: string
  author_name: string
  relation: string | null
  message: string
  created_at: string
}

interface Props {
  entries: GuestbookEntry[]
  vaultId: string
  initialCounts: { candle: number; flower: number; prayer: number }
}

export default function RealMemorialInteractionsWrapper({ entries, vaultId, initialCounts }: Props) {
  const condolences = entries.map((e) => ({
    name: e.author_name,
    date: new Date(e.created_at).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }),
    relation: e.relation ?? '',
    text: e.message,
  }))

  return (
    <LangProvider>
      <MemorialInteractions condolences={condolences} vaultId={vaultId} initialCounts={initialCounts} />
    </LangProvider>
  )
}
