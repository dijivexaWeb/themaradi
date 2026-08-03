'use server'

import { verifyTurnstile } from '@/lib/turnstile'
import { createClient } from '@/lib/supabase/server'
import { getLoginRedirectUrl } from '@/lib/login-redirect'

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
  const rawIdentifier = (formData.get('email') as string || '').trim().toLowerCase()
  const password = formData.get('password') as string
  // Toplu içe aktarımdan gelen kullanıcılar gerçek email değil, kendilerine
  // verilen kullanıcı adını girer (örn. "ahmet.yilmaz"). Supabase Auth email
  // zorunlu tuttuğu için arka planda görünmez bir teknik email'e çevriliyor.
  // Gerçek email ile giren organik kullanıcılar bundan hiç etkilenmez.
  const email = rawIdentifier.includes('@')
    ? rawIdentifier
    : `${rawIdentifier}@claim.theeternalmemory.com`

  // 1. Verify Turnstile if token is present
  const turnstileToken = formData.get('cf-turnstile-response') as string | null
  if (turnstileToken) {
    const ok = await verifyTurnstile(turnstileToken)
    if (!ok) {
      return { success: false, errorType: 'captcha' }
    }
  }

  if (!rawIdentifier || !password) {
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

  // 3. Yönlendirme URL'sini belirle (aile sayfası öncelikli, yoksa otomatik oluştur)
  const redirectUrl = await getLoginRedirectUrl(supabase, data.user.id)
  return { success: true, redirectUrl }
}

