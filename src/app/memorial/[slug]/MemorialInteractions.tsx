'use client'

import React, { useState, useTransition } from 'react'
import { ArrowRight, Feather, Flame, Heart, X } from 'lucide-react'
import { type Lang } from '@/i18n'
import { useLang } from '@/i18n/context'
import { submitCondolenceAction, addReactionAction, reactToEntryAction } from '@/lib/actions/condolences'
import { incrementMemorialActionAction } from '@/lib/actions/memorial-public-actions'
import { ACTION_ICON_MAP, type ActionIcon } from '@/lib/memorial-style-templates'
import TurnstileWidget from '@/components/TurnstileWidget'

export interface CustomAction {
  id: string
  label: string
  icon: string
  show_counter: boolean
  count: number
}

type EntryEmoji = 'heart' | 'pray' | 'smile' | 'cry' | 'dove'

const ENTRY_EMOJIS: { key: EntryEmoji; emoji: string }[] = [
  { key: 'heart', emoji: '❤️' },
  { key: 'pray',  emoji: '🙏' },
  { key: 'smile', emoji: '😊' },
  { key: 'cry',   emoji: '😢' },
  { key: 'dove',  emoji: '🕊️' },
]

interface Condolence {
  id: string
  name: string
  date: string
  relation: string
  text: string
  reactions: Record<EntryEmoji, number>
}

type ActionType = 'candle' | 'flower' | 'prayer' | null
type ConcreteActionType = Exclude<ActionType, null>
type ActionColor = 'amber' | 'rose' | 'gold'

type ActionCopy = {
  readonly emoji: string
  readonly title: string
  readonly desc: string
  readonly confirmLabel: string
  readonly color: ActionColor
}

type InteractionCopy = {
  readonly title: string
  readonly titleAccent: string
  readonly candle: string
  readonly candleDone: string
  readonly flower: string
  readonly flowerDone: string
  readonly prayer: string
  readonly prayerDone: string
  readonly candleUnit: string
  readonly flowerUnit: string
  readonly prayerUnit: string
  readonly ctaTitle: string
  readonly notableCtaTitle: string
  readonly ctaText: string
  readonly notableCtaText: string
  readonly messageButton: string
  readonly formTitle: string
  readonly formText: string
  readonly name: string
  readonly namePlaceholder: string
  readonly relation: string
  readonly relationPlaceholder: string
  readonly message: string
  readonly messagePlaceholder: string
  readonly send: string
  readonly cancel: string
  readonly optional: string
  readonly contact: string
  readonly contactOptional: string
  readonly contactPlaceholder: string
  readonly contactHelp: string
  readonly anonymous: string
  readonly actions: Record<ConcreteActionType, ActionCopy>
}

const interactionCopy: Record<Lang, InteractionCopy> = {
  tr: {
    title: 'Hislerinizi', titleAccent: 'paylaşın.', candle: 'Mum yak', candleDone: 'Mum yaktınız', flower: 'Çiçek bırak', flowerDone: 'Çiçek bıraktınız', prayer: 'Dua et', prayerDone: 'Dua edildi', candleUnit: 'mum', flowerUnit: 'çiçek', prayerUnit: 'dua', ctaTitle: 'Taziye mesajı bırakmak ister misiniz?', notableCtaTitle: 'Saygınızı birkaç cümleyle paylaşabilirsiniz.', ctaText: 'Mesajınız varis onayından geçtikten sonra yayınlanır.', notableCtaText: 'Kısa bir saygı mesajı bırakabilirsiniz.', messageButton: 'Mesaj Bırak', formTitle: 'Taziye mesajınız', formText: 'Onaydan sonra sayfada yayınlanacaktır.', name: 'Adınız', namePlaceholder: 'Adınız Soyadınız', relation: 'Yakınlık', relationPlaceholder: 'Komşusu, Öğrencisi, ...', message: 'Mesajınız', messagePlaceholder: 'Taziye mesajınızı buraya yazın...', send: 'Gönder', cancel: 'Vazgeç', optional: 'opsiyonel', contact: 'İletişim', contactOptional: 'opsiyonel · aileye iletilir', contactPlaceholder: 'E-posta veya telefon', contactHelp: 'İletişim bilgisi yalnızca aile ile paylaşılır, sayfada görünmez.', anonymous: 'Anonim olarak devam et',
    actions: { candle: { emoji: '🕯️', title: 'Mum yakıyorsunuz', desc: 'Yakılan her mum bir hatırayı aydınlatır.', confirmLabel: 'Mumu Yak', color: 'amber' }, flower: { emoji: '🌹', title: 'Çiçek bırakıyorsunuz', desc: 'Bırakılan her çiçek derin bir saygının ifadesidir.', confirmLabel: 'Çiçeği Bırak', color: 'rose' }, prayer: { emoji: '🤲', title: 'Dua ediyorsunuz', desc: 'Her dua bir sevginin, bir özlemin yankısıdır.', confirmLabel: 'Dua Et', color: 'gold' } }
  },
  en: {
    title: 'Share', titleAccent: 'your feelings.', candle: 'Light a candle', candleDone: 'Candle lit', flower: 'Leave a flower', flowerDone: 'Flower left', prayer: 'Say a prayer', prayerDone: 'Prayer sent', candleUnit: 'candles', flowerUnit: 'flowers', prayerUnit: 'prayers', ctaTitle: 'Would you like to leave a condolence message?', notableCtaTitle: 'You may share a few words of tribute.', ctaText: 'Your message will be published after heir approval.', notableCtaText: 'Leave a short message of respect.', messageButton: 'Leave Message', formTitle: 'Your condolence message', formText: 'It will appear on the page after approval.', name: 'Your name', namePlaceholder: 'Your full name', relation: 'Relation', relationPlaceholder: 'Neighbor, student, ...', message: 'Your message', messagePlaceholder: 'Write your condolence message here...', send: 'Send', cancel: 'Cancel', optional: 'optional', contact: 'Contact', contactOptional: 'optional · sent to family', contactPlaceholder: 'Email or phone', contactHelp: 'Contact information is shared only with the family and is not shown on the page.', anonymous: 'Continue anonymously',
    actions: { candle: { emoji: '🕯️', title: 'You are lighting a candle', desc: 'Every candle lights up a memory.', confirmLabel: 'Light Candle', color: 'amber' }, flower: { emoji: '🌹', title: 'You are leaving a flower', desc: 'Every flower is an expression of deep respect.', confirmLabel: 'Leave Flower', color: 'rose' }, prayer: { emoji: '🤲', title: 'You are saying a prayer', desc: 'Every prayer echoes love and longing.', confirmLabel: 'Say Prayer', color: 'gold' } }
  },
  ka: {
    title: 'გააზიარეთ', titleAccent: 'თქვენი გრძნობები.', candle: 'სანთლის დანთება', candleDone: 'სანთელი დაინთო', flower: 'ყვავილის დატოვება', flowerDone: 'ყვავილი დატოვეთ', prayer: 'ლოცვა', prayerDone: 'ლოცვა გაიგზავნა', candleUnit: 'სანთელი', flowerUnit: 'ყვავილი', prayerUnit: 'ლოცვა', ctaTitle: 'გსურთ სამძიმრის შეტყობინების დატოვება?', notableCtaTitle: 'შეგიძლიათ რამდენიმე სიტყვით გამოხატოთ პატივისცემა.', ctaText: 'თქვენი შეტყობინება მემკვიდრის დამტკიცების შემდეგ გამოქვეყნდება.', notableCtaText: 'დატოვეთ მოკლე პატივისცემის გზავნილი.', messageButton: 'შეტყობინების დატოვება', formTitle: 'თქვენი სამძიმრის შეტყობინება', formText: 'დამტკიცების შემდეგ გვერდზე გამოჩნდება.', name: 'თქვენი სახელი', namePlaceholder: 'სახელი და გვარი', relation: 'კავშირი', relationPlaceholder: 'მეზობელი, მოსწავლე, ...', message: 'შეტყობინება', messagePlaceholder: 'აქ დაწერეთ სამძიმრის შეტყობინება...', send: 'გაგზავნა', cancel: 'გაუქმება', optional: 'არასავალდებულო', contact: 'კონტაქტი', contactOptional: 'არასავალდებულო · გადაეცემა ოჯახს', contactPlaceholder: 'ელფოსტა ან ტელეფონი', contactHelp: 'კონტაქტი მხოლოდ ოჯახს გადაეცემა და გვერდზე არ გამოჩნდება.', anonymous: 'ანონიმურად გაგრძელება',
    actions: { candle: { emoji: '🕯️', title: 'სანთელს ანთებთ', desc: 'ყოველი სანთელი ერთ მოგონებას ანათებს.', confirmLabel: 'სანთლის დანთება', color: 'amber' }, flower: { emoji: '🌹', title: 'ყვავილს ტოვებთ', desc: 'ყოველი ყვავილი ღრმა პატივისცემის გამოხატულებაა.', confirmLabel: 'ყვავილის დატოვება', color: 'rose' }, prayer: { emoji: '🤲', title: 'ლოცულობთ', desc: 'ყოველი ლოცვა სიყვარულისა და მონატრების გამოძახილია.', confirmLabel: 'ლოცვა', color: 'gold' } }
  },
  ru: {
    title: 'Поделитесь', titleAccent: 'своими чувствами.', candle: 'Зажечь свечу', candleDone: 'Свеча зажжена', flower: 'Оставить цветок', flowerDone: 'Цветок оставлен', prayer: 'Помолиться', prayerDone: 'Молитва отправлена', candleUnit: 'свечей', flowerUnit: 'цветов', prayerUnit: 'молитв', ctaTitle: 'Хотите оставить сообщение с соболезнованием?', notableCtaTitle: 'Вы можете написать несколько слов уважения.', ctaText: 'Ваше сообщение будет опубликовано после одобрения наследником.', notableCtaText: 'Оставьте короткое сообщение уважения.', messageButton: 'Оставить сообщение', formTitle: 'Ваше сообщение с соболезнованием', formText: 'После одобрения оно появится на странице.', name: 'Ваше имя', namePlaceholder: 'Имя и фамилия', relation: 'Связь', relationPlaceholder: 'Сосед, ученик, ...', message: 'Сообщение', messagePlaceholder: 'Напишите соболезнование здесь...', send: 'Отправить', cancel: 'Отмена', optional: 'необязательно', contact: 'Контакт', contactOptional: 'необязательно · передается семье', contactPlaceholder: 'Email или телефон', contactHelp: 'Контактная информация передается только семье и не отображается на странице.', anonymous: 'Продолжить анонимно',
    actions: { candle: { emoji: '🕯️', title: 'Вы зажигаете свечу', desc: 'Каждая свеча освещает одно воспоминание.', confirmLabel: 'Зажечь свечу', color: 'amber' }, flower: { emoji: '🌹', title: 'Вы оставляете цветок', desc: 'Каждый цветок выражает глубокое уважение.', confirmLabel: 'Оставить цветок', color: 'rose' }, prayer: { emoji: '🤲', title: 'Вы молитесь', desc: 'Каждая молитва звучит любовью и тоской.', confirmLabel: 'Помолиться', color: 'gold' } }
  },
  hy: {
    title: 'Կիսվեք', titleAccent: 'ձեր զգացմունքներով:', candle: 'Վառել մոմ', candleDone: 'Մոմը վառվեց', flower: 'Թողնել ծաղիկ', flowerDone: 'Ծաղիկը թողնված է', prayer: 'Աղոթել', prayerDone: 'Աղոթքն ուղարկվեց', candleUnit: 'մոմ', flowerUnit: 'ծաղիկ', prayerUnit: 'աղոթք', ctaTitle: 'Ցանկանում եք թողնել ցավակցության մեսիջ?', notableCtaTitle: 'Կարող եք կիսվել հարգանքի մի քանի խոսքով:', ctaText: 'Ձեր մեսիջը կհրապարակվի ժառանգորդի հաստատումից հետո:', notableCtaText: 'Թողեք հարգանքի կարճ մեսիջ:', messageButton: 'Թողնել մեսիջ', formTitle: 'Ձեր ցավակցության մեսիջը', formText: 'Հաստատումից հետո կերևա էջում:', name: 'Ձեր անունը', namePlaceholder: 'Ձեր անուն ազգանունը', relation: 'Կապ', relationPlaceholder: 'Հարևան, աշակերտ, ...', message: 'Ձեր մեսիջը', messagePlaceholder: 'Գրեք ձեր ցավակցության մեսիջն այստեղ...', send: 'Ուղարկել', cancel: 'Չեղարկել', optional: 'կամընտիր', contact: 'Կապ', contactOptional: 'կամընտիր · փոխանցվում է ընտանիքին', contactPlaceholder: 'Էլ. փոստ կամ հեռախոս', contactHelp: 'Կոնտակտային տվյալները փոխանցվում են միայն ընտանիքին և չեն երևում էջում:', anonymous: 'Շարունակել անանուն',
    actions: { candle: { emoji: '🕯️', title: 'Դուք վառում եք մոմ', desc: 'Յուրաքանչյուր մոմ լուսավորում է մի հիշողություն:', confirmLabel: 'Վառել մոմը', color: 'amber' }, flower: { emoji: '🌹', title: 'Դուք թողնում եք ծաղիկ', desc: 'Յուրաքանչյուր ծաղիկ խորին հարգանքի արտահայտություն է:', confirmLabel: 'Թողնել ծաղիկը', color: 'rose' }, prayer: { emoji: '🤲', title: 'Դուք աղոթում եք', desc: 'Յուրաքանչյուր աղոթք սերի և կարոտի արձագանք է:', confirmLabel: 'Աղոթել', color: 'gold' } }
  },
}
interface InitialCounts { candle: number; flower: number; prayer: number }

export default function MemorialInteractions({ condolences, vaultId, initialCounts, siteKey = '', customActions = [], isNotable = false }: { condolences: Condolence[]; vaultId?: string; initialCounts?: InitialCounts; siteKey?: string; customActions?: CustomAction[]; isNotable?: boolean }) {
  const { lang } = useLang()
  const copy = interactionCopy[lang]
  const [candlesLit, setCandlesLit] = useState(initialCounts?.candle ?? 0)
  const [flowersLeft, setFlowersLeft] = useState(initialCounts?.flower ?? 0)
  const [prayersSent, setPrayersSent] = useState(initialCounts?.prayer ?? 0)
  const [userLitCandle, setUserLitCandle] = useState(false)
  const [userLeftFlower, setUserLeftFlower] = useState(false)
  const [userPrayed, setUserPrayed] = useState(false)
  const [pendingAction, setPendingAction] = useState<ActionType>(null)

  // Entry emoji reaksiyonları
  const [entryReactions, setEntryReactions] = useState<Record<string, Record<EntryEmoji, number>>>(
    Object.fromEntries(condolences.map(c => [c.id, { ...c.reactions }]))
  )
  const [userEntryReactions, setUserEntryReactions] = useState<Set<string>>(() => {
    if (typeof window === 'undefined') return new Set<string>()
    try {
      const parsed = JSON.parse(localStorage.getItem('gr') ?? '{}') as Record<string, boolean>
      return new Set<string>(Object.keys(parsed).filter(k => parsed[k]))
    } catch (_) {
      return new Set<string>()
    }
  })
  const [, startEntryTransition] = useTransition()

  function handleEntryReaction(entryId: string, emoji: EntryEmoji) {
    const key = `${entryId}_${emoji}`
    const alreadyReacted = userEntryReactions.has(key)
    const delta: 1 | -1 = alreadyReacted ? -1 : 1

    setEntryReactions(prev => ({
      ...prev,
      [entryId]: { ...prev[entryId], [emoji]: Math.max(0, (prev[entryId]?.[emoji] ?? 0) + delta) },
    }))

    const next = new Set(userEntryReactions)
    if (alreadyReacted) { next.delete(key) } else { next.add(key) }
    setUserEntryReactions(next)

    try {
      const stored: Record<string, boolean> = {}
      next.forEach(k => { stored[k] = true })
      localStorage.setItem('gr', JSON.stringify(stored))
    } catch (_) { /* ignore */ }

    startEntryTransition(async () => {
      await reactToEntryAction(entryId, emoji, delta)
    })
  }

  // Custom action buton state'leri
  const [customCounts, setCustomCounts] = useState<Record<string, number>>(
    Object.fromEntries(customActions.map(a => [a.id, a.count]))
  )
  const [clickedActions, setClickedActions] = useState<Set<string>>(new Set())
  const [, startCustomTransition] = useTransition()

  function handleCustomAction(actionId: string) {
    if (clickedActions.has(actionId) || !vaultId) return
    setClickedActions(prev => new Set(prev).add(actionId))
    setCustomCounts(prev => ({ ...prev, [actionId]: (prev[actionId] ?? 0) + 1 }))
    startCustomTransition(async () => {
      await incrementMemorialActionAction(actionId, vaultId)
    })
  }

  const hasCustomActions = customActions.length > 0
  const [showCondolenceForm, setShowCondolenceForm] = useState(false)
  const [formOpenTime, setFormOpenTime] = useState('')
  const [submitDone, setSubmitDone] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [, startReactTransition] = useTransition()

  function requestAction(type: ActionType) {
    if (type === 'candle' && userLitCandle) return
    if (type === 'flower' && userLeftFlower) return
    if (type === 'prayer' && userPrayed) return
    setPendingAction(type)
  }

  function confirmAction(name: string, contact: string) {
    const type = pendingAction
    if (!type) return
    if (type === 'candle') { setUserLitCandle(true); setCandlesLit((n) => n + 1) }
    if (type === 'flower') { setUserLeftFlower(true); setFlowersLeft((n) => n + 1) }
    if (type === 'prayer') { setUserPrayed(true); setPrayersSent((n) => n + 1) }
    setPendingAction(null)
    void name; void contact
    if (vaultId) {
      startReactTransition(async () => { await addReactionAction(vaultId, type) })
    }
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
                {isNotable
                  ? (lang === 'tr' ? 'Saygı Defteri' : lang === 'ka' ? 'პატივისცემის წიგნი' : lang === 'ru' ? 'Книга Уважения' : lang === 'hy' ? 'Հարգանքի գիրք' : 'Book of Tribute')
                  : (lang === 'tr' ? 'Taziye Defteri' : lang === 'ka' ? 'სამძიმრის წიგნი' : lang === 'ru' ? 'Книга соболезнований' : lang === 'hy' ? 'Ցավակցության գիրք' : 'Condolence Book')
                }
              </span>
              <span className="h-px w-10 bg-[#c7a76f]" />
            </div>
            <h2 className="mt-3 font-serif text-4xl text-white sm:text-5xl">
              {isNotable
                ? (lang === 'tr' ? 'Saygı ve' : lang === 'ka' ? 'პატივისცემისა და' : lang === 'ru' ? 'Пространство' : lang === 'hy' ? 'Հարգանքի և' : 'A space of')
                : (lang === 'tr' ? 'Sevenlerinin' : lang === 'ka' ? 'საყვარელი ადამიანების' : lang === 'ru' ? 'Словами' : lang === 'hy' ? 'Սիրելիների' : 'With words of')
              }<br />
              <span className="text-[#c7a76f]">
                {isNotable
                  ? (lang === 'tr' ? 'minnettarlığınızı.' : lang === 'ka' ? 'მადლიერების სივრცე.' : lang === 'ru' ? 'уважения и благодарности.' : lang === 'hy' ? 'երախտագիտության տարածք:' : 'respect and gratitude.')
                  : (lang === 'tr' ? 'sözleriyle.' : lang === 'ka' ? 'სიტყვებით.' : lang === 'ru' ? 'любящих.' : lang === 'hy' ? 'խոսքերով:' : 'loved ones.')
                }
              </span>
            </h2>
          </div>

          {/* Anma aksiyonları — özel butonlar veya varsayılan 3 */}
          {hasCustomActions ? (
            <div className={`mb-7 grid gap-2 sm:gap-3 ${
              customActions.length <= 2 ? 'grid-cols-2' :
              customActions.length === 3 ? 'grid-cols-3' :
              customActions.length === 4 ? 'grid-cols-2 sm:grid-cols-4' :
              'grid-cols-3 sm:grid-cols-5'
            }`}>
              {customActions.map((action) => {
                const clicked = clickedActions.has(action.id)
                const count = customCounts[action.id] ?? action.count
                const emoji = ACTION_ICON_MAP[action.icon as ActionIcon] ?? action.icon
                return (
                  <button
                    key={action.id}
                    onClick={() => handleCustomAction(action.id)}
                    disabled={clicked}
                    className={`group flex flex-col items-center gap-2 rounded-2xl border px-3 py-5 text-center transition-all duration-200 ${
                      clicked
                        ? 'border-[#c7a76f] bg-[#c7a76f]/10 cursor-default'
                        : 'border-white/10 bg-[#0d1412] hover:border-[#c7a76f]/40 hover:bg-white/[0.05] active:scale-95'
                    }`}
                  >
                    <span className={`text-3xl transition-transform duration-300 sm:text-4xl ${clicked ? 'scale-110' : 'group-hover:scale-105'}`}>
                      {emoji}
                    </span>
                    <span className={`text-xs font-semibold sm:text-sm ${clicked ? 'text-[#c7a76f]' : 'text-[#cfc3ad]'}`}>
                      {clicked ? '✓ ' : ''}{action.label}
                    </span>
                    {action.show_counter && (
                      <span className="text-[11px] tabular-nums text-[#8f9f96]">
                        {count.toLocaleString()}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          ) : (
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
          )}

          <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0d1412] shadow-2xl shadow-black/25">
              <div className="border-b border-white/10 bg-white/[0.03] px-4 py-3 text-xs font-semibold text-[#cfc3ad]">
                {isNotable
                  ? (lang === 'tr' ? 'Saygı mesajları.' : lang === 'ka' ? 'პატივისცემის შეტყობინებები.' : lang === 'ru' ? 'Сообщения уважения.' : lang === 'hy' ? 'Հարգանքի մեսիջներ:' : 'Messages of tribute.')
                  : (lang === 'tr' ? 'Sevenlerinin sözleriyle.' : lang === 'ka' ? 'საყვარელი ადამიანების სიტყვებით.' : lang === 'ru' ? 'Словами любящих.' : lang === 'hy' ? 'Սիրելիների խոսքերով:' : 'With words of loved ones.')}
              </div>

              <div className="divide-y divide-white/8">
                {condolences.map((item) => {
                  const rxns = entryReactions[item.id] ?? item.reactions
                  const totalReactions = Object.values(rxns).reduce((a, b) => a + b, 0)
                  return (
                    <div key={item.id} className="p-4 sm:p-5">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#c7a76f]/35 bg-[#f4eee3] text-xs font-semibold text-[#173d31]">
                          {item.name[0]}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-baseline justify-between gap-2">
                            <div>
                              <div className="font-serif text-base text-white">{item.name}</div>
                              <div className="text-[11px] text-[#8f9f96]">{item.relation}{item.relation ? ' · ' : ''}{item.date}</div>
                            </div>
                            {totalReactions > 0 && (
                              <span className="text-xs text-[#c7a76f]/70">{totalReactions} tepki</span>
                            )}
                          </div>
                          <p className="mt-3 text-sm leading-7 text-[#d8ccba]">{item.text}</p>

                          {/* Emoji reaksiyon barı */}
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {ENTRY_EMOJIS.map(({ key, emoji }) => {
                              const count = rxns[key] ?? 0
                              const active = userEntryReactions.has(`${item.id}_${key}`)
                              return (
                                <button
                                  key={key}
                                  type="button"
                                  onClick={() => handleEntryReaction(item.id, key)}
                                  className={`flex items-center gap-1 rounded-full border px-2.5 py-1 text-sm transition-all duration-150 active:scale-90 ${
                                    active
                                      ? 'border-[#c7a76f]/60 bg-[#c7a76f]/15 text-[#c7a76f]'
                                      : 'border-white/10 bg-white/[0.04] text-[#8f9f96] hover:border-white/25 hover:bg-white/[0.08]'
                                  }`}
                                >
                                  <span>{emoji}</span>
                                  {count > 0 && <span className="text-[11px] font-medium">{count}</span>}
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

          {/* Mesaj bÄ±rak CTA / Form */}
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0d1412] shadow-2xl shadow-black/25">
            {submitDone ? (
              <div className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center">
                <div className="text-4xl">🕊️</div>
                <h3 className="font-serif text-xl text-white">Mesajınız alındı</h3>
                <p className="text-sm text-[#b8aa93]">Varis onayından geçtikten sonra sayfada yayınlanacaktır.</p>
              </div>
            ) : !showCondolenceForm ? (
              <div className="flex h-full flex-col justify-between gap-5 p-6 text-center lg:text-left">
                <div>
                  <h3 className="font-serif text-2xl text-white">{isNotable ? copy.notableCtaTitle : copy.ctaTitle}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#b8aa93]">
                    {isNotable ? copy.notableCtaText : copy.ctaText}
                  </p>
                  {hasCustomActions ? (
                    <div className="mt-4 flex flex-wrap justify-center gap-3 text-xs text-[#8f9f96] lg:justify-start">
                      {customActions.filter(a => a.show_counter).map((a, i) => (
                        <React.Fragment key={a.id}>
                          {i > 0 && <span>·</span>}
                          <span className="flex items-center gap-1.5">
                            <span>{ACTION_ICON_MAP[a.icon as ActionIcon] ?? a.icon}</span>{customCounts[a.id] ?? a.count} {a.label.toLowerCase()}
                          </span>
                        </React.Fragment>
                      ))}
                    </div>
                  ) : (
                  <div className="mt-4 flex flex-wrap justify-center gap-3 text-xs text-[#8f9f96] lg:justify-start">
                    <span className="flex items-center gap-1.5"><Flame className="h-3.5 w-3.5 text-[#b08340]" />{candlesLit} {copy.candleUnit}</span>
                    <span>·</span>
                    <span className="flex items-center gap-1.5"><span>🌹</span>{flowersLeft} {copy.flowerUnit}</span>
                    <span>·</span>
                    <span className="flex items-center gap-1.5"><Heart className="h-3.5 w-3.5 text-[#b08340]" />{prayersSent} {copy.prayerUnit}</span>
                  </div>
                  )}
                </div>
                <button
                  onClick={() => { setShowCondolenceForm(true); setFormOpenTime(Date.now().toString()) }}
                  className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-[#c7a76f] px-7 py-3.5 text-sm font-semibold text-[#091712] shadow-lg transition hover:bg-[#d4b87c]"
                >
                  {copy.messageButton}
                  <Feather className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <form
                className="p-6"
                onSubmit={(e) => {
                  e.preventDefault()
                  if (!vaultId) { setShowCondolenceForm(false); return }
                  const fd = new FormData(e.currentTarget)
                  setSubmitError(null)
                  startTransition(async () => {
                    const result = await submitCondolenceAction(vaultId, fd)
                    if (result.error) { setSubmitError(result.error) } else { setSubmitDone(true) }
                  })
                }}
              >
                {/* Spam koruması: honeypot + zaman damgası */}
                <input type="text" name="_hp" defaultValue="" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: 'absolute', left: '-9999px', opacity: 0, height: 0 }} />
                <input type="hidden" name="_t" value={formOpenTime} />
                <h3 className="font-serif text-2xl text-white">{copy.formTitle}</h3>
                <p className="mt-1 text-sm text-[#b8aa93]">{copy.formText}</p>
                {submitError && (
                  <p className="mt-2 rounded-lg bg-red-900/30 px-3 py-2 text-xs text-red-300">{submitError}</p>
                )}
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#8f9f96]">{copy.name}</label>
                    <input name="author_name" type="text" required placeholder={copy.namePlaceholder} className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none placeholder:text-[#6b756f] focus:border-[#c7a76f] focus:ring-2 focus:ring-[#c7a76f]/10" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#8f9f96]">{copy.relation}</label>
                    <input name="relation" type="text" placeholder={copy.relationPlaceholder} className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none placeholder:text-[#6b756f] focus:border-[#c7a76f] focus:ring-2 focus:ring-[#c7a76f]/10" />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#8f9f96]">{copy.message}</label>
                  <textarea name="message" required rows={4} placeholder={copy.messagePlaceholder} className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none placeholder:text-[#6b756f] focus:border-[#c7a76f] focus:ring-2 focus:ring-[#c7a76f]/10" />
                </div>
                <TurnstileWidget siteKey={siteKey} />

                <div className="mt-5 flex gap-3">
                  <button type="submit" disabled={isPending} className="inline-flex items-center gap-2 rounded-xl bg-[#c7a76f] px-7 py-3 text-sm font-semibold text-[#091712] shadow-lg transition hover:bg-[#d4b87c] disabled:opacity-60">
                    {isPending ? '...' : copy.send} <ArrowRight className="h-4 w-4" />
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
  copy: InteractionCopy
  onConfirm: (name: string, contact: string) => void
  onClose: () => void
}) {
  const [name, setName] = useState('')
  const [contact, setContact] = useState('')

  if (!action) return null
  const meta = copy.actions[action]

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
        <div className="font-serif text-xl text-white sm:text-2xl">{count.toLocaleString(lang === 'ka' ? 'ka-GE' : lang === 'ru' ? 'ru-RU' : lang === 'en' ? 'en-US' : lang === 'hy' ? 'hy-AM' : 'tr-TR')}</div>
        <div className="mt-0.5 text-xs text-[#b8aa93] sm:mt-1">{label}</div>
      </div>
    </button>
  )
}
