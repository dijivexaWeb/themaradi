'use client'

import { useState, useTransition } from 'react'
import { Loader2, Send, CheckCircle2, Share2, Link2, Check, QrCode } from 'lucide-react'
import { incrementFamilyActionAction, submitFamilyCondolenceAction } from '@/lib/actions/family-public'
import Link from 'next/link'

type ActionType = 'candle' | 'flower' | 'prayer' | 'heart' | 'star' | 'silence'

const ACTION_CONFIG: Record<ActionType, { emoji: string; key: string }> = {
  candle:  { emoji: '🕯️', key: 'candle' },
  flower:  { emoji: '🌹', key: 'flower' },
  prayer:  { emoji: '🤲', key: 'prayer' },
  heart:   { emoji: '❤️', key: 'heart' },
  star:    { emoji: '⭐', key: 'star' },
  silence: { emoji: '🙏', key: 'silence' },
}

interface ActionData { action_type: ActionType; count: number }

interface FamilyT {
  inMemoryOf: string
  candle: string; flower: string; prayer: string; heart: string; star: string; silence: string
  condolenceTitle: string
  condolenceName: string
  condolenceEmail: string
  condolenceRelation: string
  condolenceMessage: string
  condolenceSend: string
  condolenceSending: string
  condolenceSuccess: string
  condolenceSuccessSub: string
  condolenceError: string
  condolenceNote: string
  shareTitle: string
  shareCopy: string
  shareCopied: string
  shareQr: string
}

interface ActionBtnProps {
  familyId: string; slug: string; actions: ActionData[]; enabledTypes: ActionType[]; t: FamilyT
}

export function FamilyActionButtons({ familyId, slug, actions, enabledTypes, t }: ActionBtnProps) {
  const [counts, setCounts] = useState<Record<ActionType, number>>(() => {
    const init = {} as Record<ActionType, number>
    for (const a of actions) { init[a.action_type] = a.count }
    return init
  })
  const [done, setDone] = useState<Set<ActionType>>(new Set())
  const [loading, setLoading] = useState<ActionType | null>(null)

  const handleAction = async (type: ActionType) => {
    if (done.has(type) || loading) return
    setLoading(type)
    const result = await incrementFamilyActionAction(familyId, slug, type)
    if (result.ok && result.count !== undefined) {
      setCounts(prev => ({ ...prev, [type]: result.count! }))
      setDone(prev => new Set([...prev, type]))
    }
    setLoading(null)
  }

  const actionLabel: Record<ActionType, string> = {
    candle: t.candle, flower: t.flower, prayer: t.prayer,
    heart: t.heart, star: t.star, silence: t.silence,
  }

  return (
    <div className="flex flex-wrap gap-3 justify-center">
      {enabledTypes.map(type => {
        const cfg = ACTION_CONFIG[type]
        const isDone = done.has(type)
        const isLoading = loading === type
        const count = counts[type] ?? 0
        return (
          <button key={type} onClick={() => handleAction(type)} disabled={isDone || !!loading}
            className={`group flex flex-col items-center gap-1.5 rounded-2xl border-2 px-5 py-4 transition-all duration-200 disabled:cursor-not-allowed ${
              isDone ? 'border-white/50 bg-white/20 scale-[0.97]' : 'border-white/20 bg-white/5 hover:bg-white/15 hover:border-white/40'
            }`}>
            <span className={`text-2xl transition-transform ${isLoading ? 'animate-bounce' : isDone ? 'scale-110' : 'group-hover:scale-110'}`}>
              {isLoading ? '⏳' : cfg.emoji}
            </span>
            <span className={`text-xs font-semibold ${isDone ? 'text-white' : 'text-white/70'}`}>{actionLabel[type]}</span>
            {count > 0 && <span className="text-[10px] font-bold text-white/50">{count}</span>}
          </button>
        )
      })}
    </div>
  )
}

// ── Share Button ──────────────────────────────────────────────────────────────

interface ShareProps { slug: string; familyName: string; t: FamilyT }

export function ShareButton({ slug, familyName, t }: ShareProps) {
  const [copied, setCopied] = useState(false)
  const [open, setOpen] = useState(false)

  const url = typeof window !== 'undefined'
    ? `${window.location.origin}/aile/${slug}`
    : `/aile/${slug}`

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: familyName, url })
      } catch { /* user cancelled */ }
      return
    }
    setOpen(o => !o)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => { setCopied(false); setOpen(false) }, 2000)
    })
  }

  return (
    <div className="relative">
      <button onClick={handleNativeShare}
        className="flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-5 py-2.5 text-sm font-medium text-white hover:bg-white/20 transition-all backdrop-blur-sm">
        <Share2 className="h-4 w-4" />
        {t.shareTitle}
      </button>

      {open && (
        <div className="absolute top-full mt-2 right-0 z-20 rounded-2xl border border-white/20 bg-[#0e1e15]/95 backdrop-blur-lg p-3 space-y-2 shadow-2xl min-w-[200px]">
          <button onClick={handleCopy}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-white/80 hover:bg-white/10 transition-colors">
            {copied ? <Check className="h-4 w-4 text-green-400" /> : <Link2 className="h-4 w-4" />}
            {copied ? t.shareCopied : t.shareCopy}
          </button>
          <Link href={`/aile/${slug}/qr`}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-white/80 hover:bg-white/10 transition-colors">
            <QrCode className="h-4 w-4" />
            {t.shareQr}
          </Link>
        </div>
      )}
    </div>
  )
}

// ── Condolence Form ───────────────────────────────────────────────────────────

interface CondolenceFormProps { familyId: string; slug: string; t: FamilyT }

export function CondolenceForm({ familyId, slug, t }: CondolenceFormProps) {
  const [isPending, startTransition] = useTransition()
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [relation, setRelation] = useState('')
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'taziye' | 'ani' | ''>('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const fd = new FormData()
    if (!messageType) { setError('Lütfen mesaj türünü seçin: Taziye mi Anı mı?'); return }
    fd.set('author_name', name.trim())
    fd.set('author_email', email.trim())
    fd.set('relation', relation.trim())
    fd.set('message', message.trim())
    fd.set('message_type', messageType)
    const action = submitFamilyCondolenceAction.bind(null, familyId, slug)
    startTransition(async () => {
      const result = await action(fd)
      if (!result.ok) { setError(result.error ?? t.condolenceError); return }
      setSubmitted(true)
    })
  }

  const inp = 'w-full rounded-xl text-sm text-white/90 outline-none transition-all placeholder:text-white/45'
  const inpStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.07)',
    border: '1px solid rgba(255,255,255,0.28)',
    padding: '14px 16px',
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-xl text-center py-14">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-[#c19a6b]/30 bg-[#c19a6b]/10">
          <CheckCircle2 className="h-8 w-8 text-[#c19a6b]" />
        </div>
        <h3 className="font-serif text-xl text-white mb-2">{t.condolenceSuccess || 'Mesajınız Alındı'}</h3>
        <p className="text-sm text-white/40">{t.condolenceSuccessSub || 'Aile onayından sonra yayınlanacak.'}</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit}
      style={{
        display: 'flex', gap: '0',
        background: 'linear-gradient(135deg, rgba(255,255,255,0.025) 0%, rgba(193,154,107,0.04) 100%)',
        border: '1px solid rgba(193,154,107,0.2)',
        borderRadius: '20px',
        overflow: 'hidden',
        backdropFilter: 'blur(16px)',
      }}>

      {/* Sol — dekoratif görsel */}
      <div style={{
        width: '220px', flexShrink: 0,
        background: 'linear-gradient(160deg, rgba(193,154,107,0.08) 0%, rgba(2,18,15,0.6) 100%)',
        borderRight: '1px solid rgba(193,154,107,0.12)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '2rem 1rem',
      }} className="hidden sm:flex">
        <img src="/images/premium-family/quill.png" alt="" style={{ width: '140px', height: '140px', objectFit: 'contain', opacity: 0.9 }} />
      </div>

      {/* Sağ — form alanları */}
      <div style={{ flex: 1, padding: '2rem 2.25rem' }}>

        {/* Tip seçimi — TAZİYE / ANI */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
          {([
            { value: 'taziye', label: '🕊️ Taziye Mesajı', desc: 'Başsağlığı & destek' },
            { value: 'ani',    label: '📖 Aile Anısı',    desc: 'Güzel bir hatıra' },
          ] as const).map(opt => (
            <button key={opt.value} type="button"
              onClick={() => setMessageType(opt.value)}
              style={{
                flex: 1, padding: '0.85rem 1rem', borderRadius: '12px', cursor: 'pointer',
                border: messageType === opt.value
                  ? '1px solid rgba(193,154,107,0.6)'
                  : '1px solid rgba(255,255,255,0.18)',
                background: messageType === opt.value
                  ? 'linear-gradient(135deg, rgba(193,154,107,0.18), rgba(193,154,107,0.08))'
                  : 'rgba(255,255,255,0.04)',
                color: messageType === opt.value ? '#c19a6b' : 'rgba(255,255,255,0.45)',
                textAlign: 'left', transition: 'all 0.2s',
              }}>
              <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '3px' }}>{opt.label}</div>
              <div style={{ fontSize: '11px', opacity: 0.6 }}>{opt.desc}</div>
            </button>
          ))}
        </div>

        {/* İsim + E-posta + Yakınlık — 3 kolon */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}
          className="grid-cols-1 sm:grid-cols-3">
          <input value={name} onChange={e => setName(e.target.value)}
            placeholder={`${t.condolenceName || 'Adınız'} *`} required className={inp} style={inpStyle} />
          <input value={email} onChange={e => setEmail(e.target.value)}
            placeholder={t.condolenceEmail || 'E-posta (isteğe bağlı)'} type="email" className={inp} style={inpStyle} />
          <input value={relation} onChange={e => setRelation(e.target.value)}
            placeholder={t.condolenceRelation || 'Yakınlığınız (ör. dost, kuzen)'} className={inp} style={inpStyle} />
        </div>

        {/* Mesaj */}
        <div style={{ position: 'relative', marginBottom: '1rem' }}>
          <textarea value={message} onChange={e => setMessage(e.target.value)}
            placeholder={`${t.condolenceMessage || 'Mesajınız'} *`}
            required rows={5} maxLength={1000}
            className={inp}
            style={{ ...inpStyle, display: 'block', width: '100%', resize: 'none', paddingBottom: '2rem' }} />
          <span style={{ position: 'absolute', bottom: '12px', right: '16px', fontSize: '11px', color: 'rgba(255,255,255,0.25)', pointerEvents: 'none' }}>
            {message.length}/1000
          </span>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', fontStyle: 'italic', margin: 0 }}>
            {t.condolenceNote || 'Mesajınız aile onayından sonra yayınlanır.'}
          </p>
          <button type="submit"
            disabled={isPending || !name.trim() || !message.trim() || !messageType}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0,
              padding: '0.7rem 1.6rem', borderRadius: '10px', cursor: 'pointer',
              border: '1px solid rgba(193,154,107,0.5)',
              background: 'linear-gradient(135deg, #c19a6b, #a07840)',
              color: '#fff', fontSize: '14px', fontWeight: 700,
              opacity: (isPending || !name.trim() || !message.trim() || !messageType) ? 0.4 : 1,
              transition: 'all 0.2s',
            }}>
            {isPending
              ? <><Loader2 className="h-4 w-4 animate-spin" />{t.condolenceSending || 'Gönderiliyor...'}</>
              : <><Send className="h-4 w-4" />{t.condolenceSend || 'Gönder'}</>}
          </button>
        </div>

        {error && <p style={{ marginTop: '0.5rem', fontSize: '12px', color: '#f87171', textAlign: 'center' }}>{error}</p>}
      </div>
    </form>
  )
}
