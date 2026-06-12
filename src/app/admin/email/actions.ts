'use server'

import { requireAdmin } from '@/lib/admin/auth'
import { createServiceClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/email'
import { testEmail } from '@/lib/email/templates'
import { revalidatePath } from 'next/cache'

export async function saveEmailSettingsAction(formData: FormData): Promise<{ error?: string; success?: boolean }> {
  await requireAdmin()
  const supabase = await createServiceClient()

  const fields = [
    { key: 'email_api_key',              value: (formData.get('email_api_key') as string)?.trim() ?? '' },
    { key: 'email_from_address',         value: (formData.get('email_from_address') as string)?.trim() ?? '' },
    { key: 'email_from_name',            value: (formData.get('email_from_name') as string)?.trim() ?? '' },
    { key: 'email_notify_new_guestbook',  value: formData.get('email_notify_new_guestbook') === 'on' ? 'true' : 'false' },
    { key: 'email_notify_approved',       value: formData.get('email_notify_approved') === 'on' ? 'true' : 'false' },
    { key: 'admin_notification_email',    value: (formData.get('admin_notification_email') as string)?.trim() ?? '' },
  ]

  for (const { key, value } of fields) {
    const { error } = await supabase
      .from('platform_settings')
      .upsert({ key, value }, { onConflict: 'key' })
    if (error) return { error: `${key} kaydedilemedi: ${error.message}` }
  }

  revalidatePath('/admin/email')
  return { success: true }
}

export async function saveTurnstileSettingsAction(formData: FormData): Promise<{ error?: string; success?: boolean }> {
  await requireAdmin()
  const supabase = await createServiceClient()

  const fields = [
    { key: 'turnstile_site_key',   value: (formData.get('turnstile_site_key') as string)?.trim() ?? '' },
    { key: 'turnstile_secret_key', value: (formData.get('turnstile_secret_key') as string)?.trim() ?? '' },
  ]

  for (const { key, value } of fields) {
    const { error } = await supabase
      .from('platform_settings')
      .upsert({ key, value }, { onConflict: 'key' })
    if (error) return { error: `${key} kaydedilemedi: ${error.message}` }
  }

  revalidatePath('/admin/email')
  return { success: true }
}

export async function sendTestEmailAction(formData: FormData): Promise<{ error?: string; success?: boolean }> {
  await requireAdmin()
  const to = (formData.get('test_email') as string)?.trim()
  if (!to) return { error: 'Email adresi gerekli.' }

  const result = await sendEmail({
    to,
    subject: 'The Eternal Memory — Test Emaili',
    html: testEmail('Admin'),
  })

  if (!result.success) return { error: result.error }
  return { success: true }
}
