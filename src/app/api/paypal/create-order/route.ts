import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { fetchPricingConfig } from '@/lib/pricing'
import { createOrder } from '@/lib/paypal'
import { headers } from 'next/headers'

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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      productType: 'memorial_one_time' | 'vault_setup'
      displayName: string
      senderName: string
      senderEmail: string
      password?: string
      phone: string
      emailConsent: boolean
      phoneConsent: boolean
    }

    const { productType, displayName, senderName, senderEmail, password, phone, emailConsent, phoneConsent } = body

    if (!displayName || !senderName || !senderEmail || !phone) {
      return NextResponse.json({ error: 'Eksik alan' }, { status: 400 })
    }
    if (!emailConsent || !phoneConsent) {
      return NextResponse.json({ error: 'İzinler onaylanmalıdır' }, { status: 400 })
    }

    const supabase = await createClient()
    const service = await createServiceClient()

    const { data: { user: currentUser } } = await supabase.auth.getUser()
    let userId: string

    if (currentUser) {
      userId = currentUser.id
    } else {
      if (!password || password.length < 6) {
        return NextResponse.json({ error: 'Şifre en az 6 karakter olmalıdır' }, { status: 400 })
      }

      const { data: linkData, error: linkErr } = await service.auth.admin.generateLink({
        type: 'signup',
        email: senderEmail,
        password,
        options: {
          data: { full_name: senderName },
          redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://theeternalmemory.com'}/auth/callback`,
        },
      })

      if (!linkErr && linkData?.user) {
        userId = linkData.user.id
        await service.from('profiles').upsert(
          { id: userId, full_name: senderName, email: senderEmail, phone },
          { onConflict: 'id', ignoreDuplicates: false }
        )
      } else {
        const { data: signIn, error: signInErr } = await supabase.auth.signInWithPassword({ email: senderEmail, password })
        if (signInErr || !signIn.user) {
          return NextResponse.json({ error: 'Bu email kayıtlı. Şifrenizi kontrol edin.' }, { status: 400 })
        }
        userId = signIn.user.id
      }
    }

    const hdrs = await headers()
    const consentIp = hdrs.get('x-forwarded-for')?.split(',')[0]?.trim() || hdrs.get('x-real-ip') || null

    await service.from('user_consents').insert({
      user_id: userId,
      email_consent: emailConsent,
      phone_consent: phoneConsent,
      consent_ip: consentIp,
      consent_version: 'v1.0',
      source: `purchase_${productType}_paypal`,
    })

    const pricing = await fetchPricingConfig()
    let amount: number
    let currency: string

    if (productType === 'memorial_one_time') {
      amount = pricing.campaignActive && pricing.campaignMemorial
        ? Number(pricing.campaignMemorial)
        : Number(pricing.memorialPrice)
      currency = 'USD'
    } else {
      amount = pricing.campaignActive && pricing.campaignVaultSetup
        ? Number(pricing.campaignVaultSetup)
        : Number(pricing.vaultSetup)
      currency = 'USD'
    }

    const baseSlug = slugify(displayName)
    const slug = `${baseSlug}-${Date.now().toString(36)}`

    const { data: vault, error: vaultErr } = await service.from('vaults').insert({
      owner_id: userId,
      display_name: displayName,
      slug,
      status: 'pending_verification',
      product_type: productType === 'memorial_one_time' ? 'memorial_profile' : 'life_vault',
      vault_origin: productType === 'memorial_one_time' ? 'family' : 'self',
    }).select('id').single()

    if (vaultErr || !vault) {
      return NextResponse.json({ error: 'Vault oluşturulamadı' }, { status: 500 })
    }

    const { error: paymentErr } = await service.from('payments').insert({
      vault_id: vault.id,
      user_id: userId,
      amount,
      currency,
      product_type: productType,
      status: 'pending',
      payment_method: 'paypal',
    })
    if (paymentErr) {
      return NextResponse.json({ error: 'Ödeme kaydı oluşturulamadı' }, { status: 500 })
    }

    const description = productType === 'memorial_one_time'
      ? `Anma Profili - ${displayName}`
      : `Anı Kasası - ${displayName}`

    const paypalOrder = await createOrder(amount.toFixed(2), currency, description)

    return NextResponse.json({
      orderId: paypalOrder.id,
      vaultId: vault.id,
      userId,
      productType,
      redirectUrl: productType === 'memorial_one_time'
        ? `/anma-paneli/${vault.id}?purchased=1`
        : `/dashboard/vault/${vault.id}?purchased=1`,
    })
  } catch (err) {
    console.error('[paypal/create-order]', err)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}
