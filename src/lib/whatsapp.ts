// Tek doğruluk kaynağı: WhatsApp işletme numarası.
// Format: ülke kodu + numara, boşluksuz (wa.me linkleri için gerekli).
export const WHATSAPP_PHONE = '995555511884'

export type WhatsAppLocale = 'tr' | 'ka' | 'ru' | 'en'
export type WhatsAppPackageType = 'memorial' | 'family' | 'vault'

function toWhatsAppLocale(locale: string | null | undefined): WhatsAppLocale {
  return locale === 'tr' || locale === 'ka' || locale === 'ru' || locale === 'en' ? locale : 'en'
}

const PACKAGE_LABELS: Record<WhatsAppLocale, Record<WhatsAppPackageType, string>> = {
  tr: { memorial: 'Anma Profili', family: 'Aile Paketi', vault: 'Yaşam Kasası' },
  ka: { memorial: 'ხსოვნის პროფილი', family: 'საოჯახო პაკეტი', vault: 'სიცოცხლის სეიფი' },
  ru: { memorial: 'Профиль памяти', family: 'Семейный пакет', vault: 'Хранилище жизни' },
  en: { memorial: 'Memorial Profile', family: 'Family Package', vault: 'Life Vault' },
}

const ORDER_MESSAGE_STRINGS: Record<WhatsAppLocale, {
  greeting: string
  packageLabel: string
  nameLabel: string
  profileLabel: string
  amountLabel: string
  closing: string
}> = {
  tr: {
    greeting: 'Merhaba, yeni bir sipariş oluşturdum:',
    packageLabel: 'Paket', nameLabel: 'Ad', profileLabel: 'Profil', amountLabel: 'Tutar',
    closing: 'Ödemeyi tamamlamak istiyorum.',
  },
  ka: {
    greeting: 'გამარჯობა, ახალი შეკვეთა შევქმენი:',
    packageLabel: 'პაკეტი', nameLabel: 'სახელი', profileLabel: 'პროფილი', amountLabel: 'თანხა',
    closing: 'მსურს გადახდის დასრულება.',
  },
  ru: {
    greeting: 'Здравствуйте, я оформил(а) новый заказ:',
    packageLabel: 'Пакет', nameLabel: 'Имя', profileLabel: 'Профиль', amountLabel: 'Сумма',
    closing: 'Хочу завершить оплату.',
  },
  en: {
    greeting: 'Hello, I just created a new order:',
    packageLabel: 'Package', nameLabel: 'Name', profileLabel: 'Profile', amountLabel: 'Amount',
    closing: 'I would like to complete the payment.',
  },
}

const PAYMENT_SUBMITTED_STRINGS: Record<WhatsAppLocale, {
  greeting: string
  orderCodeLabel: string
  nameLabel: string
  closing: string
}> = {
  tr: {
    greeting: 'Merhaba, siparişim için ödemeyi tamamladım.',
    orderCodeLabel: 'Sipariş Kodum', nameLabel: 'Adım',
    closing: 'Ödeme doğrulaması için kontrol edebilir misiniz?',
  },
  ka: {
    greeting: 'გამარჯობა, ჩემი შეკვეთისთვის გადახდა დავასრულე.',
    orderCodeLabel: 'შეკვეთის კოდი', nameLabel: 'სახელი',
    closing: 'გთხოვთ, გადაამოწმოთ გადახდის დადასტურება.',
  },
  ru: {
    greeting: 'Здравствуйте, я завершил(а) оплату своего заказа.',
    orderCodeLabel: 'Код заказа', nameLabel: 'Имя',
    closing: 'Пожалуйста, проверьте подтверждение оплаты.',
  },
  en: {
    greeting: 'Hello, I have completed the payment for my order.',
    orderCodeLabel: 'Order Code', nameLabel: 'Name',
    closing: 'Could you please check the payment confirmation?',
  },
}

const ADMIN_REPLY_STRINGS: Record<WhatsAppLocale, (orderCode: string) => string> = {
  tr: (orderCode) => `Merhaba, siparişinizle ilgili size yazıyoruz.\n\nSipariş Kodunuz: ${orderCode}\n\nÖdeme/profil hazırlık süreciniz hakkında yardımcı olabiliriz.`,
  ka: (orderCode) => `გამარჯობა, თქვენს შეკვეთასთან დაკავშირებით გწერთ.\n\nშეკვეთის კოდი: ${orderCode}\n\nშეგვიძლია დაგეხმაროთ გადახდის/პროფილის მომზადების პროცესში.`,
  ru: (orderCode) => `Здравствуйте, пишем вам по поводу вашего заказа.\n\nКод заказа: ${orderCode}\n\nМы можем помочь с оплатой или подготовкой профиля.`,
  en: (orderCode) => `Hello, we're reaching out about your order.\n\nOrder Code: ${orderCode}\n\nWe can help with payment or profile preparation.`,
}

export function buildWhatsAppChatLink(message?: string): string {
  const text = message?.trim()
  return text
    ? `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(text)}`
    : `https://wa.me/${WHATSAPP_PHONE}`
}

export function buildWhatsAppOrderLink(opts: {
  senderName: string
  packageType: WhatsAppPackageType
  amount: number | string
  currency: string
  vaultName?: string
  locale?: string
}): string {
  const { senderName, packageType, amount, currency, vaultName, locale } = opts
  const wl = toWhatsAppLocale(locale)
  const s = ORDER_MESSAGE_STRINGS[wl]

  const lines = [
    s.greeting,
    `${s.packageLabel}: ${PACKAGE_LABELS[wl][packageType]}`,
    `${s.nameLabel}: ${senderName}`,
  ]

  if (vaultName) lines.push(`${s.profileLabel}: ${vaultName}`)

  lines.push(`${s.amountLabel}: ${amount} ${currency}`)
  lines.push(s.closing)

  return buildWhatsAppChatLink(lines.join('\n'))
}

export function buildWhatsAppPaymentSubmittedLink(opts: {
  senderName: string
  orderCode: string
  locale?: string
}): string {
  const { senderName, orderCode, locale } = opts
  const wl = toWhatsAppLocale(locale)
  const s = PAYMENT_SUBMITTED_STRINGS[wl]

  const lines = [
    s.greeting,
    '',
    `${s.orderCodeLabel}: ${orderCode}`,
    `${s.nameLabel}: ${senderName}`,
    '',
    s.closing,
  ]

  return buildWhatsAppChatLink(lines.join('\n'))
}

export function buildWhatsAppAdminReplyLink(opts: {
  phone: string
  orderCode: string
  locale?: string
}): string {
  const { phone, orderCode, locale } = opts
  const wl = toWhatsAppLocale(locale)
  const message = ADMIN_REPLY_STRINGS[wl](orderCode)
  const digits = phone.replace(/[^0-9]/g, '')
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`
}
