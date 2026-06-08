'use client'

import { useState, useTransition } from 'react'
import { markEmailStatusAction, sendInboxReplyAction } from './actions'

type InboxEmail = {
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
}

const INBOX_LABELS: Record<string, { label: string; color: string; bg: string }> = {
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
<ul>
<li>...</li>
</ul>
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
<p>Bu arada sıkça sorulan sorular için <a href="https://theeternalmemory.com">web sitemizi</a> ziyaret edebilirsiniz.</p>
<p>Saygılarımızla,<br/>The Eternal Memory Destek Ekibi</p>`,
  },
}

function ReplyForm({ email, onDone }: { email: InboxEmail; onDone: () => void }) {
  const [isPending, startTransition] = useTransition()
  const [result, setResult] = useState<{ error?: string; success?: boolean } | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState('general')
  const [body, setBody] = useState(() => TEMPLATES.general.body)
  const [subject, setSubject] = useState(() =>
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
      if (r.success) setTimeout(onDone, 1200)
    })
  }

  const inp = 'w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-slate-400'

  return (
    <div className="mt-4 border-t border-slate-100 pt-4">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Yanıt Gönder</p>

      {/* Template seçici */}
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
            <input type="text" readOnly value={email.from_email} className={`${inp} bg-slate-50 cursor-default`} />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Kimden</label>
            <input type="text" readOnly value={`${email.inbox}@theeternalmemory.com`} className={`${inp} bg-slate-50 cursor-default`} />
          </div>
        </div>

        <div>
          <label className="block text-xs text-slate-400 mb-1">Konu</label>
          <input
            type="text"
            name="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
            className={inp}
          />
        </div>

        <div>
          <label className="block text-xs text-slate-400 mb-1">
            İçerik (HTML)
            <span className="ml-2 text-slate-300 font-normal">— düzenleyebilirsiniz</span>
          </label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            required
            rows={10}
            className={`${inp} font-mono text-xs leading-relaxed resize-y`}
          />
        </div>

        {/* Önizleme */}
        <details className="group">
          <summary className="text-xs text-slate-400 cursor-pointer hover:text-slate-600 list-none">
            Email önizlemesi ▼
          </summary>
          <div
            className="mt-2 rounded-xl border border-slate-200 bg-white p-4 text-sm prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: body }}
          />
        </details>

        {result?.error && (
          <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{result.error}</p>
        )}
        {result?.success && (
          <p className="text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
            Yanıt gönderildi!
          </p>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isPending}
            className="bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors"
          >
            {isPending ? 'Gönderiliyor...' : 'Gönder →'}
          </button>
          <button type="button" onClick={onDone} className="text-sm text-slate-400 hover:text-slate-600 px-3 py-2">
            Vazgeç
          </button>
        </div>
      </form>
    </div>
  )
}

function EmailCard({ email }: { email: InboxEmail }) {
  const [replying, setReplying] = useState(false)
  const [isPending, startTransition] = useTransition()
  const meta = INBOX_LABELS[email.inbox] ?? INBOX_LABELS.other

  function mark(status: 'read' | 'archived') {
    startTransition(async () => {
      await markEmailStatusAction(email.id, status)
    })
  }

  const senderDisplay = email.from_name ? `${email.from_name} <${email.from_email}>` : email.from_email

  return (
    <details className="bg-white border border-slate-200 rounded-xl shadow-sm group">
      <summary
        className={`px-5 py-4 cursor-pointer list-none flex items-center justify-between hover:bg-slate-50 rounded-xl transition-colors ${
          email.status === 'unread' ? 'bg-blue-50/40' : ''
        }`}
        onClick={() => {
          if (email.status === 'unread') mark('read')
        }}
      >
        <div className="flex items-center gap-3 min-w-0">
          {email.status === 'unread' && (
            <span className="shrink-0 h-2 w-2 rounded-full bg-blue-500" />
          )}
          <div className="min-w-0">
            <p className="font-medium text-slate-800 truncate text-sm">{senderDisplay}</p>
            <p className="text-xs text-slate-500 truncate">{email.subject ?? '(Konu yok)'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-3">
          <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${meta.bg} ${meta.color}`}>
            {meta.label}
          </span>
          {email.replied_at && (
            <span className="text-xs text-emerald-600 font-medium">✓ Yanıtlandı</span>
          )}
          <span className="text-xs text-slate-400">
            {new Date(email.received_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
          </span>
          <span className="text-slate-400 group-open:rotate-180 transition-transform text-xs">▼</span>
        </div>
      </summary>

      <div className="px-5 pb-5 border-t border-slate-100 pt-4">
        {/* Gelen mail içeriği */}
        <div className="mb-4">
          <p className="text-xs text-slate-400 mb-2">Gelen mesaj:</p>
          {email.body_html ? (
            <div
              className="text-sm prose prose-sm max-w-none bg-slate-50 rounded-xl p-4 border border-slate-100"
              dangerouslySetInnerHTML={{ __html: email.body_html }}
            />
          ) : email.body_text ? (
            <pre className="text-sm text-slate-700 whitespace-pre-wrap bg-slate-50 rounded-xl p-4 border border-slate-100 font-sans">
              {email.body_text}
            </pre>
          ) : (
            <p className="text-sm text-slate-400 italic">İçerik yok.</p>
          )}
        </div>

        {/* Yanıt bilgisi */}
        {email.replied_at && (
          <div className="mb-4 bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-700">
            <span className="font-medium">Yanıt gönderildi:</span>{' '}
            {new Date(email.replied_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            {email.reply_subject && <span className="ml-2 text-emerald-600"> — Konu: {email.reply_subject}</span>}
          </div>
        )}

        {/* Aksiyonlar */}
        {!replying && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setReplying(true)}
              className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium px-4 py-2 rounded-lg transition-colors"
            >
              Yanıtla
            </button>
            {email.status !== 'archived' && (
              <button
                onClick={() => mark('archived')}
                disabled={isPending}
                className="text-xs text-slate-400 hover:text-slate-600 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors disabled:opacity-50"
              >
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

type Props = {
  emails: InboxEmail[]
  activeFilter: string
}

export default function InboxClient({ emails, activeFilter }: Props) {
  const unreadCount = emails.filter((e) => e.status === 'unread').length

  return (
    <div>
      {emails.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
          <p className="text-slate-400 text-sm">
            {activeFilter === 'archived' ? 'Arşivlenmiş mesaj yok.' : 'Henüz gelen mail yok.'}
          </p>
          {activeFilter !== 'archived' && (
            <p className="text-slate-300 text-xs mt-2">
              Resend webhook kurulumu için Email Ayarları sayfasını kontrol edin.
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {unreadCount > 0 && (
            <p className="text-xs text-blue-600 font-medium mb-3">
              {unreadCount} okunmamış mesaj
            </p>
          )}
          {emails.map((email) => (
            <EmailCard key={email.id} email={email} />
          ))}
        </div>
      )}
    </div>
  )
}
