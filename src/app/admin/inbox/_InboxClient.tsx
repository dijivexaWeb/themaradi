'use client'

import { useState, useTransition, useOptimistic } from 'react'
import { markEmailStatusAction, sendInboxReplyAction, toggleFlagAction, setFollowUpAction, deleteEmailAction, deleteAllEmailsAction } from './actions'
import DOMPurify from 'isomorphic-dompurify'

function safeHtml(html: string | null | undefined): string {
  if (!html) return ''
  return DOMPurify.sanitize(html, { USE_PROFILES: { html: true } })
}

export type AttachmentMeta = {
  filename: string
  mimeType: string
  size: number
  url: string
}

export type InboxEmail = {
  id: string
  inbox: string
  from_email: string
  from_name: string | null
  subject: string | null
  body_text: string | null
  body_html: string | null
  attachments: AttachmentMeta[] | null
  received_at: string
  status: string
  replied_at: string | null
  reply_subject: string | null
  reply_body_html: string | null
  is_flagged: boolean
  is_following_up: boolean
  follow_up_note: string | null
  thread_id: string | null
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
    body: `<p>Merhaba,</p>\n<p>Mesajınız için teşekkür ederiz. En kısa sürede size geri dönüş yapacağız.</p>\n<p>Saygılarımızla,<br/>The Eternal Memory Ekibi</p>`,
  },
  partner: {
    label: 'İş Birliği',
    subject: 'Re: {{subject}}',
    body: `<p>Merhaba,</p>\n<p>İş birliği teklifiniz için teşekkür ederiz. Detayları görüşmek üzere sizinle iletişime geçmek istiyoruz.</p>\n<p>Aşağıdaki günlerde uygun musunuz?</p>\n<ul><li>...</li></ul>\n<p>Saygılarımızla,<br/>The Eternal Memory Ekibi</p>`,
  },
  privacy: {
    label: 'Gizlilik Talebi',
    subject: 'Re: {{subject}}',
    body: `<p>Merhaba,</p>\n<p>GDPR / KVKK kapsamındaki kişisel veri talebinizi aldık. Talebinizi 30 gün içinde sonuçlandıracağız.</p>\n<p>Saygılarımızla,<br/>The Eternal Memory Gizlilik Ekibi</p>`,
  },
  support: {
    label: 'Teknik Destek',
    subject: 'Re: {{subject}} — Destek Talebi Alındı',
    body: `<p>Merhaba,</p>\n<p>Destek talebinizi aldık. Teknik ekibimiz en kısa sürede size dönüş yapacaktır.</p>\n<p>Saygılarımızla,<br/>The Eternal Memory Destek Ekibi</p>`,
  },
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('tr-TR', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  })
}

function InboxBadge({ inbox }: { inbox: string }) {
  const m = INBOX_META[inbox] ?? INBOX_META.other
  return <span className={`text-xs px-2 py-0.5 rounded-full border font-medium shrink-0 ${m.bg} ${m.color}`}>{m.label}</span>
}

// ─── Sil butonu ────────────────────────────────────────────────────────────

function DeleteEmailButton({ id, compact = false }: { id: string; compact?: boolean }) {
  const [isPending, start] = useTransition()
  function handle(e: React.MouseEvent) {
    e.stopPropagation()
    if (!confirm('Bu mail kalıcı olarak silinecek. Emin misin?')) return
    start(async () => { await deleteEmailAction(id) })
  }
  return (
    <button
      onClick={handle}
      disabled={isPending}
      title="Maili sil"
      className={`shrink-0 transition-colors rounded disabled:opacity-40 ${
        compact
          ? 'p-1 text-slate-300 hover:text-red-500'
          : 'text-xs text-slate-400 hover:text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors'
      }`}
    >
      {compact ? (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      ) : (
        isPending ? 'Siliniyor...' : 'Sil'
      )}
    </button>
  )
}

// ─── Toplu sil butonu ──────────────────────────────────────────────────────

function BulkDeleteButton({ label, filter, count }: { label: string; filter: 'all' | 'archived' | 'read'; count: number }) {
  const [isPending, start] = useTransition()
  const [result, setResult] = useState('')

  function handle() {
    if (!confirm(`${count} mail kalıcı silinecek. Emin misin?`)) return
    start(async () => {
      const r = await deleteAllEmailsAction(filter)
      if (r.error) setResult(`Hata: ${r.error}`)
      else setResult(`${r.deleted} mail silindi`)
    })
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handle}
        disabled={isPending || count === 0}
        className="flex items-center gap-1.5 text-xs text-red-600 hover:text-red-700 border border-red-200 hover:border-red-400 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-40"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
        {isPending ? 'Siliniyor...' : `${label} (${count})`}
      </button>
      {result && <span className="text-xs text-slate-500">{result}</span>}
    </div>
  )
}

// ─── Bayrak butonu ─────────────────────────────────────────────────────────

function FlagButton({ id, flagged }: { id: string; flagged: boolean }) {
  const [opt, setOpt] = useOptimistic(flagged)
  const [, start] = useTransition()
  return (
    <button
      onClick={(e) => { e.stopPropagation(); start(async () => { setOpt(!opt); await toggleFlagAction(id, opt) }) }}
      title={opt ? 'Bayrağı kaldır' : 'Önemli olarak işaretle'}
      className={`shrink-0 transition-colors p-1 rounded ${opt ? 'text-amber-400 hover:text-amber-300' : 'text-slate-300 hover:text-amber-400'}`}
    >
      <svg className="w-4 h-4" fill={opt ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v18M3 6l9-3 9 3v9l-9-3-9 3V6z" />
      </svg>
    </button>
  )
}

// ─── Takip butonu ──────────────────────────────────────────────────────────

function FollowUpButton({ email }: { email: InboxEmail }) {
  const [open, setOpen] = useState(false)
  const [note, setNote] = useState(email.follow_up_note ?? '')
  const [isPending, start] = useTransition()
  const [opt, setOpt] = useOptimistic(email.is_following_up)

  function save() {
    start(async () => {
      setOpt(true)
      await setFollowUpAction(email.id, true, note)
      setOpen(false)
    })
  }

  function remove() {
    start(async () => {
      setOpt(false)
      await setFollowUpAction(email.id, false)
    })
  }

  if (opt) {
    return (
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 bg-orange-50 border border-orange-200 text-orange-700 text-xs font-medium px-3 py-1.5 rounded-lg">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z" />
          </svg>
          Takipte
          {email.follow_up_note && <span className="text-orange-500 font-normal">— {email.follow_up_note}</span>}
        </span>
        <button onClick={remove} disabled={isPending} className="text-xs text-slate-400 hover:text-red-500 transition-colors">Kaldır</button>
      </div>
    )
  }

  if (open) {
    return (
      <div className="flex items-start gap-2 flex-wrap">
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Not ekle (isteğe bağlı)"
          className="flex-1 min-w-0 rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:outline-none focus:border-orange-400"
          onKeyDown={(e) => e.key === 'Enter' && save()}
          autoFocus
        />
        <button onClick={save} disabled={isPending}
          className="bg-orange-500 hover:bg-orange-400 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50">
          Takibe Al
        </button>
        <button onClick={() => setOpen(false)} className="text-xs text-slate-400 hover:text-slate-600 py-1.5">İptal</button>
      </div>
    )
  }

  return (
    <button onClick={() => setOpen(true)}
      className="text-xs text-slate-500 hover:text-orange-600 border border-slate-200 hover:border-orange-300 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5">
      <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z" />
      </svg>
      Takibe Al
    </button>
  )
}

// ─── Yanıt formu ───────────────────────────────────────────────────────────

function ReplyForm({ email, onDone }: { email: InboxEmail; onDone: () => void }) {
  const [isPending, start] = useTransition()
  const [result, setResult] = useState<{ error?: string; success?: boolean } | null>(null)
  const [sel, setSel] = useState('general')
  const [body, setBody] = useState(TEMPLATES.general.body)
  const [subject, setSubject] = useState(
    TEMPLATES.general.subject.replace('{{subject}}', email.subject ?? '')
  )

  function applyTemplate(key: string) {
    setSel(key)
    setBody(TEMPLATES[key].body)
    setSubject(TEMPLATES[key].subject.replace('{{subject}}', email.subject ?? ''))
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setResult(null)
    const fd = new FormData(e.currentTarget)
    fd.set('body', body)
    start(async () => {
      const r = await sendInboxReplyAction(email.id, fd)
      setResult(r)
      if (r.success) setTimeout(onDone, 900)
    })
  }

  const inp = 'w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-slate-400'

  return (
    <div className="mt-4 border-t border-slate-100 pt-4">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Yanıt Yaz</p>
      <div className="flex flex-wrap gap-2 mb-4">
        {Object.entries(TEMPLATES).map(([key, t]) => (
          <button key={key} type="button" onClick={() => applyTemplate(key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              sel === key ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
            }`}>
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
          <textarea value={body} onChange={(e) => setBody(e.target.value)} required rows={8}
            className={`${inp} font-mono text-xs leading-relaxed resize-y`} />
        </div>
        <details>
          <summary className="text-xs text-slate-400 cursor-pointer hover:text-slate-600 list-none">Önizleme ▼</summary>
          <div className="mt-2 rounded-xl border border-slate-200 bg-white p-4 text-sm prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: safeHtml(body) }} />
        </details>
        {result?.error && <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{result.error}</p>}
        {result?.success && <p className="text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">Yanıt gönderildi!</p>}
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

// ─── Thread konuşma görünümü ───────────────────────────────────────────────

function ThreadView({ thread, allEmails }: { thread: InboxEmail; allEmails: InboxEmail[] }) {
  const [replying, setReplying] = useState(false)
  const [, start] = useTransition()

  const members = allEmails
    .filter((e) => e.thread_id === thread.thread_id)
    .sort((a, b) => new Date(a.received_at).getTime() - new Date(b.received_at).getTime())

  const latest = members[members.length - 1]
  const unreadCount = members.filter((e) => e.status === 'unread').length

  function markAllRead() {
    start(async () => {
      for (const m of members.filter((e) => e.status === 'unread')) {
        await markEmailStatusAction(m.id, 'read')
      }
    })
  }

  return (
    <details className={`bg-white border rounded-xl shadow-sm group ${thread.is_flagged ? 'border-amber-200' : 'border-slate-200'}`}>
      <summary
        className="px-4 py-3.5 cursor-pointer list-none flex items-center gap-3 hover:bg-slate-50 rounded-xl transition-colors"
        onClick={markAllRead}
      >
        <FlagButton id={thread.id} flagged={thread.is_flagged} />
        {unreadCount > 0 && <span className="shrink-0 h-2 w-2 rounded-full bg-blue-500" />}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-medium text-slate-800 text-sm truncate">
              {thread.from_name ?? thread.from_email}
            </p>
            <span className="text-xs text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full shrink-0">
              {members.length} mesaj
            </span>
          </div>
          <p className="text-xs text-slate-500 truncate">{thread.subject ?? '(Konu yok)'}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <InboxBadge inbox={thread.inbox} />
          {unreadCount > 0
            ? <span className="text-xs font-bold text-blue-600">{unreadCount} okunmamış</span>
            : latest.replied_at && <span className="text-xs text-emerald-600 font-medium hidden sm:block">✓ Yanıtlandı</span>
          }
          <span className="text-xs text-slate-400 hidden sm:block">{formatDate(latest.received_at)}</span>
          <span className="text-slate-400 group-open:rotate-180 transition-transform text-xs ml-1">▼</span>
        </div>
      </summary>

      <div className="px-4 pb-5 border-t border-slate-100 pt-4 space-y-0">
        {members.map((msg, i) => (
          <div key={msg.id}>
            {/* Gelen mesaj */}
            <div className="flex gap-3 py-3">
              <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 shrink-0 mt-0.5">
                {(msg.from_name ?? msg.from_email)[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xs font-semibold text-slate-700">{msg.from_name ?? msg.from_email}</span>
                  <span className="text-[10px] text-slate-400">{formatDate(msg.received_at)}</span>
                  {msg.status === 'unread' && <span className="h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0" />}
                </div>
                <div className={`rounded-xl p-3 border ${i === members.length - 1 && !msg.replied_at ? 'bg-white border-slate-200' : 'bg-slate-50 border-slate-100'}`}>
                  {msg.body_html ? (
                    <div className="text-sm prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: safeHtml(msg.body_html) }} />
                  ) : (
                    <pre className="text-sm text-slate-700 whitespace-pre-wrap font-sans">{msg.body_text ?? '(İçerik yok)'}</pre>
                  )}
                </div>
              </div>
            </div>

            {/* Bu mesajın yanıtı (bizden) */}
            {msg.replied_at && msg.reply_body_html && (
              <div className="flex gap-3 py-3 pl-4">
                <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-white shrink-0 mt-0.5">
                  TEM
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs font-semibold text-slate-700">
                      {msg.inbox}@theeternalmemory.com
                    </span>
                    <span className="text-[10px] text-slate-400">{formatDate(msg.replied_at)}</span>
                    <span className="text-[10px] text-emerald-600 font-medium">Gönderildi</span>
                  </div>
                  <div className="rounded-xl p-3 bg-emerald-50/60 border border-emerald-100">
                    <div className="text-sm prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: safeHtml(msg.reply_body_html) }} />
                  </div>
                </div>
              </div>
            )}

            {/* Ayırıcı — son mesaj değilse */}
            {i < members.length - 1 && (
              <div className="ml-10 border-l-2 border-slate-100 h-3" />
            )}
          </div>
        ))}

        {/* Aksiyonlar — en son mesaja göre */}
        <div className="pt-3 border-t border-slate-100 mt-2">
          {!replying ? (
            <div className="flex items-center gap-3 flex-wrap">
              <button onClick={() => setReplying(true)}
                className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium px-4 py-2 rounded-lg transition-colors">
                Yanıtla
              </button>
              <FollowUpButton email={latest} />
              <DeleteEmailButton id={thread.id} />
            </div>
          ) : (
            <ReplyForm email={latest} onDone={() => setReplying(false)} />
          )}
        </div>
      </div>
    </details>
  )
}

// ─── Tekil email kartı ─────────────────────────────────────────────────────

function EmailCard({ email }: { email: InboxEmail }) {
  const [replying, setReplying] = useState(false)
  const [, start] = useTransition()

  function mark(status: 'read' | 'archived') {
    start(async () => { await markEmailStatusAction(email.id, status) })
  }

  return (
    <details className={`bg-white border rounded-xl shadow-sm group ${email.is_flagged ? 'border-amber-200' : email.is_following_up ? 'border-orange-200' : 'border-slate-200'}`}>
      <summary
        className={`px-4 py-3.5 cursor-pointer list-none flex items-center gap-3 hover:bg-slate-50 rounded-xl transition-colors ${email.status === 'unread' ? 'bg-blue-50/40' : ''}`}
        onClick={() => { if (email.status === 'unread') mark('read') }}
      >
        <FlagButton id={email.id} flagged={email.is_flagged} />
        {email.status === 'unread' && <span className="shrink-0 h-2 w-2 rounded-full bg-blue-500" />}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-slate-800 text-sm truncate">
            {email.from_name ?? email.from_email}
          </p>
          <p className="text-xs text-slate-500 truncate">{email.subject ?? '(Konu yok)'}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <InboxBadge inbox={email.inbox} />
          {email.is_following_up && (
            <span className="text-xs text-orange-600 font-medium hidden sm:flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z" />
              </svg>
              Takipte
            </span>
          )}
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
            dangerouslySetInnerHTML={{ __html: safeHtml(email.body_html) }} />
        ) : email.body_text ? (
          <pre className="text-sm text-slate-700 whitespace-pre-wrap bg-slate-50 rounded-xl p-4 border border-slate-100 font-sans">{email.body_text}</pre>
        ) : (
          <p className="text-sm text-slate-400 italic">İçerik yok.</p>
        )}

        {email.attachments && email.attachments.length > 0 && (
          <div className="mt-3 space-y-1.5">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Ekler ({email.attachments.length})</p>
            {email.attachments.map((att, i) => (
              <a
                key={i}
                href={`/api/email/attachment?key=${encodeURIComponent(att.url)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <svg className="h-4 w-4 shrink-0 text-slate-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
                <span className="flex-1 truncate">{att.filename}</span>
                <span className="shrink-0 text-slate-400">{(att.size / 1024).toFixed(0)} KB</span>
              </a>
            ))}
          </div>
        )}

        {email.replied_at && (
          <div className="mt-3 bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-700">
            <span className="font-medium">Yanıtlandı:</span> {formatDate(email.replied_at)}
            {email.reply_subject && <span className="ml-2">— {email.reply_subject}</span>}
          </div>
        )}

        {!replying ? (
          <div className="flex items-center gap-3 mt-4 flex-wrap">
            <button onClick={() => setReplying(true)}
              className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium px-4 py-2 rounded-lg transition-colors">
              Yanıtla
            </button>
            <FollowUpButton email={email} />
            {email.status !== 'archived' && (
              <button onClick={() => mark('archived')}
                className="text-xs text-slate-400 hover:text-slate-600 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors">
                Arşivle
              </button>
            )}
            <DeleteEmailButton id={email.id} />
          </div>
        ) : (
          <ReplyForm email={email} onDone={() => setReplying(false)} />
        )}
      </div>
    </details>
  )
}

// ─── Gönderilen kart ───────────────────────────────────────────────────────

function SentCard({ email }: { email: InboxEmail }) {
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
          <InboxBadge inbox={email.inbox} />
          <span className="text-xs text-emerald-600 font-medium">Gönderildi</span>
          {email.replied_at && <span className="text-xs text-slate-400 hidden sm:block">{formatDate(email.replied_at)}</span>}
          <span className="text-slate-400 group-open:rotate-180 transition-transform text-xs ml-1">▼</span>
        </div>
      </summary>
      <div className="px-5 pb-5 border-t border-slate-100 pt-4">
        <div className="text-xs text-slate-400 mb-3 flex justify-between">
          <span>Yanıt → <span className="text-slate-600">{email.from_email}</span></span>
          {email.replied_at && <span>{formatDate(email.replied_at)}</span>}
        </div>
        {email.reply_body_html ? (
          <div className="text-sm prose prose-sm max-w-none bg-slate-50 rounded-xl p-4 border border-slate-100"
            dangerouslySetInnerHTML={{ __html: safeHtml(email.reply_body_html) }} />
        ) : (
          <p className="text-sm text-slate-400 italic">İçerik yok.</p>
        )}
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

// ─── Ana bileşen ───────────────────────────────────────────────────────────

type Props = {
  tab: string
  inboxFilter: string
  allEmails: InboxEmail[]
}

export default function InboxClient({ tab, inboxFilter, allEmails }: Props) {
  // Thread grupları — aynı thread_id olanları ilk emailin üstünde göster
  function groupThreads(emails: InboxEmail[]) {
    const seenThreads = new Set<string>()
    const result: { type: 'thread' | 'single'; email: InboxEmail }[] = []

    for (const email of emails) {
      if (email.thread_id) {
        if (!seenThreads.has(email.thread_id)) {
          seenThreads.add(email.thread_id)
          result.push({ type: 'thread', email })
        }
        // Diğer thread üyelerini atla — ThreadView içinde gösterilecek
      } else {
        result.push({ type: 'single', email })
      }
    }
    return result
  }

  // ── Gönderilenler ──
  if (tab === 'gidenler') {
    const sent = allEmails.filter((e) => e.replied_at)
    return sent.length === 0
      ? <EmptyState message="Henüz gönderilmiş yanıt yok." />
      : <div className="space-y-2">{sent.map((e) => <SentCard key={e.id} email={e} />)}</div>
  }

  // ── Takipte ──
  if (tab === 'takipte') {
    const following = allEmails.filter((e) => e.is_following_up)
    return following.length === 0
      ? <EmptyState message="Takipte mail yok." sub="Mailde 'Takibe Al' butonuna basarak takip listesine ekleyebilirsiniz." />
      : (
        <div>
          <p className="text-xs text-orange-600 font-medium mb-3">{following.length} mail takipte</p>
          <div className="space-y-2">
            {following.map((e) => e.thread_id
              ? <ThreadView key={e.thread_id} thread={e} allEmails={allEmails} />
              : <EmailCard key={e.id} email={e} />
            )}
          </div>
        </div>
      )
  }

  // ── Önemliler ──
  if (tab === 'onemli') {
    const flagged = allEmails.filter((e) => e.is_flagged)
    return flagged.length === 0
      ? <EmptyState message="Bayraklı mail yok." sub="Bayrak simgesine tıklayarak önemli olarak işaretleyebilirsiniz." />
      : <div className="space-y-2">{flagged.map((e) => e.thread_id
          ? <ThreadView key={e.thread_id} thread={e} allEmails={allEmails} />
          : <EmailCard key={e.id} email={e} />
        )}</div>
  }

  // ── Cevap bekleyenler ──
  if (tab === 'bekleyenler') {
    const pending = allEmails.filter((e) => !e.replied_at && e.status !== 'archived')
    return pending.length === 0
      ? <EmptyState message="Tüm mailler yanıtlanmış." />
      : (
        <div>
          <p className="text-xs text-amber-600 font-medium mb-3">{pending.length} mail yanıt bekliyor</p>
          <div className="space-y-2">
            {groupThreads(pending).map(({ type, email }) =>
              type === 'thread'
                ? <ThreadView key={email.thread_id} thread={email} allEmails={allEmails} />
                : <EmailCard key={email.id} email={email} />
            )}
          </div>
        </div>
      )
  }

  // ── Gelenler ──
  let filtered = allEmails
  if (inboxFilter === 'archived') {
    filtered = allEmails.filter((e) => e.status === 'archived')
  } else if (inboxFilter !== 'all') {
    filtered = allEmails.filter((e) => e.inbox === inboxFilter && e.status !== 'archived')
  } else {
    filtered = allEmails.filter((e) => e.status !== 'archived')
  }

  const unread = filtered.filter((e) => e.status === 'unread').length
  const grouped = groupThreads(filtered)

  const readCount = filtered.filter((e) => e.status === 'read').length
  const archivedCount = allEmails.filter((e) => e.status === 'archived').length

  return filtered.length === 0
    ? <EmptyState message="Mesaj yok." sub="Resend webhook kurulumu için Email Ayarları sayfasını kontrol edin." />
    : (
      <div>
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div className="flex items-center gap-1.5">
            {unread > 0 && <span className="text-xs text-blue-600 font-medium">{unread} okunmamış</span>}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {readCount > 0 && (
              <BulkDeleteButton label="Okunanları Sil" filter="read" count={readCount} />
            )}
            {archivedCount > 0 && (
              <BulkDeleteButton label="Arşivi Temizle" filter="archived" count={archivedCount} />
            )}
            <BulkDeleteButton label="Tümünü Sil" filter="all" count={allEmails.length} />
          </div>
        </div>
        <div className="space-y-2">
          {grouped.map(({ type, email }) =>
            type === 'thread'
              ? <ThreadView key={email.thread_id!} thread={email} allEmails={allEmails} />
              : <EmailCard key={email.id} email={email} />
          )}
        </div>
      </div>
    )
}
