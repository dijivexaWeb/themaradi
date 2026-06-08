'use server'

import { z } from 'zod'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { verifyTurnstile } from '@/lib/turnstile'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(128),
})

export async function adminLogin(
  _prev: { error: string } | null,
  formData: FormData,
): Promise<{ error: string }> {
  const turnstileToken = formData.get('cf-turnstile-response') as string | null
  const turnstileOk = await verifyTurnstile(turnstileToken)
  if (!turnstileOk) return { error: 'CAPTCHA doğrulaması başarısız. Tekrar deneyin.' }

  // TODO: rate limit — max 5 attempts per IP per 15 min
  const parsed = schema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!parsed.success) {
    return { error: 'Geçersiz giriş bilgileri.' }
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  })

  // Generic error — never reveal whether email exists
  if (error || !data.user) {
    return { error: 'E-posta veya şifre hatalı.' }
  }

  // Verify admin role using service client (bypasses RLS)
  const service = await createServiceClient()
  const { data: profile } = await service
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    // Sign out immediately — non-admin tried admin login
    await supabase.auth.signOut()
    await service.from('admin_audit_logs').insert({
      admin_email: parsed.data.email,
      action: 'ADMIN_LOGIN_REJECTED',
      entity_type: 'auth',
      new_value: { reason: 'role_not_admin' },
    })
    return { error: 'Bu hesabın yönetici yetkisi yok.' }
  }

  // Log successful admin login
  await service.from('admin_audit_logs').insert({
    admin_id: data.user.id,
    admin_email: data.user.email,
    action: 'ADMIN_LOGIN',
    entity_type: 'auth',
  })

  redirect('/admin')
}
