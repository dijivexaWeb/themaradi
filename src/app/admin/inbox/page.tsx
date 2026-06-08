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

  // Tüm aktif emailleri çek (thread gruplamak için hepsine ihtiyaç var)
  const { data: allEmails } = await supabase
    .from('inbound_emails')
    .select('id, inbox, from_email, from_name, subject, body_text, body_html, received_at, status, replied_at, reply_subject, reply_body_html, is_flagged, is_following_up, follow_up_note, thread_id')
    .order('received_at', { ascending: false })
    .limit(300)

  const emails = allEmails ?? []

  // Sayaçlar
  const unreadTotal = emails.filter((e) => e.status === 'unread' && e.status !== 'archived').length
  const unreadByInbox = emails.reduce<Record<string, number>>((acc, r) => {
    if (r.status === 'unread') acc[r.inbox] = (acc[r.inbox] ?? 0) + 1
    return acc
  }, {})
  const pendingCount = emails.filter((e) => !e.replied_at && e.status !== 'archived').length
  const flaggedCount = emails.filter((e) => e.is_flagged).length
  const followUpCount = emails.filter((e) => e.is_following_up).length

  const MAIN_TABS = [
    { key: 'gelenler', label: 'Gelenler', count: unreadTotal },
    { key: 'gidenler', label: 'Gönderilenler', count: 0 },
    { key: 'takipte', label: 'Takipte', count: followUpCount },
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
      <div className="flex gap-0.5 mb-4 border-b border-slate-200 overflow-x-auto">
        {MAIN_TABS.map((t) => (
          <Link
            key={t.key}
            href={`/admin/inbox?tab=${t.key}&inbox=all`}
            className={`relative px-4 py-2.5 text-sm font-medium transition-colors flex items-center gap-2 border-b-2 -mb-px whitespace-nowrap ${
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

      {/* Alt sekmeler — sadece Gelenler */}
      {tab === 'gelenler' && (
        <div className="flex gap-1 mb-5 bg-slate-100 p-1 rounded-xl w-fit overflow-x-auto">
          {INBOX_TABS.map((t) => {
            const unread = t.key === 'all' ? unreadTotal
              : t.key === 'archived' ? 0
              : (unreadByInbox[t.key] ?? 0)
            return (
              <Link
                key={t.key}
                href={`/admin/inbox?tab=gelenler&inbox=${t.key}`}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap ${
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
        inboxFilter={inbox}
        allEmails={emails}
      />
    </div>
  )
}
