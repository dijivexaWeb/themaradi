import { Resend } from 'resend'
import { createServiceClient } from '@/lib/supabase/server'

export interface EmailPayload {
  to: string | string[]
  subject: string
  html: string
  replyTo?: string
}

async function getEmailSettings() {
  const supabase = await createServiceClient()
  const { data } = await supabase
    .from('platform_settings')
    .select('key, value')
    .in('key', ['email_api_key', 'email_from_address', 'email_from_name', 'email_provider', 'admin_notification_email'])

  const s = Object.fromEntries((data ?? []).map((r) => [r.key, r.value]))
  return {
    apiKey: s.email_api_key as string | undefined,
    fromAddress: (s.email_from_address as string) || 'noreply@theeternalmemory.com',
    fromName: (s.email_from_name as string) || 'The Eternal Memory',
    adminEmail: (s.admin_notification_email as string) || null,
  }
}

export async function getAdminNotificationEmail(): Promise<string | null> {
  const { adminEmail } = await getEmailSettings()
  return adminEmail
}

export async function sendEmail(payload: EmailPayload): Promise<{ success: boolean; error?: string }> {
  const { apiKey, fromAddress, fromName } = await getEmailSettings()

  if (!apiKey) {
    console.warn('[sendEmail] API key not configured — skipping email send')
    return { success: false, error: 'Email API key yapılandırılmamış.' }
  }

  const resend = new Resend(apiKey)
  const from = `${fromName} <${fromAddress}>`

  const { error } = await resend.emails.send({
    from,
    to: Array.isArray(payload.to) ? payload.to : [payload.to],
    subject: payload.subject,
    html: payload.html,
    replyTo: payload.replyTo,
  })

  if (error) {
    console.error('[sendEmail] Resend error:', error)
    return { success: false, error: error.message }
  }

  return { success: true }
}

export async function isNotificationEnabled(key: string): Promise<boolean> {
  const supabase = await createServiceClient()
  const { data } = await supabase
    .from('platform_settings')
    .select('value')
    .eq('key', key)
    .single()
  return data?.value === 'true'
}
