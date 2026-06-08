'use server'

import { requireAdmin } from '@/lib/admin/auth'
import { createServiceClient } from '@/lib/supabase/server'
import { Resend } from 'resend'
import { revalidatePath } from 'next/cache'
import crypto from 'crypto'

export async function markEmailStatusAction(id: string, status: 'read' | 'archived'): Promise<{ error?: string }> {
  await requireAdmin()
  const supabase = await createServiceClient()
  const { error } = await supabase.from('inbound_emails').update({ status }).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin/inbox')
  return {}
}

export async function toggleFlagAction(id: string, current: boolean): Promise<{ error?: string }> {
  await requireAdmin()
  const supabase = await createServiceClient()
  const { error } = await supabase.from('inbound_emails').update({ is_flagged: !current }).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin/inbox')
  return {}
}

export async function setFollowUpAction(
  id: string,
  isFollowingUp: boolean,
  note?: string
): Promise<{ error?: string }> {
  await requireAdmin()
  const supabase = await createServiceClient()
  const { error } = await supabase.from('inbound_emails').update({
    is_following_up: isFollowingUp,
    follow_up_note: isFollowingUp ? (note ?? null) : null,
  }).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin/inbox')
  return {}
}

export async function sendInboxReplyAction(
  id: string,
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  await requireAdmin()
  const supabase = await createServiceClient()

  const toEmail = (formData.get('to_email') as string)?.trim()
  const subject = (formData.get('subject') as string)?.trim()
  const body = (formData.get('body') as string)?.trim()
  const fromInbox = (formData.get('from_inbox') as string)?.trim()

  if (!toEmail || !subject || !body) return { error: 'Tüm alanlar zorunludur.' }

  const { data: settings } = await supabase
    .from('platform_settings')
    .select('key, value')
    .in('key', ['email_api_key', 'email_from_name'])

  const s = Object.fromEntries((settings ?? []).map((r) => [r.key, r.value]))
  if (!s.email_api_key) return { error: 'Resend API key yapılandırılmamış.' }

  const fromName = s.email_from_name || 'The Eternal Memory'
  const fromAddress = `${fromInbox}@theeternalmemory.com`

  const resend = new Resend(s.email_api_key)
  const { error: sendError } = await resend.emails.send({
    from: `${fromName} <${fromAddress}>`,
    to: [toEmail],
    subject,
    html: body,
    replyTo: fromAddress,
  })

  if (sendError) return { error: sendError.message }

  // Yanıt kaydı + thread_id yoksa yeni thread oluştur
  const { data: email } = await supabase
    .from('inbound_emails')
    .select('thread_id')
    .eq('id', id)
    .single()

  const threadId = email?.thread_id ?? crypto.randomUUID()

  await supabase.from('inbound_emails').update({
    status: 'read',
    replied_at: new Date().toISOString(),
    reply_subject: subject,
    reply_body_html: body,
    thread_id: threadId,
    is_following_up: false,
  }).eq('id', id)

  revalidatePath('/admin/inbox')
  return { success: true }
}

export async function regenerateWebhookSecretAction(): Promise<{ error?: string; secret?: string }> {
  await requireAdmin()
  const supabase = await createServiceClient()

  const secret = crypto.randomBytes(24).toString('hex')
  const { error } = await supabase
    .from('platform_settings')
    .upsert({ key: 'inbound_webhook_secret', value: secret }, { onConflict: 'key' })

  if (error) return { error: error.message }
  revalidatePath('/admin/email')
  revalidatePath('/admin/inbox')
  return { secret }
}
