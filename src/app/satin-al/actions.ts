'use server'

import { createClient, createServiceClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { fetchPricingConfig } from '@/lib/pricing'
import { sendEmail, getAdminNotificationEmail } from '@/lib/email'
import { memorialSignupConfirmEmail, vaultSignupConfirmEmail, adminNewRegistrationEmail, orderCreatedEmail, orderCreatedEmailSubject } from '@/lib/email/templates'
import { headers, cookies } from 'next/headers'
import { buildWhatsAppOrderLink } from '@/lib/whatsapp'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://theeternalmemory.com'

const ORDER_LOCALES = ['tr', 'ka', 'ru', 'en', 'az', 'hy', 'he'] as const

function normalizeOrderLocale(value: string | null | undefined): string {
  return ORDER_LOCALES.includes(value as typeof ORDER_LOCALES[number]) ? (value as string) : 'tr'
}

// Kullanıcıya ayrıca sorulmuyor — sipariş anında sitenin gezindiği dil (tm_lang cookie) order_locale olarak kullanılır
async function detectOrderLocale(): Promise<string> {
  const cookieStore = await cookies()
  return normalizeOrderLocale(cookieStore.get('tm_lang')?.value)
}

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

  // Bu email zaten kayıtlı mı? (onaylanmamış hesaplar için generateLink hata vermez ve
  // sessizce ikinci bir vault oluşturmaya izin verirdi — bu yüzden önce açıkça kontrol ediyoruz)
  const { data: existingProfile } = await service
    .from('profiles')
    .select('id')
    .eq('email', senderEmail)
    .maybeSingle()

  if (existingProfile) {
    return {
      error: 'Bu e-posta adresiyle zaten bir hesabınız var. Ek bir profil eklemek için lütfen önce giriş yapın.',
      existingAccount: true as const,
    }
  }

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

  // generateLink başarısız oldu — bu email zaten kayıtlı demektir. Anonim (oturum açılmamış)
  // checkout akışında sessizce o hesaba giriş yapıp İKİNCİ bir vault/sipariş oluşturmuyoruz —
  // aynı e-postayla defalarca kayıt açılmasını önlemek için kullanıcıyı girişe yönlendiriyoruz.
  // Ek profil eklemek isteyen kullanıcı önce giriş yapmalı (o zaman currentUser dolu gelir ve
  // bu fonksiyonun en başındaki "if (currentUser) return" dalı devreye girer).
  return {
    error: 'Bu e-posta adresiyle zaten bir hesabınız var. Ek bir profil eklemek için lütfen önce giriş yapın.',
    existingAccount: true as const,
  }
}

export async function purchaseMemorialAction(_prev: unknown, formData: FormData) {
  const supabase = await createClient()
  const service = await createServiceClient()

  const senderName = (formData.get('sender_name') as string)?.trim()
  const senderEmail = (formData.get('sender_email') as string)?.trim().toLowerCase()
  const phone = (formData.get('phone') as string)?.trim()
  const shippingAddress: string | null = null
  const profileFor: string | null = null
  const profileLanguage = await detectOrderLocale()
  // Ayrı bir onay kutusu yok — "Sipariş Kodumu Oluştur" butonuna tıklanması Aydınlatma Metni'nin
  // okunduğu ve bilgilerin kullanılmasının kabul edildiği anlamına gelir (implicitConsentNote metniyle bildiriliyor)
  const consentAck = true
  const privacyNoticeAck = consentAck
  const dataProcessingConsent = consentAck
  const marketingPermission = formData.get('marketing_permission') === 'on'

  // Vefat eden kişinin adı bu ekranda sorulmuyor — ödeme sonrası kullanıcı panelinde (biyografi adımı) girilecek
  const displayName = 'İsimsiz Anma Profili'

  if (!senderName) return { error: 'Ad Soyad zorunludur' }
  if (!senderEmail || !senderEmail.includes('@')) return { error: 'Geçerli bir e-posta girin' }
  if (!phone) return { error: 'Telefon numarası zorunludur' }

  const authResult = await getOrCreatePurchaseUser(supabase, service, formData, senderName, senderEmail)
  if ('error' in authResult) return { error: authResult.error, existingAccount: 'existingAccount' in authResult }

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
    email_consent: dataProcessingConsent,
    phone_consent: dataProcessingConsent,
    privacy_notice_ack: privacyNoticeAck,
    data_processing_consent: dataProcessingConsent,
    marketing_permission: marketingPermission,
    consent_language: profileLanguage,
    user_agent: hdrs.get('user-agent'),
    accepted_at: new Date().toISOString(),
    consent_ip: consentIp,
    consent_version: 'v2.0',
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
    shipping_address: shippingAddress || null,
  }).select('id').single()

  if (vaultErr || !vault) return { error: 'Vault oluşturulamadı: ' + vaultErr?.message }

  const dueDate = new Date()
  dueDate.setDate(dueDate.getDate() + 3)

  const { data: payment, error: paymentErr } = await service.from('payments').insert({
    vault_id: vault.id,
    user_id: user.id,
    amount,
    currency: 'GEL',
    product_type: 'memorial_one_time',
    status: 'pending',
    payment_method: 'whatsapp',
    order_locale: profileLanguage,
    profile_for: profileFor,
    due_date: dueDate.toISOString().split('T')[0],
    notes: `Gönderen: ${senderName} <${senderEmail}> | Tel: ${phone}`,
  }).select('id, order_code').single()
  if (paymentErr || !payment) return { error: 'Ödeme kaydı oluşturulamadı: ' + paymentErr?.message }

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
          paymentMethod: 'whatsapp',
          amount,
          adminUrl: `${SITE_URL}/admin/kasa`,
        }),
      })
    }
  } catch (e) {
    console.error('[purchaseMemorialAction] admin notify error:', e)
  }

  // Sipariş oluşturuldu maili (müşteri)
  try {
    await sendEmail({
      to: senderEmail,
      subject: orderCreatedEmailSubject(profileLanguage),
      html: orderCreatedEmail({
        recipientName: senderName,
        orderCode: payment.order_code,
        paymentUrl: `${SITE_URL}/satin-al/odeme/${payment.id}`,
        locale: profileLanguage,
      }),
    })
  } catch (e) {
    console.error('[purchaseMemorialAction] order created email error:', e)
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
  }

  const waLink = buildWhatsAppOrderLink({
    senderName,
    packageType: 'memorial',
    amount,
    currency: '₾',
    vaultName: displayName,
    locale: profileLanguage,
  })

  redirect(`/satin-al/odeme/${payment.id}?type=anma&name=${encodeURIComponent(senderName)}&wa=${encodeURIComponent(waLink)}${pendingEmailConfirmation ? '&pending_email=1' : ''}`)
}

export async function purchaseVaultAction(_prev: unknown, formData: FormData) {
  const supabase = await createClient()
  const service = await createServiceClient()

  const displayName = (formData.get('display_name') as string)?.trim()
  const senderName = (formData.get('sender_name') as string)?.trim()
  const senderEmail = (formData.get('sender_email') as string)?.trim().toLowerCase()
  const phone = (formData.get('phone') as string)?.trim()
  const profileLanguage = await detectOrderLocale()
  // Ayrı bir onay kutusu yok — "Sipariş Kodumu Oluştur" butonuna tıklanması Aydınlatma Metni'nin
  // okunduğu ve bilgilerin kullanılmasının kabul edildiği anlamına gelir (implicitConsentNote metniyle bildiriliyor)
  const consentAck = true
  const privacyNoticeAck = consentAck
  const dataProcessingConsent = consentAck
  const marketingPermission = formData.get('marketing_permission') === 'on'

  if (!displayName) return { error: 'Anı alanı adı zorunludur' }
  if (!senderName) return { error: 'Ad Soyad zorunludur' }
  if (!senderEmail || !senderEmail.includes('@')) return { error: 'Geçerli bir e-posta girin' }
  if (!phone) return { error: 'Telefon numarası zorunludur' }

  const authResult = await getOrCreatePurchaseUser(supabase, service, formData, senderName, senderEmail)
  if ('error' in authResult) return { error: authResult.error, existingAccount: 'existingAccount' in authResult }

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
    email_consent: dataProcessingConsent,
    phone_consent: dataProcessingConsent,
    privacy_notice_ack: privacyNoticeAck,
    data_processing_consent: dataProcessingConsent,
    marketing_permission: marketingPermission,
    consent_language: profileLanguage,
    user_agent: hdrs2.get('user-agent'),
    accepted_at: new Date().toISOString(),
    consent_ip: consentIp2,
    consent_version: 'v2.0',
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

  const { data: payment, error: paymentErr } = await service.from('payments').insert({
    vault_id: vault.id,
    user_id: user.id,
    amount: setupAmount,
    currency: 'GEL',
    product_type: 'vault_setup',
    status: 'pending',
    payment_method: 'whatsapp',
    order_locale: profileLanguage,
    due_date: dueDate.toISOString().split('T')[0],
    notes: `Gönderen: ${senderName} <${senderEmail}> | Tel: ${phone}`,
  }).select('id, order_code').single()
  if (paymentErr || !payment) return { error: 'Ödeme kaydı oluşturulamadı: ' + paymentErr?.message }

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
          paymentMethod: 'whatsapp',
          amount: setupAmount,
          adminUrl: `${SITE_URL}/admin/kasa`,
        }),
      })
    }
  } catch (e) {
    console.error('[purchaseVaultAction] admin notify error:', e)
  }

  // Sipariş oluşturuldu maili (müşteri)
  try {
    await sendEmail({
      to: senderEmail,
      subject: orderCreatedEmailSubject(profileLanguage),
      html: orderCreatedEmail({
        recipientName: senderName,
        orderCode: payment.order_code,
        paymentUrl: `${SITE_URL}/satin-al/odeme/${payment.id}`,
        locale: profileLanguage,
      }),
    })
  } catch (e) {
    console.error('[purchaseVaultAction] order created email error:', e)
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
  }

  const waLink = buildWhatsAppOrderLink({
    senderName,
    packageType: 'vault',
    amount: setupAmount,
    currency: '₾',
    vaultName: displayName,
    locale: profileLanguage,
  })

  redirect(`/satin-al/odeme/${payment.id}?type=kasa&name=${encodeURIComponent(senderName)}&wa=${encodeURIComponent(waLink)}${pendingEmailConfirmation ? '&pending_email=1' : ''}`)
}

export async function purchaseFamilyAction(_prev: unknown, formData: FormData) {
  const supabase = await createClient()
  const service = await createServiceClient()

  const familyName = (formData.get('family_name') as string)?.trim()
  const senderName = (formData.get('sender_name') as string)?.trim()
  const senderEmail = (formData.get('sender_email') as string)?.trim().toLowerCase()
  const phone = (formData.get('phone') as string)?.trim()
  const shippingAddress: string | null = null
  const profileFor: string | null = null
  const profileLanguage = await detectOrderLocale()
  // Ayrı bir onay kutusu yok — "Sipariş Kodumu Oluştur" butonuna tıklanması Aydınlatma Metni'nin
  // okunduğu ve bilgilerin kullanılmasının kabul edildiği anlamına gelir (implicitConsentNote metniyle bildiriliyor)
  const consentAck = true
  const privacyNoticeAck = consentAck
  const dataProcessingConsent = consentAck
  const marketingPermission = formData.get('marketing_permission') === 'on'

  if (!familyName) return { error: 'Aile/topluluk adı zorunludur' }
  if (!senderName) return { error: 'Ad Soyad zorunludur' }
  if (!senderEmail || !senderEmail.includes('@')) return { error: 'Geçerli bir e-posta girin' }
  if (!phone) return { error: 'Telefon numarası zorunludur' }

  const authResult = await getOrCreatePurchaseUser(supabase, service, formData, senderName, senderEmail)
  if ('error' in authResult) return { error: authResult.error, existingAccount: 'existingAccount' in authResult }

  const user = authResult.user
  const pendingEmailConfirmation = 'pendingEmailConfirmation' in authResult
  const confirmUrl = 'confirmUrl' in authResult ? authResult.confirmUrl : undefined

  const pricing = await fetchPricingConfig()
  const amount = pricing.campaignActive && pricing.campaignFamilyGel
    ? Number(pricing.campaignFamilyGel)
    : Number(pricing.familyGel)

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
    email_consent: dataProcessingConsent,
    phone_consent: dataProcessingConsent,
    privacy_notice_ack: privacyNoticeAck,
    data_processing_consent: dataProcessingConsent,
    marketing_permission: marketingPermission,
    consent_language: profileLanguage,
    user_agent: hdrs.get('user-agent'),
    accepted_at: new Date().toISOString(),
    consent_ip: consentIp,
    consent_version: 'v2.0',
    source: 'purchase_family',
  })

  const baseSlug = slugify(familyName)
  const slug = `${baseSlug}-${Date.now().toString(36)}`

  const dbClient = pendingEmailConfirmation ? service : supabase

  const { data: family, error: familyErr } = await dbClient
    .from('memorial_families')
    .insert({
      name: familyName,
      slug,
      owner_id: user.id,
      is_public: false,
    })
    .select('id')
    .single()

  if (familyErr || !family) return { error: 'Aile sayfası oluşturulamadı: ' + familyErr?.message }

  const dueDate = new Date()
  dueDate.setDate(dueDate.getDate() + 3)

  const { data: payment, error: paymentErr } = await service.from('payments').insert({
    family_id: family.id,
    user_id: user.id,
    amount,
    currency: 'GEL',
    order_locale: profileLanguage,
    profile_for: profileFor,
    product_type: 'family_package',
    status: 'pending',
    payment_method: 'whatsapp',
    due_date: dueDate.toISOString().split('T')[0],
    notes: `Aile paketi — ${familyName} | Gönderen: ${senderName} <${senderEmail}> | Tel: ${phone}${shippingAddress ? ` | Adres: ${shippingAddress}` : ''}`,
  }).select('id, order_code').single()
  if (paymentErr || !payment) return { error: 'Ödeme kaydı oluşturulamadı: ' + paymentErr?.message }

  try {
    const adminEmail = await getAdminNotificationEmail()
    if (adminEmail) {
      await sendEmail({
        to: adminEmail,
        subject: `[The Eternal Memory] Aile Paketi — ${senderName}`,
        html: adminNewRegistrationEmail({
          senderName, senderEmail, phone,
          productType: 'family_package',
          vaultName: familyName,
          paymentMethod: 'whatsapp',
          amount,
          adminUrl: `${SITE_URL}/admin/kasa`,
        }),
      })
    }
  } catch (e) {
    console.error('[purchaseFamilyAction] admin notify error:', e)
  }

  // Sipariş oluşturuldu maili (müşteri)
  try {
    await sendEmail({
      to: senderEmail,
      subject: orderCreatedEmailSubject(profileLanguage),
      html: orderCreatedEmail({
        recipientName: senderName,
        orderCode: payment.order_code,
        paymentUrl: `${SITE_URL}/satin-al/odeme/${payment.id}`,
        locale: profileLanguage,
      }),
    })
  } catch (e) {
    console.error('[purchaseFamilyAction] order created email error:', e)
  }

  if (pendingEmailConfirmation && confirmUrl) {
    try {
      await sendEmail({
        to: senderEmail,
        subject: `Aile Anma Sayfanızı oluşturun — The Eternal Memory`,
        html: memorialSignupConfirmEmail({ authorName: senderName, vaultName: familyName, confirmUrl }),
      })
    } catch (e) {
      console.error('[purchaseFamilyAction] confirm email error:', e)
    }
  }

  const waLink = buildWhatsAppOrderLink({
    senderName,
    packageType: 'family',
    amount,
    currency: '₾',
    vaultName: familyName,
    locale: profileLanguage,
  })

  redirect(`/satin-al/odeme/${payment.id}?type=aile&name=${encodeURIComponent(senderName)}&wa=${encodeURIComponent(waLink)}${pendingEmailConfirmation ? '&pending_email=1' : ''}`)
}
