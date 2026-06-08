import { requireAdmin } from '@/lib/admin/auth'
import { createServiceClient } from '@/lib/supabase/server'
import Link from 'next/link'
import InboxClient from './_InboxClient'

type Props = {
  searchParams: Promise<{ tab?: string; inbox?: string }>
}

export default async function InboxPage({ searchParams }: Props) {
  await requireAdmin()
  const supabase = await createServiceClient()

  const { tab = 'gelenler', inbox = 'all' } = await searchParams

  // Gelenler sorgusu
  let gelenlerQuery = supabase
    .from('inbound_emails')
    .select('id, inbox, from_email, from_name, subject, body_text, body_html, received_at, status, replied_at, reply_subject, reply_body_html, is_flagged')
    .order('received_at', { ascending: false })
    .limit(150)

  if (inbox === 'archived') {
    gelenlerQuery = gelenlerQuery.eq('status', 'archived')
  } else if (inbox !== 'all') {
    gelenlerQuery = gelenlerQuery.eq('inbox', inbox).neq('status', 'archived')
  } else {
    gelenlerQuery = gelenlerQuery.neq('status', 'archived')
  }

  // Gidenler (yanıtlanan mailler)
  const gidenlerQuery = supabase
    .from('inbound_emails')
    .select('id, inbox, from_email, from_name, subject, reply_subject, reply_body_html, replied_at, received_at, is_flagged')
    .not('replied_at', 'is', null)
    .order('replied_at', { ascending: false })
    .limit(100)

  // Önemliler (bayraklı)
  const onemliQuery = supabase
    .from('inbound_emails')
    .select('id, inbox, from_email, from_name, subject, body_text, body_html, received_at, status, replied_at, reply_subject, reply_body_html, is_flagged')
    .eq('is_flagged', true)
    .order('received_at', { ascending: false })
    .limit(100)

  // Cevap bekleyenler
  const bekleyenlerQuery = supabase
    .from('inbound_emails')
    .select('id, inbox, from_email, from_name, subject, body_text, body_html, received_at, status, replied_at, reply_subject, reply_body_html, is_flagged')
    .is('replied_at', null)
    .neq('status', 'archived')
    .order('received_at', { ascending: false })
    .limit(100)

  const [
    { data: gelenler },
    { data: gidenler },
    { data: onemli },
    { data: bekleyenler },
    { data: counts },
  ] = await Promise.all([
    gelenlerQuery,
    gidenlerQuery,
    onemliQuery,
    bekleyenlerQuery,
    supabase.from('inbound_emails').select('inbox, status, replied_at, is_flagged').neq('status', 'archived'),
  ])

  const allEmails = counts ?? []
  const unreadTotal = allEmails.filter((e) => e.status === 'unread').length
  const unreadByInbox = allEmails.reduce<Record<string, number>>((acc, r) => {
    if (r.status === 'unread') acc[r.inbox] = (acc[r.inbox] ?? 0) + 1
    return acc
  }, {})
  const pendingCount = allEmails.filter((e) => !e.replied_at).length
  const flaggedCount = allEmails.filter((e) => e.is_flagged).length

  const MAIN_TABS = [
    { key: 'gelenler', label: 'Gelenler', count: unreadTotal },
    { key: 'gidenler', label: 'Gönderilenler', count: 0 },
    { key: 'onemli', label: 'Önemliler', count: flaggedCount },
    { key: 'bekleyenler', label: 'Cevap Bekleyenler', count: pendingCount },
  ]

  const INBOX_TABS = [
    { key: 'all', label: 'Tümü' },
    { key: 'support', label: 'Destek' },
    { key: 'partner', label: 'İş Birliği' },
    { key: 'privacy', label: 'Gizlilik' },
    { key: 'archived', label: 'Arşiv' },
  ]

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Mail Yönetimi</h1>
          <p className="text-slate-500 text-sm mt-1">
            support@ · partner@ · privacy@theeternalmemory.com
          </p>
        </div>
        <Link href="/admin/email" className="text-xs text-slate-400 hover:text-slate-600 underline underline-offset-2">
          Webhook Ayarları →
        </Link>
      </div>

      {/* Ana sekmeler */}
      <div className="flex gap-1 mb-4 border-b border-slate-200">
        {MAIN_TABS.map((t) => (
          <Link
            key={t.key}
            href={`/admin/inbox?tab=${t.key}&inbox=all`}
            className={`relative px-4 py-2.5 text-sm font-medium transition-colors flex items-center gap-2 border-b-2 -mb-px ${
              tab === t.key
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {t.label}
            {t.count > 0 && (
              <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full leading-none ${
                tab === t.key ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-600'
              }`}>
                {t.count}
              </span>
            )}
          </Link>
        ))}
      </div>

      {/* Alt sekmeler — sadece Gelenler'de */}
      {tab === 'gelenler' && (
        <div className="flex gap-1 mb-5 bg-slate-100 p-1 rounded-xl w-fit">
          {INBOX_TABS.map((t) => {
            const unread = t.key === 'all'
              ? unreadTotal
              : t.key === 'archived' ? 0 : (unreadByInbox[t.key] ?? 0)
            return (
              <Link
                key={t.key}
                href={`/admin/inbox?tab=gelenler&inbox=${t.key}`}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                  inbox === t.key
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {t.label}
                {unread > 0 && (
                  <span className="bg-blue-500 text-white text-[10px] font-bold px-1 py-0.5 rounded-full leading-none">
                    {unread}
                  </span>
                )}
              </Link>
            )
          })}
        </div>
      )}

      <InboxClient
        tab={tab}
        emails={gelenler ?? []}
        gidenler={gidenler ?? []}
        onemli={onemli ?? []}
        bekleyenler={bekleyenler ?? []}
      />
    </div>
  )
}
