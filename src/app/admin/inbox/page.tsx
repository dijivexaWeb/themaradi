import { requireAdmin } from '@/lib/admin/auth'
import { createServiceClient } from '@/lib/supabase/server'
import Link from 'next/link'
import InboxClient from './_InboxClient'

const INBOX_TABS = [
  { key: 'all', label: 'Tümü' },
  { key: 'support', label: 'Destek' },
  { key: 'partner', label: 'İş Birliği' },
  { key: 'privacy', label: 'Gizlilik' },
  { key: 'archived', label: 'Arşiv' },
]

type Props = {
  searchParams: Promise<{ inbox?: string }>
}

export default async function InboxPage({ searchParams }: Props) {
  await requireAdmin()
  const supabase = await createServiceClient()

  const { inbox: activeFilter = 'all' } = await searchParams

  let query = supabase
    .from('inbound_emails')
    .select('id, inbox, from_email, from_name, subject, body_text, body_html, received_at, status, replied_at, reply_subject')
    .order('received_at', { ascending: false })
    .limit(100)

  if (activeFilter === 'archived') {
    query = query.eq('status', 'archived')
  } else if (activeFilter !== 'all') {
    query = query.eq('inbox', activeFilter).neq('status', 'archived')
  } else {
    query = query.neq('status', 'archived')
  }

  const { data: emails } = await query

  // Okunmamış sayıları
  const { data: counts } = await supabase
    .from('inbound_emails')
    .select('inbox, status')
    .neq('status', 'archived')

  const unreadByInbox = (counts ?? []).reduce<Record<string, number>>((acc, r) => {
    if (r.status === 'unread') acc[r.inbox] = (acc[r.inbox] ?? 0) + 1
    return acc
  }, {})
  const totalUnread = Object.values(unreadByInbox).reduce((a, b) => a + b, 0)

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gelen Kutusu</h1>
          <p className="text-slate-500 text-sm mt-1">
            support@, partner@, privacy@theeternalmemory.com adreslerine gelen mailler
          </p>
        </div>
        <Link
          href="/admin/email"
          className="text-xs text-slate-400 hover:text-slate-600 underline underline-offset-2"
        >
          Webhook Ayarları →
        </Link>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 mb-6 bg-slate-100 p-1 rounded-xl w-fit">
        {INBOX_TABS.map((tab) => {
          const unread = tab.key === 'all' ? totalUnread : unreadByInbox[tab.key] ?? 0
          return (
            <Link
              key={tab.key}
              href={`/admin/inbox?inbox=${tab.key}`}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                activeFilter === tab.key
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.label}
              {unread > 0 && tab.key !== 'archived' && (
                <span className="bg-blue-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full leading-none">
                  {unread}
                </span>
              )}
            </Link>
          )
        })}
      </div>

      <InboxClient emails={emails ?? []} activeFilter={activeFilter} />
    </div>
  )
}
