'use client'

import { useState } from 'react'
import { ArrowRight, Feather, Flame, Heart, X } from 'lucide-react'
import { type Lang } from '@/i18n'
import { useLang } from '@/i18n/context'

interface Condolence {
  name: string
  date: string
  relation: string
  text: string
}

type ActionType = 'candle' | 'flower' | 'prayer' | null
type ActionColor = 'amber' | 'rose' | 'gold'

const interactionCopy: Record<Lang, any> = {
  tr: {
    title: 'Hislerinizi', titleAccent: 'paylaşın.', candle: 'Mum yak', candleDone: 'Mum yaktınız', flower: 'Çiçek bırak', flowerDone: 'Çiçek bıraktınız', prayer: 'Dua et', prayerDone: 'Dua edildi', candleUnit: 'mum', flowerUnit: 'çiçek', prayerUnit: 'dua', ctaTitle: 'Taziye mesajı bırakmak ister misiniz?', ctaText: 'Mesajınız varis onayından geçtikten sonra yayınlanır.', messageButton: 'Mesaj Bırak', formTitle: 'Taziye mesajınız', formText: 'Onaydan sonra sayfada yayınlanacaktır.', name: 'Adınız', namePlaceholder: 'Adınız Soyadınız', relation: 'Yakınlık', relationPlaceholder: 'Komşusu, Öğrencisi, ...', message: 'Mesajınız', messagePlaceholder: 'Taziye mesajınızı buraya yazın...', send: 'Gönder', cancel: 'Vazgeç', optional: 'opsiyonel', contact: 'İletişim', contactOptional: 'opsiyonel · aileye iletilir', contactPlaceholder: 'E-posta veya telefon', contactHelp: 'İletişim bilgisi yalnızca aile ile paylaşılır, sayfada görünmez.', anonymous: 'Anonim olarak devam et',
    actions: { candle: { emoji: '🕯️', title: 'Mum yakıyorsunuz', desc: 'Yakılan her mum bir hatırayı aydınlatır.', confirmLabel: 'Mumu Yak', color: 'amber' }, flower: { emoji: '🌹', title: 'Çiçek bırakıyorsunuz', desc: 'Bırakılan her çiçek derin bir saygının ifadesidir.', confirmLabel: 'Çiçeği Bırak', color: 'rose' }, prayer: { emoji: '🤲', title: 'Dua ediyorsunuz', desc: 'Her dua bir sevginin, bir özlemin yankısıdır.', confirmLabel: 'Dua Et', color: 'gold' } }
  },
  en: {
    title: 'Share', titleAccent: 'your feelings.', candle: 'Light a candle', candleDone: 'Candle lit', flower: 'Leave a flower', flowerDone: 'Flower left', prayer: 'Say a prayer', prayerDone: 'Prayer sent', candleUnit: 'candles', flowerUnit: 'flowers', prayerUnit: 'prayers', ctaTitle: 'Would you like to leave a condolence message?', ctaText: 'Your message will be published after heir approval.', messageButton: 'Leave Message', formTitle: 'Your condolence message', formText: 'It will appear on the page after approval.', name: 'Your name', namePlaceholder: 'Your full name', relation: 'Relation', relationPlaceholder: 'Neighbor, student, ...', message: 'Your message', messagePlaceholder: 'Write your condolence message here...', send: 'Send', cancel: 'Cancel', optional: 'optional', contact: 'Contact', contactOptional: 'optional · sent to family', contactPlaceholder: 'Email or phone', contactHelp: 'Contact information is shared only with the family and is not shown on the page.', anonymous: 'Continue anonymously',
    actions: { candle: { emoji: '🕯️', title: 'You are lighting a candle', desc: 'Every candle lights up a memory.', confirmLabel: 'Light Candle', color: 'amber' }, flower: { emoji: '🌹', title: 'You are leaving a flower', desc: 'Every flower is an expression of deep respect.', confirmLabel: 'Leave Flower', color: 'rose' }, prayer: { emoji: '🤲', title: 'You are saying a prayer', desc: 'Every prayer echoes love and longing.', confirmLabel: 'Say Prayer', color: 'gold' } }
  },
  ka: {
    title: 'გააზიარეთ', titleAccent: 'თქვენი გრძნობები.', candle: 'სანთლის დანთება', candleDone: 'სანთელი დაინთო', flower: 'ყვავილის დატოვება', flowerDone: 'ყვავილი დატოვეთ', prayer: 'ლოცვა', prayerDone: 'ლოცვა გაიგზავნა', candleUnit: 'სანთელი', flowerUnit: 'ყვავილი', prayerUnit: 'ლოცვა', ctaTitle: 'გსურთ სამძიმრის შეტყობინების დატოვება?', ctaText: 'თქვენი შეტყობინება მემკვიდრის დამტკიცების შემდეგ გამოქვეყნდება.', messageButton: 'შეტყობინების დატოვება', formTitle: 'თქვენი სამძიმრის შეტყობინება', formText: 'დამტკიცების შემდეგ გვერდზე გამოჩნდება.', name: 'თქვენი სახელი', namePlaceholder: 'სახელი და გვარი', relation: 'კავშირი', relationPlaceholder: 'მეზობელი, მოსწავლე, ...', message: 'შეტყობინება', messagePlaceholder: 'აქ დაწერეთ სამძიმრის შეტყობინება...', send: 'გაგზავნა', cancel: 'გაუქმება', optional: 'არასავალდებულო', contact: 'კონტაქტი', contactOptional: 'არასავალდებულო · გადაეცემა ოჯახს', contactPlaceholder: 'ელფოსტა ან ტელეფონი', contactHelp: 'კონტაქტი მხოლოდ ოჯახს გადაეცემა და გვერდზე არ გამოჩნდება.', anonymous: 'ანონიმურად გაგრძელება',
    actions: { candle: { emoji: '🕯️', title: 'სანთელს ანთებთ', desc: 'ყოველი სანთელი ერთ მოგონებას ანათებს.', confirmLabel: 'სანთლის დანთება', color: 'amber' }, flower: { emoji: '🌹', title: 'ყვავილს ტოვებთ', desc: 'ყოველი ყვავილი ღრმა პატივისცემის გამოხატულებაა.', confirmLabel: 'ყვავილის დატოვება', color: 'rose' }, prayer: { emoji: '🤲', title: 'ლოცულობთ', desc: 'ყოველი ლოცვა სიყვარულისა და მონატრების გამოძახილია.', confirmLabel: 'ლოცვა', color: 'gold' } }
  },
  ru: {
    title: 'Поделитесь', titleAccent: 'своими чувствами.', candle: 'Зажечь свечу', candleDone: 'Свеча зажжена', flower: 'Оставить цветок', flowerDone: 'Цветок оставлен', prayer: 'Помолиться', prayerDone: 'Молитва отправлена', candleUnit: 'свечей', flowerUnit: 'цветов', prayerUnit: 'молитв', ctaTitle: 'Хотите оставить сообщение с соболезнованием?', ctaText: 'Ваше сообщение будет опубликовано после одобрения наследником.', messageButton: 'Оставить сообщение', formTitle: 'Ваше сообщение с соболезнованием', formText: 'После одобрения оно появится на странице.', name: 'Ваше имя', namePlaceholder: 'Имя и фамилия', relation: 'Связь', relationPlaceholder: 'Сосед, ученик, ...', message: 'Сообщение', messagePlaceholder: 'Напишите соболезнование здесь...', send: 'Отправить', cancel: 'Отмена', optional: 'необязательно', contact: 'Контакт', contactOptional: 'необязательно · передается семье', contactPlaceholder: 'Email или телефон', contactHelp: 'Контактная информация передается только семье и не отображается на странице.', anonymous: 'Продолжить анонимно',
    actions: { candle: { emoji: '🕯️', title: 'Вы зажигаете свечу', desc: 'Каждая свеча освещает одно воспоминание.', confirmLabel: 'Зажечь свечу', color: 'amber' }, flower: { emoji: '🌹', title: 'Вы оставляете цветок', desc: 'Каждый цветок выражает глубокое уважение.', confirmLabel: 'Оставить цветок', color: 'rose' }, prayer: { emoji: '🤲', title: 'Вы молитесь', desc: 'Каждая молитва звучит любовью и тоской.', confirmLabel: 'Помолиться', color: 'gold' } }
  },
}
export default function MemorialInteractions({ condolences }: { condolences: Condolence[] }) {
  const { lang } = useLang()
  const copy = interactionCopy[lang]
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
          copy={copy}
          onConfirm={confirmAction}
          onClose={() => setPendingAction(null)}
        />
      )}

      <section id="taziye" className="border-y border-[#172d25] bg-[#091712] px-5 py-12 text-[#efe7d8] sm:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-7 text-center">
            <div className="flex items-center justify-center gap-3 text-[#c7a76f]">
              <span className="h-px w-10 bg-[#c7a76f]" />
              <span className="text-xs tracking-[0.2em] uppercase">
                {lang === 'tr' ? 'Taziye Defteri' : lang === 'ka' ? 'სამძიმრის წიგნი' : lang === 'ru' ? 'Книга соболезнований' : 'Condolence Book'}
              </span>
              <span className="h-px w-10 bg-[#c7a76f]" />
            </div>
            <h2 className="mt-3 font-serif text-4xl text-white sm:text-5xl">
              {copy.title}<br />
              <span className="text-[#c7a76f]">{copy.titleAccent}</span>
            </h2>
          </div>

          {/* Ä°nteraksiyon butonlarÄ± */}
          <div className="mb-7 grid grid-cols-3 gap-2 sm:gap-3">
            <InteractionButton
              onClick={() => requestAction('candle')}
              active={userLitCandle}
              count={candlesLit}
              label={userLitCandle ? copy.candleDone : copy.candle}
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
              label={userLeftFlower ? copy.flowerDone : copy.flower}
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
              label={userPrayed ? copy.prayerDone : copy.prayer}
              color="gold"
              icon={
                <div className={`transition-transform duration-300 ${userPrayed ? 'scale-110' : ''}`}>
                  <Heart className={`h-7 w-7 sm:h-10 sm:w-10 ${userPrayed ? 'fill-[#b08340] text-[#b08340]' : 'text-[#c7a76f]'}`} />
                </div>
              }
            />
          </div>

          <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0d1412] shadow-2xl shadow-black/25">
              <div className="flex gap-1 border-b border-white/10 bg-white/[0.03] p-2 text-xs font-semibold text-[#cfc3ad]">
                <button className="flex-1 rounded-lg bg-[#c7a76f] px-3 py-2.5 text-[#091712]">
                  {lang === 'tr' ? 'Onaylanmış Mesajlar' : lang === 'ka' ? 'დამტკიცებული' : lang === 'ru' ? 'Одобренные' : 'Approved'}
                </button>
                <button className="flex-1 rounded-lg px-3 py-2.5 transition hover:bg-white/[0.06]">
                  {lang === 'tr' ? 'Bekleyen Mesajlar' : lang === 'ka' ? 'მოლოდინში' : lang === 'ru' ? 'Ожидающие' : 'Pending'}
                </button>
              </div>

              <div className="divide-y divide-white/8">
                {condolences.map((item) => (
                  <div key={item.name} className="p-4 transition hover:bg-white/[0.035] sm:p-5">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#c7a76f]/35 bg-[#f4eee3] text-xs font-semibold text-[#173d31]">
                        {item.name[0]}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                          <div>
                            <div className="font-serif text-base text-white">{item.name}</div>
                            <div className="text-[11px] text-[#8f9f96]">{item.relation} · {item.date}</div>
                          </div>
                          <span className="text-xs text-[#c7a76f]">♥ {item.name.length + 7}</span>
                        </div>
                        <p className="mt-3 text-sm leading-7 text-[#d8ccba]">{item.text}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          {/* Mesaj bÄ±rak CTA / Form */}
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0d1412] shadow-2xl shadow-black/25">
            {!showCondolenceForm ? (
              <div className="flex h-full flex-col justify-between gap-5 p-6 text-center lg:text-left">
                <div>
                  <h3 className="font-serif text-2xl text-white">{copy.ctaTitle}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#b8aa93]">
                    {copy.ctaText}
                  </p>
                  <div className="mt-4 flex flex-wrap justify-center gap-3 text-xs text-[#8f9f96] lg:justify-start">
                    <span className="flex items-center gap-1.5"><Flame className="h-3.5 w-3.5 text-[#b08340]" />{candlesLit} {copy.candleUnit}</span>
                    <span>·</span>
                    <span className="flex items-center gap-1.5"><span>🌹</span>{flowersLeft} {copy.flowerUnit}</span>
                    <span>·</span>
                    <span className="flex items-center gap-1.5"><Heart className="h-3.5 w-3.5 text-[#b08340]" />{prayersSent} {copy.prayerUnit}</span>
                  </div>
                </div>
                <button
                  onClick={() => setShowCondolenceForm(true)}
                  className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-[#c7a76f] px-7 py-3.5 text-sm font-semibold text-[#091712] shadow-lg transition hover:bg-[#d4b87c]"
                >
                  {copy.messageButton}
                  <Feather className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <form className="p-6" onSubmit={(e) => { e.preventDefault(); setShowCondolenceForm(false) }}>
                <h3 className="font-serif text-2xl text-white">{copy.formTitle}</h3>
                <p className="mt-1 text-sm text-[#b8aa93]">{copy.formText}</p>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#8f9f96]">{copy.name}</label>
                    <input type="text" required placeholder={copy.namePlaceholder} className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none placeholder:text-[#6b756f] focus:border-[#c7a76f] focus:ring-2 focus:ring-[#c7a76f]/10" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#8f9f96]">{copy.relation}</label>
                    <input type="text" placeholder={copy.relationPlaceholder} className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none placeholder:text-[#6b756f] focus:border-[#c7a76f] focus:ring-2 focus:ring-[#c7a76f]/10" />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#8f9f96]">{copy.message}</label>
                  <textarea required rows={4} placeholder={copy.messagePlaceholder} className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none placeholder:text-[#6b756f] focus:border-[#c7a76f] focus:ring-2 focus:ring-[#c7a76f]/10" />
                </div>
                <div className="mt-5 flex gap-3">
                  <button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-[#c7a76f] px-7 py-3 text-sm font-semibold text-[#091712] shadow-lg transition hover:bg-[#d4b87c]">
                    {copy.send} <ArrowRight className="h-4 w-4" />
                  </button>
                  <button type="button" onClick={() => setShowCondolenceForm(false)} className="rounded-xl border border-white/10 px-6 py-3 text-sm font-semibold text-[#cfc3ad] transition hover:bg-white/[0.06]">
                    {copy.cancel}
                  </button>
                </div>
              </form>
            )}
          </div>
          </div>
        </div>
      </section>
    </>
  )
}

function ActionModal({
  action,
  copy,
  onConfirm,
  onClose,
}: {
  action: ActionType
  copy: typeof interactionCopy.tr
  onConfirm: (name: string, contact: string) => void
  onClose: () => void
}) {
  const [name, setName] = useState('')
  const [contact, setContact] = useState('')

  if (!action) return null
  const meta = copy.actions[action] as {
    emoji: string
    title: string
    desc: string
    confirmLabel: string
    color: ActionColor
  }

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

          {/* BaÅŸlÄ±k */}
          <div className="text-center">
            <div className="text-5xl">{meta.emoji}</div>
            <h3 className="mt-3 font-serif text-2xl text-[#173d31]">{meta.title}</h3>
            <p className="mt-1 text-sm text-[#665d50]">{meta.desc}</p>
          </div>

          {/* Form */}
          <div className="mt-6 space-y-4">
            <div>
              <label className="mb-1.5 flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-[#665d50]">
                <span>{copy.name}</span>
                <span className="normal-case font-normal text-[#8a7a64]">{copy.optional}</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={copy.namePlaceholder}
                className="w-full rounded-lg border border-[#e1d5c3] bg-white/80 px-4 py-2.5 text-sm text-[#173d31] outline-none focus:border-[#b08340] focus:ring-2 focus:ring-[#b08340]/10"
              />
            </div>
            <div>
              <label className="mb-1.5 flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-[#665d50]">
                <span>{copy.contact}</span>
                <span className="normal-case font-normal text-[#8a7a64]">{copy.contactOptional}</span>
              </label>
              <input
                type="text"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder={copy.contactPlaceholder}
                className="w-full rounded-lg border border-[#e1d5c3] bg-white/80 px-4 py-2.5 text-sm text-[#173d31] outline-none focus:border-[#b08340] focus:ring-2 focus:ring-[#b08340]/10"
              />
              <p className="mt-1.5 text-[11px] text-[#8a7a64]">
                {copy.contactHelp}
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
              {copy.anonymous}
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
  const { lang } = useLang()

  const activeStyles = {
    amber: 'border-[#f59e0b]/45 bg-[#f59e0b]/12',
    rose: 'border-[#f43f5e]/35 bg-[#f43f5e]/10',
    gold: 'border-[#c7a76f]/45 bg-[#c7a76f]/12',
  }

  return (
    <button
      onClick={onClick}
      disabled={active}
      className={`flex flex-col items-center gap-2 rounded-xl border p-3 text-center shadow-sm transition sm:gap-3 sm:p-5 ${
        active
          ? activeStyles[color]
          : 'border-white/10 bg-white/[0.035] hover:border-[#c7a76f]/40 hover:bg-white/[0.055]'
      } ${active ? 'cursor-default' : 'cursor-pointer'}`}
    >
      <div className="flex h-10 items-end justify-center sm:h-16">{icon}</div>
      <div>
        <div className="font-serif text-xl text-white sm:text-2xl">{count.toLocaleString(lang === 'ka' ? 'ka-GE' : lang === 'ru' ? 'ru-RU' : lang === 'en' ? 'en-US' : 'tr-TR')}</div>
        <div className="mt-0.5 text-xs text-[#b8aa93] sm:mt-1">{label}</div>
      </div>
    </button>
  )
}
