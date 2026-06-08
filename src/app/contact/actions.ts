'use server'

import { createServiceClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { verifyTurnstile } from '@/lib/turnstile'

const schema = z.object({
  name: z.string().min(2).max(255),
  email: z.string().email().max(255),
  subject: z.string().min(2).max(255),
  message: z.string().min(10).max(5000),
})

export async function submitContactMessage(
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  const turnstileOk = await verifyTurnstile(formData.get('cf-turnstile-response') as string | null)
  if (!turnstileOk) return { success: false, error: 'CAPTCHA doğrulaması başarısız. Tekrar deneyin.' }

  const parsed = schema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    subject: formData.get('subject'),
    message: formData.get('message'),
  })

  if (!parsed.success) return { success: false, error: 'Geçersiz form verisi' }

  const supabase = await createServiceClient()
  const { error } = await supabase.from('contact_messages').insert({
    name: parsed.data.name,
    email: parsed.data.email,
    subject: parsed.data.subject,
    message: parsed.data.message,
  })

  if (error) return { success: false, error: 'Mesaj gönderilemedi' }
  return { success: true }
}
