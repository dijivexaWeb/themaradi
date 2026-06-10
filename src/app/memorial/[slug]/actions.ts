'use server'

import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'

export async function submitObjectionAction(vaultId: string, formData: FormData) {
  const name = (formData.get('name') as string | null)?.trim()
  const phone = (formData.get('phone') as string | null)?.trim()
  const email = (formData.get('email') as string | null)?.trim()
  const message = (formData.get('message') as string | null)?.trim() || null
  const consentEmail = formData.get('consent_email') === 'on'
  const consentPhone = formData.get('consent_phone') === 'on'

  if (!name || !phone || !email) {
    return { success: false, error: 'Ad, telefon ve e-posta alanları zorunludur.' }
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { success: false, error: 'Geçerli bir e-posta adresi girin.' }
  }

  const headersList = await headers()
  const ip = headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null

  const supabase = await createClient()

  const { error } = await supabase.from('memorial_objections').insert({
    vault_id: vaultId,
    name,
    phone,
    email,
    message,
    consent_email: consentEmail,
    consent_phone: consentPhone,
    ip_address: ip,
  })

  if (error) {
    console.error('submitObjectionAction error:', error)
    return { success: false, error: 'Kayıt sırasında bir hata oluştu. Lütfen tekrar deneyin.' }
  }

  return { success: true }
}
