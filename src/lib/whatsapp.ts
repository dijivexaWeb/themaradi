// Tek doğruluk kaynağı: WhatsApp işletme numarası.
// Format: ülke kodu + numara, boşluksuz (wa.me linkleri için gerekli).
export const WHATSAPP_PHONE = '995555511884'

export function buildWhatsAppChatLink(message?: string): string {
  const text = message?.trim()
  return text
    ? `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(text)}`
    : `https://wa.me/${WHATSAPP_PHONE}`
}

export function buildWhatsAppOrderLink(opts: {
  senderName: string
  packageLabel: string
  amount: number | string
  currency: string
  vaultName?: string
}): string {
  const { senderName, packageLabel, amount, currency, vaultName } = opts

  const lines = [
    'Merhaba, yeni bir sipariş oluşturdum:',
    `Paket: ${packageLabel}`,
    `Ad: ${senderName}`,
  ]

  if (vaultName) lines.push(`Profil: ${vaultName}`)

  lines.push(`Tutar: ${amount} ${currency}`)
  lines.push('Ödemeyi tamamlamak istiyorum.')

  return buildWhatsAppChatLink(lines.join('\n'))
}
