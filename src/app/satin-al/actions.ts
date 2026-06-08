'use server'

import { createClient, createServiceClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { fetchPricingConfig } from '@/lib/pricing'
import { sendEmail } from '@/lib/email'
import { memorialSignupConfirmEmail, vaultSignupConfirmEmail } from '@/lib/email/templates'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://theeternalmemory.com'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/ş/g, 's').replace(/ğ/g, 'g').replace(/ü/g, 'u')
    .replace(/ö/g, 'o').replace(/ı/g, 'i').replace(/ç/g, 'c')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 50)
}

async function getOrCreatePurchaseUser(
  supabase: Awaited<ReturnType<typeof createClient>>,
  service: Awaited<ReturnType<typeof createServiceClient>>,
  formData: FormData,
  senderName: string,
  senderEmail: string
) {
  const { data: { user: currentUser } } = await supabase.auth.getUser()
  if (currentUser) return { user: currentUser }

  const password = (formData.get('password') as string)?.trim()
  const passwordConfirm = (formData.get('password_confirm') as string)?.trim()

  if (!password || password.length < 6) return { error: 'Şifre en az 6 karakter olmalıdır' }
  if (password !== passwordConfirm) return { error: 'Şifreler eşleşmiyor' }

  // generateLink: kullanıcıyı oluşturur + onay linki üretir, Supabase email göndermez
  const { data: linkData, error: linkError } = await service.auth.admin.generateLink({
    type: 'signup',
    email: senderEmail,
    password,
    options: {
      data: { full_name: senderName },
      redirectTo: `${SITE_URL}/auth/callback`,
    },
  })

  if (!linkError && linkData?.user && linkData?.properties?.action_link) {
    return {
      user: linkData.user,
      pendingEmailConfirmation: true as const,
      confirmUrl: linkData.properties.action_link,
    }
  }

  // generateLink başarısız — kullanıcı onaylı olarak zaten varsa giriş yap
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email: senderEmail, password })
  if (signInError || !signInData.user) {
    return { error: 'Bu email kayıtlı. Şifrenizi kontrol edin veya giriş yapın.' }
  }

  return { user: signInData.user }
}

export async function purchaseMemorialAction(_prev: unknown, formData: FormData) {
  const supabase = await createClient()
  const service = await createServiceClient()

  const displayName = (formData.get('display_name') as string)?.trim()
  const senderName = (formData.get('sender_name') as string)?.trim()
  const senderEmail = (formData.get('sender_email') as string)?.trim().toLowerCase()

  if (!displayName) return { error: 'Anma profili sahibinin adı zorunludur' }
  if (!senderName) return { error: 'Ad Soyad zorunludur' }
  if (!senderEmail || !senderEmail.includes('@')) return { error: 'Geçerli bir e-posta girin' }

  const authResult = await getOrCreatePurchaseUser(supabase, service, formData, senderName, senderEmail)
  if ('error' in authResult) return { error: authResult.error }

  const user = authResult.user
  const pendingEmailConfirmation = 'pendingEmailConfirmation' in authResult
  const confirmUrl = 'confirmUrl' in authResult ? authResult.confirmUrl : undefined

  const pricing = await fetchPricingConfig()
  const amount = pricing.campaignActive && pricing.campaignMemorial
    ? Number(pricing.campaignMemorial)
    : Number(pricing.memorialPrice)

  const baseSlug = slugify(displayName)
  const slug = `${baseSlug}-${Date.now().toString(36)}`

  if (pendingEmailConfirmation) {
    // generateLink trigger'ı tetikliyor ama yedek olarak profiles upsert
    await service.from('profiles').upsert(
      { id: user.id, full_name: senderName, email: senderEmail },
      { onConflict: 'id', ignoreDuplicates: true }
    )
  }

  const dbClient = pendingEmailConfirmation ? service : supabase

  const { data: vault, error: vaultErr } = await dbClient.from('vaults').insert({
    owner_id: user.id,
    display_name: displayName,
    slug,
    status: 'pending_verification',
    product_type: 'memorial_profile',
    vault_origin: 'family',
  }).select('id').single()

  if (vaultErr || !vault) return { error: 'Vault oluşturulamadı: ' + vaultErr?.message }

  const dueDate = new Date()
  dueDate.setDate(dueDate.getDate() + 3)

  const { error: paymentErr } = await service.from('payments').insert({
    vault_id: vault.id,
    user_id: user.id,
    amount,
    currency: 'GEL',
    product_type: 'memorial_one_time',
    status: 'pending',
    payment_method: 'bank_transfer',
    due_date: dueDate.toISOString().split('T')[0],
    notes: `Gönderen: ${senderName} <${senderEmail}>`,
  })
  if (paymentErr) return { error: 'Ödeme kaydı oluşturulamadı: ' + paymentErr.message }

  if (pendingEmailConfirmation && confirmUrl) {
    sendEmail({
      to: senderEmail,
      subject: `Anma sayfanızı oluşturun — The Eternal Memory`,
      html: memorialSignupConfirmEmail({ authorName: senderName, vaultName: displayName, confirmUrl }),
    }).catch(e => console.error('[purchaseMemorialAction] confirm email error:', e))
    return { emailConfirmationSent: true as const, email: senderEmail }
  }

  redirect(`/dashboard/vault/${vault.id}?purchased=1`)
}

export async function purchaseVaultAction(_prev: unknown, formData: FormData) {
  const supabase = await createClient()
  const service = await createServiceClient()

  const displayName = (formData.get('display_name') as string)?.trim()
  const senderName = (formData.get('sender_name') as string)?.trim()
  const senderEmail = (formData.get('sender_email') as string)?.trim().toLowerCase()

  if (!displayName) return { error: 'Anı alanı adı zorunludur' }
  if (!senderName) return { error: 'Ad Soyad zorunludur' }
  if (!senderEmail || !senderEmail.includes('@')) return { error: 'Geçerli bir e-posta girin' }

  const authResult = await getOrCreatePurchaseUser(supabase, service, formData, senderName, senderEmail)
  if ('error' in authResult) return { error: authResult.error }

  const user = authResult.user
  const pendingEmailConfirmation = 'pendingEmailConfirmation' in authResult
  const confirmUrl = 'confirmUrl' in authResult ? authResult.confirmUrl : undefined

  const pricing = await fetchPricingConfig()
  const setupAmount = pricing.campaignActive && pricing.campaignVaultSetup
    ? Number(pricing.campaignVaultSetup)
    : Number(pricing.vaultSetup)

  const baseSlug = slugify(displayName)
  const slug = `${baseSlug}-${Date.now().toString(36)}`

  if (pendingEmailConfirmation) {
    await service.from('profiles').upsert(
      { id: user.id, full_name: senderName, email: senderEmail },
      { onConflict: 'id', ignoreDuplicates: true }
    )
  }

  const dbClient = pendingEmailConfirmation ? service : supabase

  const { data: vault, error: vaultErr } = await dbClient.from('vaults').insert({
    owner_id: user.id,
    display_name: displayName,
    slug,
    status: 'pending_verification',
    product_type: 'life_vault',
    vault_origin: 'self',
  }).select('id').single()

  if (vaultErr || !vault) return { error: 'Vault oluşturulamadı: ' + vaultErr?.message }

  const dueDate = new Date()
  dueDate.setDate(dueDate.getDate() + 3)

  const { error: paymentErr } = await service.from('payments').insert({
    vault_id: vault.id,
    user_id: user.id,
    amount: setupAmount,
    currency: 'GEL',
    product_type: 'vault_setup',
    status: 'pending',
    payment_method: 'bank_transfer',
    due_date: dueDate.toISOString().split('T')[0],
    notes: `Gönderen: ${senderName} <${senderEmail}>`,
  })
  if (paymentErr) return { error: 'Ödeme kaydı oluşturulamadı: ' + paymentErr.message }

  if (pendingEmailConfirmation && confirmUrl) {
    sendEmail({
      to: senderEmail,
      subject: `Hesabınızı doğrulayın — The Eternal Memory`,
      html: vaultSignupConfirmEmail({ authorName: senderName, confirmUrl }),
    }).catch(e => console.error('[purchaseVaultAction] confirm email error:', e))
    return { emailConfirmationSent: true as const, email: senderEmail }
  }

  redirect(`/dashboard/vault/${vault.id}?purchased=1`)
}
