'use server'

import { createClient, createServiceClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { fetchPricingConfig } from '@/lib/pricing'

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
  formData: FormData,
  senderName: string,
  senderEmail: string
) {
  const { data: { user: currentUser } } = await supabase.auth.getUser()
  if (currentUser) return { user: currentUser }

  const password = (formData.get('password') as string)?.trim()
  const passwordConfirm = (formData.get('password_confirm') as string)?.trim()

  if (!password || password.length < 6) {
    return { error: 'Şifre en az 6 karakter olmalıdır' }
  }

  if (password !== passwordConfirm) {
    return { error: 'Şifreler eşleşmiyor' }
  }

  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: senderEmail,
    password,
    options: {
      data: { full_name: senderName },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3010'}/auth/callback`,
    },
  })

  if (!signUpError && signUpData.user) {
    if (!signUpData.session) {
      return {
        error: 'Hesap oluşturuldu ama oturum açılamadı. Supabase Auth ayarlarından e-posta onayını kapatın veya giriş ekranından şifreyle giriş yapın.',
      }
    }
    return { user: signUpData.user }
  }

  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email: senderEmail,
    password,
  })

  if (signInError || !signInData.user) {
    return { error: signUpError?.message ?? signInError?.message ?? 'Hesap oluşturulamadı' }
  }

  return { user: signInData.user }
}

export async function purchaseMemorialAction(_prev: unknown, formData: FormData) {
  const supabase = await createClient()
  const displayName = (formData.get('display_name') as string)?.trim()
  const senderName = (formData.get('sender_name') as string)?.trim()
  const senderEmail = (formData.get('sender_email') as string)?.trim().toLowerCase()

  if (!displayName) return { error: 'Anma profili sahibinin adı zorunludur' }
  if (!senderName) return { error: 'Ad Soyad zorunludur' }
  if (!senderEmail || !senderEmail.includes('@')) return { error: 'Geçerli bir e-posta girin' }

  const authResult = await getOrCreatePurchaseUser(supabase, formData, senderName, senderEmail)
  if ('error' in authResult) return { error: authResult.error }
  const user = authResult.user

  const pricing = await fetchPricingConfig()
  const amount = pricing.campaignActive && pricing.campaignMemorial
    ? Number(pricing.campaignMemorial)
    : Number(pricing.memorialPrice)

  const baseSlug = slugify(displayName)
  const slug = `${baseSlug}-${Date.now().toString(36)}`

  const { data: vault, error: vaultErr } = await supabase.from('vaults').insert({
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

  const service = await createServiceClient()
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

  redirect(`/dashboard/vault/${vault.id}?purchased=1`)
}

export async function purchaseVaultAction(_prev: unknown, formData: FormData) {
  const supabase = await createClient()
  const displayName = (formData.get('display_name') as string)?.trim()
  const senderName = (formData.get('sender_name') as string)?.trim()
  const senderEmail = (formData.get('sender_email') as string)?.trim().toLowerCase()

  if (!displayName) return { error: 'Anı alanı adı zorunludur' }
  if (!senderName) return { error: 'Ad Soyad zorunludur' }
  if (!senderEmail || !senderEmail.includes('@')) return { error: 'Geçerli bir e-posta girin' }

  const authResult = await getOrCreatePurchaseUser(supabase, formData, senderName, senderEmail)
  if ('error' in authResult) return { error: authResult.error }
  const user = authResult.user

  const pricing = await fetchPricingConfig()
  const setupAmount = pricing.campaignActive && pricing.campaignVaultSetup
    ? Number(pricing.campaignVaultSetup)
    : Number(pricing.vaultSetup)

  const baseSlug = slugify(displayName)
  const slug = `${baseSlug}-${Date.now().toString(36)}`

  const { data: vault, error: vaultErr } = await supabase.from('vaults').insert({
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

  const service = await createServiceClient()
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

  redirect(`/dashboard/vault/${vault.id}?purchased=1`)
}
