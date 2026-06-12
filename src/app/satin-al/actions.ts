'use server'

import { createClient, createServiceClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { fetchPricingConfig } from '@/lib/pricing'
import { sendEmail, getAdminNotificationEmail } from '@/lib/email'
import { memorialSignupConfirmEmail, vaultSignupConfirmEmail, adminNewRegistrationEmail } from '@/lib/email/templates'
import { headers } from 'next/headers'

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
  const phone = (formData.get('phone') as string)?.trim()
  const emailConsent = formData.get('email_consent') === 'on'
  const phoneConsent = formData.get('phone_consent') === 'on'

  if (!displayName) return { error: 'Anma profili sahibinin adı zorunludur' }
  if (!senderName) return { error: 'Ad Soyad zorunludur' }
  if (!senderEmail || !senderEmail.includes('@')) return { error: 'Geçerli bir e-posta girin' }
  if (!phone) return { error: 'Telefon numarası zorunludur' }
  if (!emailConsent) return { error: 'E-posta bilgilendirme iznini onaylamanız gerekmektedir' }
  if (!phoneConsent) return { error: 'Telefon araması iznini onaylamanız gerekmektedir' }

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

  // Profiles: telefon dahil upsert
  const hdrs = await headers()
  const consentIp = hdrs.get('x-forwarded-for')?.split(',')[0]?.trim() || hdrs.get('x-real-ip') || null

  if (pendingEmailConfirmation) {
    await service.from('profiles').upsert(
      { id: user.id, full_name: senderName, email: senderEmail, phone },
      { onConflict: 'id', ignoreDuplicates: false }
    )
  } else {
    await service.from('profiles').update({ phone }).eq('id', user.id)
  }

  // KVKK rıza kaydı
  await service.from('user_consents').insert({
    user_id: user.id,
    email_consent: emailConsent,
    phone_consent: phoneConsent,
    consent_ip: consentIp,
    consent_version: 'v1.0',
    source: 'purchase_memorial',
  })

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
    notes: `Gönderen: ${senderName} <${senderEmail}> | Tel: ${phone}`,
  })
  if (paymentErr) return { error: 'Ödeme kaydı oluşturulamadı: ' + paymentErr.message }

  // Admin bildirim emaili
  try {
    const adminEmail = await getAdminNotificationEmail()
    if (adminEmail) {
      await sendEmail({
        to: adminEmail,
        subject: `[The Eternal Memory] Yeni kayıt — ${senderName}`,
        html: adminNewRegistrationEmail({
          senderName, senderEmail, phone,
          productType: 'memorial_one_time',
          vaultName: displayName,
          paymentMethod: 'bank_transfer',
          amount,
          adminUrl: `${SITE_URL}/admin/kasa`,
        }),
      })
    }
  } catch (e) {
    console.error('[purchaseMemorialAction] admin notify error:', e)
  }

  if (pendingEmailConfirmation && confirmUrl) {
    try {
      await sendEmail({
        to: senderEmail,
        subject: `Anma sayfanızı oluşturun — The Eternal Memory`,
        html: memorialSignupConfirmEmail({ authorName: senderName, vaultName: displayName, confirmUrl }),
      })
    } catch (e) {
      console.error('[purchaseMemorialAction] confirm email error:', e)
    }
    return { emailConfirmationSent: true as const, email: senderEmail }
  }

  redirect(`/anma-paneli/${vault.id}?purchased=1`)
}

export async function purchaseVaultAction(_prev: unknown, formData: FormData) {
  const supabase = await createClient()
  const service = await createServiceClient()

  const displayName = (formData.get('display_name') as string)?.trim()
  const senderName = (formData.get('sender_name') as string)?.trim()
  const senderEmail = (formData.get('sender_email') as string)?.trim().toLowerCase()
  const phone = (formData.get('phone') as string)?.trim()
  const emailConsent = formData.get('email_consent') === 'on'
  const phoneConsent = formData.get('phone_consent') === 'on'

  if (!displayName) return { error: 'Anı alanı adı zorunludur' }
  if (!senderName) return { error: 'Ad Soyad zorunludur' }
  if (!senderEmail || !senderEmail.includes('@')) return { error: 'Geçerli bir e-posta girin' }
  if (!phone) return { error: 'Telefon numarası zorunludur' }
  if (!emailConsent) return { error: 'E-posta bilgilendirme iznini onaylamanız gerekmektedir' }
  if (!phoneConsent) return { error: 'Telefon araması iznini onaylamanız gerekmektedir' }

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

  const hdrs2 = await headers()
  const consentIp2 = hdrs2.get('x-forwarded-for')?.split(',')[0]?.trim() || hdrs2.get('x-real-ip') || null

  if (pendingEmailConfirmation) {
    await service.from('profiles').upsert(
      { id: user.id, full_name: senderName, email: senderEmail, phone },
      { onConflict: 'id', ignoreDuplicates: false }
    )
  } else {
    await service.from('profiles').update({ phone }).eq('id', user.id)
  }

  await service.from('user_consents').insert({
    user_id: user.id,
    email_consent: emailConsent,
    phone_consent: phoneConsent,
    consent_ip: consentIp2,
    consent_version: 'v1.0',
    source: 'purchase_vault',
  })

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
    notes: `Gönderen: ${senderName} <${senderEmail}> | Tel: ${phone}`,
  })
  if (paymentErr) return { error: 'Ödeme kaydı oluşturulamadı: ' + paymentErr.message }

  // Admin bildirim emaili
  try {
    const adminEmail = await getAdminNotificationEmail()
    if (adminEmail) {
      await sendEmail({
        to: adminEmail,
        subject: `[The Eternal Memory] Yeni kayıt — ${senderName}`,
        html: adminNewRegistrationEmail({
          senderName, senderEmail, phone,
          productType: 'vault_setup',
          vaultName: displayName,
          paymentMethod: 'bank_transfer',
          amount: setupAmount,
          adminUrl: `${SITE_URL}/admin/kasa`,
        }),
      })
    }
  } catch (e) {
    console.error('[purchaseVaultAction] admin notify error:', e)
  }

  if (pendingEmailConfirmation && confirmUrl) {
    try {
      await sendEmail({
        to: senderEmail,
        subject: `Hesabınızı doğrulayın — The Eternal Memory`,
        html: vaultSignupConfirmEmail({ authorName: senderName, confirmUrl }),
      })
    } catch (e) {
      console.error('[purchaseVaultAction] confirm email error:', e)
    }
    return { emailConfirmationSent: true as const, email: senderEmail }
  }

  redirect(`/dashboard/vault/${vault.id}?purchased=1`)
}

// ─── PayPal Link Flow ────────────────────────────────────────────────────────
// Vault + pending payment oluşturur, redirect etmez — PayPal link göstermek için

export async function createVaultForPayPalAction(
  _prev: unknown,
  formData: FormData
) {
  const supabase = await createClient()
  const service = await createServiceClient()

  const productType = (formData.get('product_type') as string) ?? 'memorial_one_time'
  const displayName = (formData.get('display_name') as string)?.trim()
  const senderName  = (formData.get('sender_name') as string)?.trim()
  const senderEmail = (formData.get('sender_email') as string)?.trim().toLowerCase()
  const phone       = (formData.get('phone') as string)?.trim()
  const emailConsent = formData.get('email_consent') === 'on'
  const phoneConsent = formData.get('phone_consent') === 'on'

  if (!displayName) return { error: 'İsim zorunludur' }
  if (!senderName)  return { error: 'Ad Soyad zorunludur' }
  if (!senderEmail || !senderEmail.includes('@')) return { error: 'Geçerli bir e-posta girin' }
  if (!phone)       return { error: 'Telefon numarası zorunludur' }
  if (!emailConsent || !phoneConsent) return { error: 'İzinler onaylanmalıdır' }

  const authResult = await getOrCreatePurchaseUser(supabase, service, formData, senderName, senderEmail)
  if ('error' in authResult) return { error: authResult.error }

  const user = authResult.user
  const pendingEmailConfirmation = 'pendingEmailConfirmation' in authResult
  const confirmUrl = 'confirmUrl' in authResult ? authResult.confirmUrl : undefined

  const hdrs = await headers()
  const consentIp = hdrs.get('x-forwarded-for')?.split(',')[0]?.trim() || hdrs.get('x-real-ip') || null

  if (pendingEmailConfirmation) {
    await service.from('profiles').upsert(
      { id: user.id, full_name: senderName, email: senderEmail, phone },
      { onConflict: 'id', ignoreDuplicates: false }
    )
  } else {
    await service.from('profiles').update({ phone }).eq('id', user.id)
  }

  await service.from('user_consents').insert({
    user_id: user.id,
    email_consent: emailConsent,
    phone_consent: phoneConsent,
    consent_ip: consentIp,
    consent_version: 'v1.0',
    source: `purchase_${productType}_paypal`,
  })

  const pricing = await fetchPricingConfig()
  const isMemorial = productType === 'memorial_one_time'
  const amount = isMemorial
    ? (pricing.campaignActive && pricing.campaignMemorial ? Number(pricing.campaignMemorial) : Number(pricing.memorialPrice))
    : (pricing.campaignActive && pricing.campaignVaultSetup ? Number(pricing.campaignVaultSetup) : Number(pricing.vaultSetup))

  const baseSlug = slugify(displayName)
  const slug = `${baseSlug}-${Date.now().toString(36)}`

  const dbClient = pendingEmailConfirmation ? service : supabase

  const { data: vault, error: vaultErr } = await dbClient.from('vaults').insert({
    owner_id: user.id,
    display_name: displayName,
    slug,
    status: 'pending_verification',
    product_type: isMemorial ? 'memorial_profile' : 'life_vault',
    vault_origin: isMemorial ? 'family' : 'self',
  }).select('id').single()

  if (vaultErr || !vault) return { error: 'Vault oluşturulamadı: ' + vaultErr?.message }

  const dueDate = new Date()
  dueDate.setDate(dueDate.getDate() + 3)

  await service.from('payments').insert({
    vault_id: vault.id,
    user_id: user.id,
    amount,
    currency: 'GEL',
    product_type: productType,
    status: 'pending',
    payment_method: 'paypal',
    due_date: dueDate.toISOString().split('T')[0],
    notes: `PayPal ödeme bekleniyor — ${senderName} <${senderEmail}>`,
  })

  // Admin bildirim emaili
  try {
    const adminEmail = await getAdminNotificationEmail()
    if (adminEmail) {
      await sendEmail({
        to: adminEmail,
        subject: `[The Eternal Memory] Yeni kayıt (PayPal) — ${senderName}`,
        html: adminNewRegistrationEmail({
          senderName, senderEmail, phone,
          productType: isMemorial ? 'memorial_one_time' : 'vault_setup',
          vaultName: displayName,
          paymentMethod: 'paypal',
          amount,
          adminUrl: `${SITE_URL}/admin/kasa`,
        }),
      })
    }
  } catch (e) {
    console.error('[createVaultForPayPalAction] admin notify error:', e)
  }

  if (pendingEmailConfirmation && confirmUrl) {
    try {
      await sendEmail({
        to: senderEmail,
        subject: isMemorial
          ? 'Anma sayfanızı oluşturun — The Eternal Memory'
          : 'Hesabınızı doğrulayın — The Eternal Memory',
        html: isMemorial
          ? memorialSignupConfirmEmail({ authorName: senderName, vaultName: displayName, confirmUrl })
          : vaultSignupConfirmEmail({ authorName: senderName, confirmUrl }),
      })
    } catch (e) {
      console.error('[createVaultForPayPalAction] email error:', e)
    }
  }

  return {
    paypalReady: true as const,
    amount,
    vaultId: vault.id,
    pendingEmailConfirmation,
    email: senderEmail,
  }
}
