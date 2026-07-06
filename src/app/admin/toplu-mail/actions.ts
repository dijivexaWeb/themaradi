'use server'

import { requireAdmin } from '@/lib/admin/auth'
import { logAdminAction } from '@/lib/admin/audit'
import { createServiceClient } from '@/lib/supabase/server'
import { Resend } from 'resend'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MAX_RECIPIENTS = 300

export interface BulkEmailResult {
  email: string
  success: boolean
  error?: string
}

export interface BulkEmailSummary {
  error?: string
  sent?: number
  failed?: number
  results?: BulkEmailResult[]
}

export async function sendBulkEmailAction(_prev: unknown, formData: FormData): Promise<BulkEmailSummary> {
  const { user, profile } = await requireAdmin()
  const supabase = await createServiceClient()

  const rawRecipients = (formData.get('recipients') as string) ?? ''
  const subject = (formData.get('subject') as string)?.trim()
  const body = (formData.get('body') as string)?.trim()

  if (!subject || !body) return { error: 'Konu ve içerik zorunludur.' }

  const recipients = [...new Set(
    rawRecipients
      .split(/[\n,;]/)
      .map((e) => e.trim())
      .filter(Boolean)
  )]

  if (recipients.length === 0) return { error: 'En az bir e-posta adresi gerekli.' }
  if (recipients.length > MAX_RECIPIENTS) {
    return { error: `Tek seferde en fazla ${MAX_RECIPIENTS} adrese gönderilebilir (${recipients.length} girildi).` }
  }

  const invalid = recipients.filter((e) => !EMAIL_RE.test(e))
  if (invalid.length > 0) {
    return { error: `Geçersiz e-posta adresi: ${invalid.slice(0, 5).join(', ')}${invalid.length > 5 ? '...' : ''}` }
  }

  const { data: settings } = await supabase
    .from('platform_settings')
    .select('key, value')
    .in('key', ['email_api_key', 'email_from_name', 'email_from_address'])

  const s = Object.fromEntries((settings ?? []).map((r) => [r.key, r.value]))
  if (!s.email_api_key) return { error: 'Resend API key yapılandırılmamış (Email Ayarları sayfasından ekleyin).' }

  const fromName = s.email_from_name || 'The Eternal Memory'
  const fromAddress = s.email_from_address || 'info@theeternalmemory.com'
  const resend = new Resend(s.email_api_key)

  // Resend'in limiti saniyede 10 istek — tek tek, aralarında gecikmeyle gönderiyoruz
  // (paralel/toplu gönderim bu limiti anında aşıyordu). Rate-limit hatası alınırsa
  // birkaç kez otomatik tekrar deneniyor.
  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))
  const isRateLimitError = (msg: string) => /rate limit|too many requests/i.test(msg)

  async function sendOne(email: string): Promise<BulkEmailResult> {
    const maxAttempts = 4
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const { error } = await resend.emails.send({
          from: `${fromName} <${fromAddress}>`,
          to: [email],
          subject,
          html: body.replace(/\n/g, '<br>'),
        })
        if (!error) return { email, success: true }
        if (isRateLimitError(error.message) && attempt < maxAttempts) {
          await sleep(1500 * attempt)
          continue
        }
        return { email, success: false, error: error.message }
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Bilinmeyen hata'
        if (isRateLimitError(msg) && attempt < maxAttempts) {
          await sleep(1500 * attempt)
          continue
        }
        return { email, success: false, error: msg }
      }
    }
    return { email, success: false, error: 'Tekrar denemeler tükendi' }
  }

  const results: BulkEmailResult[] = []
  for (const email of recipients) {
    results.push(await sendOne(email))
    await sleep(250) // ~4 istek/saniye — Resend'in 10/sn limitinin altında güvenli marj
  }

  const sent = results.filter((r) => r.success).length
  const failed = results.filter((r) => !r.success).length

  await logAdminAction({
    adminId: user.id,
    adminEmail: user.email ?? profile.email ?? '',
    action: 'bulk_email_sent',
    entityType: 'bulk_email',
    newValue: { subject, recipientCount: recipients.length, sent, failed },
  })

  return { sent, failed, results }
}
