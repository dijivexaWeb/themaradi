'use client'

import { useState } from 'react'
import { ArrowRight, Feather, Flame, Heart, X } from 'lucide-react'

interface Condolence {
  name: string
  date: string
  relation: string
  text: string
}

type ActionType = 'candle' | 'flower' | 'prayer' | null

const ACTION_META = {
  candle: {
    emoji: '🕯️',
    title: 'Mum yakıyorsunuz',
    desc: 'Yakılan her mum bir hatırayı aydınlatır.',
    confirmLabel: 'Mumu Yak',
    color: 'amber' as const,
  },
  flower: {
    emoji: '🌹',
    title: 'Çiçek bırakıyorsunuz',
    desc: 'Bırakılan her çiçek derin bir saygının ifadesidir.',
    confirmLabel: 'Çiçeği Bırak',
    color: 'rose' as const,
  },
  prayer: {
    emoji: '🤲',
    title: 'Dua ediyorsunuz',
    desc: 'Her dua bir sevginin, bir özlemin yankısıdır.',
    confirmLabel: 'Dua Et',
    color: 'gold' as const,
  },
}

export default function MemorialInteractions({ condolences }: { condolences: Condolence[] }) {
  const [candlesLit, setCandlesLit] = useState(47)
  const [flowersLeft, setFlowersLeft] = useState(23)
  const [prayersSent, setPrayersSent] = useState(91)
  const [userLitCandle, setUserLitCandle] = useState(false)
  const [userLeftFlower, setUserLeftFlower] = useState(false)
  const [userPrayed, setUserPrayed] = useState(false)
  const [pendingAction, setPendingAction] = useState<ActionType>(null)
  const [showCondolenceForm, setShowCondolenceForm] = useState(false)

  function requestAction(type: ActionType) {
    if (type === 'candle' && userLitCandle) return
    if (type === 'flower' && userLeftFlower) return
    if (type === 'prayer' && userPrayed) return
    setPendingAction(type)
  }

  function confirmAction(name: string, contact: string) {
    if (pendingAction === 'candle') { setUserLitCandle(true); setCandlesLit((n) => n + 1) }
    if (pendingAction === 'flower') { setUserLeftFlower(true); setFlowersLeft((n) => n + 1) }
    if (pendingAction === 'prayer') { setUserPrayed(true); setPrayersSent((n) => n + 1) }
    setPendingAction(null)
    // name / contact can be sent to API here when ready
    void name; void contact
  }

  return (
    <>
      {/* Mini modal */}
      {pendingAction && (
        <ActionModal
          action={pendingAction}
          onConfirm={confirmAction}
          onClose={() => setPendingAction(null)}
        />
      )}

      <section id="taziye" className="border-y border-[#e6dccb] bg-[#f7f2e9] px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <div className="flex items-center justify-center gap-3 text-[#b08340]">
              <span className="h-px w-10 bg-[#c7a76f]" />
              <span className="text-xs tracking-[0.2em] uppercase">Taziye Defteri</span>
              <span className="h-px w-10 bg-[#c7a76f]" />
            </div>
            <h2 className="mt-3 font-serif text-5xl text-[#173d31]">
              Hislerinizi<br />
              <span className="text-[#b08340]">paylaşın.</span>
            </h2>
          </div>

          {/* İnteraksiyon butonları */}
          <div className="mb-12 grid grid-cols-3 gap-3 sm:gap-4">
            <InteractionButton
              onClick={() => requestAction('candle')}
              active={userLitCandle}
              count={candlesLit}
              label={userLitCandle ? 'Mum yaktınız' : 'Mum yak'}
              color="amber"
              icon={
                <div className="relative flex flex-col items-center">
                  <div className={`mb-0.5 h-3 w-2 rounded-full sm:h-5 sm:w-3 ${userLitCandle ? 'animate-candle animate-flame-glow bg-gradient-to-t from-[#f59e0b] to-[#fde68a]' : 'bg-[#d1c4ae]'}`} />
                  <div className={`h-7 w-3 rounded-sm sm:h-12 sm:w-5 ${userLitCandle ? 'bg-[#fde68a]' : 'bg-[#e5d9c5]'}`} />
                </div>
              }
            />

            <InteractionButton
              onClick={() => requestAction('flower')}
              active={userLeftFlower}
              count={flowersLeft}
              label={userLeftFlower ? 'Çiçek bıraktınız' : 'Çiçek bırak'}
              color="rose"
              icon={
                <div className={`text-2xl transition-transform duration-300 sm:text-4xl ${userLeftFlower ? 'scale-125' : ''}`}>
                  🌹
                </div>
              }
            />

            <InteractionButton
              onClick={() => requestAction('prayer')}
              active={userPrayed}
              count={prayersSent}
              label={userPrayed ? 'Dua edildi' : 'Dua et'}
              color="gold"
              icon={
                <div className={`transition-transform duration-300 ${userPrayed ? 'scale-110' : ''}`}>
                  <Heart className={`h-7 w-7 sm:h-10 sm:w-10 ${userPrayed ? 'fill-[#b08340] text-[#b08340]' : 'text-[#c7a76f]'}`} />
                </div>
              }
            />
          </div>

          {/* Taziye kartları */}
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {condolences.map((item) => (
              <div key={item.name} className="rounded-2xl border border-[#e1d5c3] bg-[#fffdf8] p-6 shadow-sm shadow-[#4d3d26]/5">
                <div className="font-serif text-5xl leading-none text-[#c7a76f]/40">"</div>
                <p className="mt-2 text-sm italic leading-7 text-[#4c463c]">{item.text}</p>
                <div className="mt-5 border-t border-[#e1d5c3] pt-4">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f4eee3] text-xs font-semibold text-[#b08340]">
                      {item.name[0]}
                    </div>
                    <div>
                      <div className="font-serif text-sm text-[#173d31]">{item.name}</div>
                      <div className="text-[11px] text-[#8a7a64]">{item.relation} · {item.date}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Mesaj bırak CTA / Form */}
          <div className="mt-8 overflow-hidden rounded-2xl border border-[#e1d5c3] bg-[#fffdf8]">
            {!showCondolenceForm ? (
              <div className="flex flex-col items-center gap-5 p-8 text-center sm:flex-row sm:justify-between sm:text-left">
                <div>
                  <h3 className="font-serif text-2xl text-[#173d31]">Taziye mesajı bırakmak ister misiniz?</h3>
                  <p className="mt-2 text-sm text-[#665d50]">
                    Mesajınız varis onayından geçtikten sonra yayınlanır.
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-[#8a7a64]">
                    <span className="flex items-center gap-1.5"><Flame className="h-3.5 w-3.5 text-[#b08340]" />{candlesLit} mum</span>
                    <span>·</span>
                    <span className="flex items-center gap-1.5"><span>🌹</span>{flowersLeft} çiçek</span>
                    <span>·</span>
                    <span className="flex items-center gap-1.5"><Heart className="h-3.5 w-3.5 text-[#b08340]" />{prayersSent} dua</span>
                  </div>
                </div>
                <button
                  onClick={() => setShowCondolenceForm(true)}
                  className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-[#103b2c] px-7 py-3.5 text-sm font-semibold text-white shadow-lg transition hover:bg-[#0b2b20]"
                >
                  Mesaj Bırak
                  <Feather className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <form className="p-8" onSubmit={(e) => { e.preventDefault(); setShowCondolenceForm(false) }}>
                <h3 className="font-serif text-2xl text-[#173d31]">Taziye mesajınız</h3>
                <p className="mt-1 text-sm text-[#665d50]">Onaydan sonra sayfada yayınlanacaktır.</p>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#665d50]">Adınız</label>
                    <input type="text" required placeholder="Adınız Soyadınız" className="w-full rounded-lg border border-[#e1d5c3] bg-[#f7f2e9] px-4 py-3 text-sm text-[#173d31] outline-none focus:border-[#b08340] focus:ring-2 focus:ring-[#b08340]/10" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#665d50]">Yakınlık</label>
                    <input type="text" placeholder="Komşusu, Öğrencisi, ..." className="w-full rounded-lg border border-[#e1d5c3] bg-[#f7f2e9] px-4 py-3 text-sm text-[#173d31] outline-none focus:border-[#b08340] focus:ring-2 focus:ring-[#b08340]/10" />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#665d50]">Mesajınız</label>
                  <textarea required rows={4} placeholder="Taziye mesajınızı buraya yazın..." className="w-full rounded-lg border border-[#e1d5c3] bg-[#f7f2e9] px-4 py-3 text-sm text-[#173d31] outline-none focus:border-[#b08340] focus:ring-2 focus:ring-[#b08340]/10" />
                </div>
                <div className="mt-5 flex gap-3">
                  <button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-[#103b2c] px-7 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-[#0b2b20]">
                    Gönder <ArrowRight className="h-4 w-4" />
                  </button>
                  <button type="button" onClick={() => setShowCondolenceForm(false)} className="rounded-xl border border-[#e1d5c3] px-6 py-3 text-sm font-semibold text-[#665d50] transition hover:bg-[#f7f2e9]">
                    Vazgeç
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  )
}

function ActionModal({
  action,
  onConfirm,
  onClose,
}: {
  action: ActionType
  onConfirm: (name: string, contact: string) => void
  onClose: () => void
}) {
  const [name, setName] = useState('')
  const [contact, setContact] = useState('')

  if (!action) return null
  const meta = ACTION_META[action]

  const activeStyles = {
    amber: 'bg-[#fffbeb] border-[#f59e0b]/30',
    rose: 'bg-[#fff1f2] border-[#f43f5e]/25',
    gold: 'bg-[#fdf8ee] border-[#b08340]/30',
  }

  const btnStyles = {
    amber: 'bg-[#f59e0b] hover:bg-[#d97706] text-white',
    rose: 'bg-[#f43f5e] hover:bg-[#e11d48] text-white',
    gold: 'bg-[#103b2c] hover:bg-[#0b2b20] text-white',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-[#0c3327]/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className={`relative w-full max-w-md overflow-hidden rounded-2xl border shadow-2xl shadow-[#0c3327]/20 ${activeStyles[meta.color]}`}>
        <div className="p-5 sm:p-7">
          {/* Kapat */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border border-[#e1d5c3] bg-white/70 text-[#665d50] transition hover:bg-white"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Başlık */}
          <div className="text-center">
            <div className="text-5xl">{meta.emoji}</div>
            <h3 className="mt-3 font-serif text-2xl text-[#173d31]">{meta.title}</h3>
            <p className="mt-1 text-sm text-[#665d50]">{meta.desc}</p>
          </div>

          {/* Form */}
          <div className="mt-6 space-y-4">
            <div>
              <label className="mb-1.5 flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-[#665d50]">
                <span>Ad Soyad</span>
                <span className="normal-case font-normal text-[#8a7a64]">opsiyonel</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Adınız Soyadınız"
                className="w-full rounded-lg border border-[#e1d5c3] bg-white/80 px-4 py-2.5 text-sm text-[#173d31] outline-none focus:border-[#b08340] focus:ring-2 focus:ring-[#b08340]/10"
              />
            </div>
            <div>
              <label className="mb-1.5 flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-[#665d50]">
                <span>İletişim</span>
                <span className="normal-case font-normal text-[#8a7a64]">opsiyonel · aileye iletilir</span>
              </label>
              <input
                type="text"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="E-posta veya telefon"
                className="w-full rounded-lg border border-[#e1d5c3] bg-white/80 px-4 py-2.5 text-sm text-[#173d31] outline-none focus:border-[#b08340] focus:ring-2 focus:ring-[#b08340]/10"
              />
              <p className="mt-1.5 text-[11px] text-[#8a7a64]">
                İletişim bilgisi yalnızca aile ile paylaşılır, sayfada görünmez.
              </p>
            </div>
          </div>

          {/* Butonlar */}
          <div className="mt-6 flex flex-col gap-2">
            <button
              onClick={() => onConfirm(name, contact)}
              className={`inline-flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold shadow-md transition ${btnStyles[meta.color]}`}
            >
              {meta.confirmLabel}
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => onConfirm('', '')}
              className="w-full rounded-xl border border-[#e1d5c3] bg-white/60 py-2.5 text-sm text-[#665d50] transition hover:bg-white"
            >
              Anonim olarak devam et
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function InteractionButton({
  onClick,
  active,
  count,
  label,
  icon,
  color,
}: {
  onClick: () => void
  active: boolean
  count: number
  label: string
  icon: React.ReactNode
  color: 'amber' | 'rose' | 'gold'
}) {
  const activeStyles = {
    amber: 'border-[#f59e0b]/40 bg-[#fffbeb]',
    rose: 'border-[#f43f5e]/30 bg-[#fff1f2]',
    gold: 'border-[#b08340]/40 bg-[#fdf8ee]',
  }

  return (
    <button
      onClick={onClick}
      disabled={active}
      className={`flex flex-col items-center gap-2 rounded-xl border p-3 text-center shadow-sm transition sm:gap-4 sm:rounded-2xl sm:p-7 ${
        active
          ? activeStyles[color]
          : 'border-[#e1d5c3] bg-[#fffdf8] hover:border-[#c7a76f]/40 hover:shadow-md'
      } ${active ? 'cursor-default' : 'cursor-pointer'}`}
    >
      <div className="flex h-10 items-end justify-center sm:h-16">{icon}</div>
      <div>
        <div className="font-serif text-xl text-[#173d31] sm:text-3xl">{count.toLocaleString('tr-TR')}</div>
        <div className="mt-0.5 text-xs text-[#665d50] sm:mt-1 sm:text-sm">{label}</div>
      </div>
    </button>
  )
}
