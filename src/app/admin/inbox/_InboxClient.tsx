'use client'

import { useState, useTransition, useOptimistic } from 'react'
import { markEmailStatusAction, sendInboxReplyAction, toggleFlagAction } from './actions'

export type InboxEmail = {
  id: string
  inbox: string
  from_email: string
  from_name: string | null
  subject: string | null
  body_text: string | null
  body_html: string | null
  received_at: string
  status: string
  replied_at: string | null
  reply_subject: string | null
  reply_body_html: string | null
  is_flagged: boolean
}

type SentEmail = {
  id: string
  inbox: string
  from_email: string
  from_name: string | null
  subject: string | null
  reply_subject: string | null
  reply_body_html: string | null
  replied_at: string | null
  received_at: string
  is_flagged: boolean
}

const INBOX_META: Record<string, { label: string; color: string; bg: string }> = {
  support: { label: 'Destek', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
  partner: { label: 'İş Birliği', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
  privacy: { label: 'Gizlilik', color: 'text-purple-700', bg: 'bg-purple-50 border-purple-200' },
  other: { label: 'Diğer', color: 'text-slate-600', bg: 'bg-slate-50 border-slate-200' },
}

const TEMPLATES: Record<string, { label: string; subject: string; body: string }> = {
  general: {
    label: 'Genel Yanıt',
    subject: 'Re: {{subject}}',
    body: `<p>Merhaba,</p>
<p>Mesajınız için teşekkür ederiz. En kısa sürede size geri dönüş yapacağız.</p>
<p>Saygılarımızla,<br/>The Eternal Memory Ekibi</p>`,
  },
  partner: {
    label: 'İş Birliği',
    subject: 'Re: {{subject}}',
    body: `<p>Merhaba,</p>
<p>İş birliği teklifiniz için teşekkür ederiz. Ekibimiz değerlendirmenizi inceledi ve detayları görüşmek üzere sizinle iletişime geçmek istiyoruz.</p>
<p>Aşağıdaki günlerde uygun musunuz?</p>
<ul><li>...</li></ul>
<p>Saygılarımızla,<br/>The Eternal Memory Ekibi</p>`,
  },
  privacy: {
    label: 'Gizlilik Talebi',
    subject: 'Re: {{subject}} — Kişisel Veri Talebi',
    body: `<p>Merhaba,</p>
<p>GDPR / KVKK kapsamındaki kişisel veri talebinizi aldık. Talebinizi 30 gün içinde sonuçlandıracağız.</p>
<p>İşlem sürecinde kimliğinizi doğrulamamız gerekebilir. Bu durumda sizinle iletişime geçeceğiz.</p>
<p>Saygılarımızla,<br/>The Eternal Memory Gizlilik Ekibi</p>`,
  },
  support: {
    label: 'Teknik Destek',
    subject: 'Re: {{subject}} — Destek Talebi Alındı',
    body: `<p>Merhaba,</p>
<p>Destek talebinizi aldık. Teknik ekibimiz en kısa sürede sorununuzu inceleyip size dönüş yapacaktır.</p>
<p>Saygılarımızla,<br/>The Eternal Memory Destek Ekibi</p>`,
  },
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('tr-TR', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  })
}

function InboxBadge({ inbox }: { inbox: string }) {
  const m = INBOX_META[inbox] ?? INBOX_META.other
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium shrink-0 ${m.bg} ${m.color}`}>
      {m.label}
    </span>
  )
}

function FlagButton({ id, flagged }: { id: string; flagged: boolean }) {
  const [optimisticFlagged, setOptimisticFlagged] = useOptimistic(flagged)
  const [, startTransition] = useTransition()

  return (
    <button
      onClick={(e) => {
        e.stopPropagation()
        startTransition(async () => {
          setOptimisticFlagged(!optimisticFlagged)
          await toggleFlagAction(id, optimisticFlagged)
        })
      }}
      title={optimisticFlagged ? 'Bayrağı kaldır' : 'Önemli olarak işaretle'}
      className={`shrink-0 transition-colors p-1 rounded ${
        optimisticFlagged ? 'text-amber-400 hover:text-amber-300' : 'text-slate-300 hover:text-amber-400'
      }`}
    >
      <svg className="w-4 h-4" fill={optimisticFlagged ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v18M3 6l9-3 9 3v9l-9-3-9 3V6z" />
      </svg>
    </button>
  )
}

function ReplyForm({ email, onDone }: { email: InboxEmail; onDone: () => void }) {
  const [isPending, startTransition] = useTransition()
  const [result, setResult] = useState<{ error?: string; success?: boolean } | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState('general')
  const [body, setBody] = useState(TEMPLATES.general.body)
  const [subject, setSubject] = useState(
    TEMPLATES.general.subject.replace('{{subject}}', email.subject ?? '')
  )

  function applyTemplate(key: string) {
    setSelectedTemplate(key)
    const t = TEMPLATES[key]
    setBody(t.body)
    setSubject(t.subject.replace('{{subject}}', email.subject ?? ''))
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setResult(null)
    const fd = new FormData(e.currentTarget)
    fd.set('body', body)
    startTransition(async () => {
      const r = await sendInboxReplyAction(email.id, fd)
      setResult(r)
      if (r.success) setTimeout(onDone, 1000)
    })
  }

  const inp = 'w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-slate-400'

  return (
    <div className="mt-4 border-t border-slate-100 pt-4">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Yanıt Yaz</p>
      <div className="flex flex-wrap gap-2 mb-4">
        {Object.entries(TEMPLATES).map(([key, t]) => (
          <button
            key={key}
            type="button"
            onClick={() => applyTemplate(key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              selectedTemplate === key
                ? 'bg-slate-800 text-white border-slate-800'
                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input type="hidden" name="to_email" value={email.from_email} />
        <input type="hidden" name="from_inbox" value={email.inbox} />
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Kime</label>
            <input readOnly value={email.from_email} className={`${inp} bg-slate-50 cursor-default`} />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Kimden</label>
            <input readOnly value={`${email.inbox}@theeternalmemory.com`} className={`${inp} bg-slate-50 cursor-default`} />
          </div>
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1">Konu</label>
          <input type="text" name="subject" value={subject} onChange={(e) => setSubject(e.target.value)} required className={inp} />
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1">İçerik (HTML)</label>
          <textarea value={body} onChange={(e) => setBody(e.target.value)} required rows={9} className={`${inp} font-mono text-xs leading-relaxed resize-y`} />
        </div>
        <details>
          <summary className="text-xs text-slate-400 cursor-pointer hover:text-slate-600 list-none">Önizleme ▼</summary>
          <div className="mt-2 rounded-xl border border-slate-200 bg-white p-4 text-sm prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: body }} />
        </details>
        {result?.error && (
          <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{result.error}</p>
        )}
        {result?.success && (
          <p className="text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">Yanıt gönderildi!</p>
        )}
        <div className="flex gap-3">
          <button type="submit" disabled={isPending}
            className="bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors">
            {isPending ? 'Gönderiliyor...' : 'Gönder →'}
          </button>
          <button type="button" onClick={onDone} className="text-sm text-slate-400 hover:text-slate-600 px-3 py-2">Vazgeç</button>
        </div>
      </form>
    </div>
  )
}

function EmailCard({ email }: { email: InboxEmail }) {
  const [replying, setReplying] = useState(false)
  const [, startTransition] = useTransition()

  function mark(status: 'read' | 'archived') {
    startTransition(async () => { await markEmailStatusAction(email.id, status) })
  }

  return (
    <details className={`bg-white border rounded-xl shadow-sm group ${email.is_flagged ? 'border-amber-200' : 'border-slate-200'}`}>
      <summary
        className={`px-4 py-3.5 cursor-pointer list-none flex items-center gap-3 hover:bg-slate-50 rounded-xl transition-colors ${
          email.status === 'unread' ? 'bg-blue-50/40' : ''
        }`}
        onClick={() => { if (email.status === 'unread') mark('read') }}
      >
        <FlagButton id={email.id} flagged={email.is_flagged} />
        {email.status === 'unread' && <span className="shrink-0 h-2 w-2 rounded-full bg-blue-500" />}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-medium text-slate-800 text-sm truncate">
              {email.from_name ? `${email.from_name}` : email.from_email}
            </p>
            {email.from_name && <p className="text-xs text-slate-400 truncate hidden sm:block">&lt;{email.from_email}&gt;</p>}
          </div>
          <p className="text-xs text-slate-500 truncate">{email.subject ?? '(Konu yok)'}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <InboxBadge inbox={email.inbox} />
          {email.replied_at && <span className="text-xs text-emerald-600 font-medium hidden sm:block">✓ Yanıtlandı</span>}
          <span className="text-xs text-slate-400 hidden sm:block">{formatDate(email.received_at)}</span>
          <span className="text-slate-400 group-open:rotate-180 transition-transform text-xs ml-1">▼</span>
        </div>
      </summary>

      <div className="px-5 pb-5 border-t border-slate-100 pt-4">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
          <span>{email.from_name ? `${email.from_name} <${email.from_email}>` : email.from_email}</span>
          <span>{formatDate(email.received_at)}</span>
        </div>

        {email.body_html ? (
          <div className="text-sm prose prose-sm max-w-none bg-slate-50 rounded-xl p-4 border border-slate-100"
            dangerouslySetInnerHTML={{ __html: email.body_html }} />
        ) : email.body_text ? (
          <pre className="text-sm text-slate-700 whitespace-pre-wrap bg-slate-50 rounded-xl p-4 border border-slate-100 font-sans">
            {email.body_text}
          </pre>
        ) : (
          <p className="text-sm text-slate-400 italic">İçerik yok.</p>
        )}

        {email.replied_at && (
          <div className="mt-3 bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-700">
            <span className="font-medium">Yanıtlandı:</span>{' '}
            {formatDate(email.replied_at)}
            {email.reply_subject && <span className="ml-2 text-emerald-600">— {email.reply_subject}</span>}
          </div>
        )}

        {!replying && (
          <div className="flex items-center gap-3 mt-4">
            <button onClick={() => setReplying(true)}
              className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium px-4 py-2 rounded-lg transition-colors">
              Yanıtla
            </button>
            {email.status !== 'archived' && (
              <button onClick={() => mark('archived')}
                className="text-xs text-slate-400 hover:text-slate-600 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors">
                Arşivle
              </button>
            )}
          </div>
        )}
        {replying && <ReplyForm email={email} onDone={() => setReplying(false)} />}
      </div>
    </details>
  )
}

function SentCard({ email }: { email: SentEmail }) {
  const meta = INBOX_META[email.inbox] ?? INBOX_META.other
  return (
    <details className="bg-white border border-slate-200 rounded-xl shadow-sm group">
      <summary className="px-4 py-3.5 cursor-pointer list-none flex items-center gap-3 hover:bg-slate-50 rounded-xl transition-colors">
        <FlagButton id={email.id} flagged={email.is_flagged} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 shrink-0">Kime:</span>
            <p className="font-medium text-slate-800 text-sm truncate">{email.from_email}</p>
          </div>
          <p className="text-xs text-slate-500 truncate">{email.reply_subject ?? email.subject ?? '(Konu yok)'}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${meta.bg} ${meta.color}`}>{meta.label}</span>
          <span className="text-xs text-emerald-600 font-medium">Gönderildi</span>
          <span className="text-xs text-slate-400 hidden sm:block">
            {email.replied_at ? formatDate(email.replied_at) : '—'}
          </span>
          <span className="text-slate-400 group-open:rotate-180 transition-transform text-xs ml-1">▼</span>
        </div>
      </summary>
      <div className="px-5 pb-5 border-t border-slate-100 pt-4">
        <div className="text-xs text-slate-400 mb-3 flex justify-between">
          <span>Yanıt gönderildi: <span className="text-slate-600">{email.from_email}</span></span>
          {email.replied_at && <span>{formatDate(email.replied_at)}</span>}
        </div>
        {email.reply_body_html ? (
          <div className="text-sm prose prose-sm max-w-none bg-slate-50 rounded-xl p-4 border border-slate-100"
            dangerouslySetInnerHTML={{ __html: email.reply_body_html }} />
        ) : (
          <p className="text-sm text-slate-400 italic">İçerik yok.</p>
        )}
        <details className="mt-3">
          <summary className="text-xs text-slate-400 cursor-pointer hover:text-slate-600 list-none">Orijinal mesajı gör ▼</summary>
          <p className="text-xs text-slate-500 mt-2">
            {email.from_name ? `${email.from_name} <${email.from_email}>` : email.from_email} —{' '}
            {email.subject ?? '(Konu yok)'} — {formatDate(email.received_at)}
          </p>
        </details>
      </div>
    </details>
  )
}

function EmptyState({ message, sub }: { message: string; sub?: string }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
      <p className="text-slate-400 text-sm">{message}</p>
      {sub && <p className="text-slate-300 text-xs mt-2">{sub}</p>}
    </div>
  )
}

type Props = {
  tab: string
  emails: InboxEmail[]
  gidenler: SentEmail[]
  onemli: InboxEmail[]
  bekleyenler: InboxEmail[]
}

export default function InboxClient({ tab, emails, gidenler, onemli, bekleyenler }: Props) {
  if (tab === 'gidenler') {
    return gidenler.length === 0
      ? <EmptyState message="Henüz gönderilmiş yanıt yok." />
      : <div className="space-y-2">{gidenler.map((e) => <SentCard key={e.id} email={e} />)}</div>
  }

  if (tab === 'onemli') {
    return onemli.length === 0
      ? <EmptyState message="Bayraklı mail yok." sub="Mail kartındaki bayrak simgesine tıklayarak önemli olarak işaretleyebilirsiniz." />
      : <div className="space-y-2">{onemli.map((e) => <EmailCard key={e.id} email={e} />)}</div>
  }

  if (tab === 'bekleyenler') {
    return bekleyenler.length === 0
      ? <EmptyState message="Tüm mailler yanıtlanmış." />
      : (
        <div>
          <p className="text-xs text-amber-600 font-medium mb-3">{bekleyenler.length} mail yanıt bekliyor</p>
          <div className="space-y-2">{bekleyenler.map((e) => <EmailCard key={e.id} email={e} />)}</div>
        </div>
      )
  }

  // Gelenler
  const unread = emails.filter((e) => e.status === 'unread').length
  return emails.length === 0
    ? <EmptyState message="Mesaj yok." sub="Resend webhook kurulumu için Email Ayarları sayfasını kontrol edin." />
    : (
      <div>
        {unread > 0 && <p className="text-xs text-blue-600 font-medium mb-3">{unread} okunmamış</p>}
        <div className="space-y-2">{emails.map((e) => <EmailCard key={e.id} email={e} />)}</div>
      </div>
    )
}
