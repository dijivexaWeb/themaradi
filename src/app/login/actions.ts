'use server'

import { verifyTurnstile } from '@/lib/turnstile'
import { createClient } from '@/lib/supabase/server'

export async function checkTurnstileAction(token: string): Promise<{ ok: boolean }> {
  const ok = await verifyTurnstile(token)
  return { ok }
}

export async function userLogin(
  _prev: any,
  formData: FormData
): Promise<{
  success: boolean
  redirectUrl?: string
  error?: string
  errorType?: 'unconfirmed' | 'captcha' | 'generic'
}> {
  const email = (formData.get('email') as string || '').trim().toLowerCase()
  const password = formData.get('password') as string

  // 1. Verify Turnstile if token is present
  const turnstileToken = formData.get('cf-turnstile-response') as string | null
  if (turnstileToken) {
    const ok = await verifyTurnstile(turnstileToken)
    if (!ok) {
      return { success: false, errorType: 'captcha' }
    }
  }

  if (!email || !password) {
    return { success: false, errorType: 'generic', error: 'Lütfen tüm alanları doldurun.' }
  }

  // 2. Authenticate user
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error || !data.user) {
    const isUnconfirmed =
      error?.message.toLowerCase().includes('not confirmed') ||
      error?.code === 'email_not_confirmed'
    return {
      success: false,
      errorType: isUnconfirmed ? 'unconfirmed' : 'generic',
      error: error?.message || 'E-posta veya şifre hatalı.',
    }
  }

  // 3. Query user's vault to determine redirect URL
  const { data: vault } = await supabase
    .from('vaults')
    .select('id, product_type')
    .eq('owner_id', data.user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  let redirectUrl = '/dashboard'
  if (vault?.product_type === 'memorial_profile') {
    redirectUrl = `/anma-paneli/${vault.id}`
  } else if (vault?.product_type === 'life_vault') {
    redirectUrl = `/dashboard/vault/${vault.id}`
  }

  return { success: true, redirectUrl }
}

