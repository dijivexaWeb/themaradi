'use server'

import { createClient, createServiceClient } from '@/lib/supabase/server'
import { sendEmail, getAdminNotificationEmail } from '@/lib/email'
import { adminNewRegistrationEmail } from '@/lib/email/templates'
import { fetchPricingConfig } from '@/lib/pricing'

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

export type QuickPurchaseResult =
  | { ok: true; vaultId: string }
  | { ok: false; error: string }

export async function quickPurchaseMemorialAction(
  familyId: string,
  _prev: unknown,
  formData: FormData
): Promise<QuickPurchaseResult> {
  const supabase = await createClient()
  const service = await createServiceClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Giriş yapmanız gerekiyor.' }

  const displayName = (formData.get('display_name') as string)?.trim()
  const qrSameAddress = formData.get('qr_same_address') === 'yes'
  const shippingAddress = qrSameAddress ? null : (formData.get('shipping_address') as string)?.trim() || null
  const paymentMethod = (formData.get('payment_method') as string) || 'bank_transfer'

  if (!displayName) return { ok: false, error: 'İsim zorunludur.' }

  const pricing = await fetchPricingConfig()
  const amount = pricing.campaignActive && pricing.campaignAdditionalMemberGel
    ? Number(pricing.campaignAdditionalMemberGel)
    : Number(pricing.additionalMemberGel)

  const slug = `${slugify(displayName)}-${Date.now().toString(36)}`

  const { data: vault, error: vaultErr } = await supabase.from('vaults').insert({
    owner_id: user.id,
    display_name: displayName,
    slug,
    status: 'pending_verification',
    product_type: 'memorial_profile',
    vault_origin: 'family',
    shipping_address: shippingAddress,
  }).select('id').single()

  if (vaultErr || !vault) return { ok: false, error: 'Profil oluşturulamadı: ' + vaultErr?.message }

  // Aile ile ilişkilendir
  await supabase.from('family_members')
    .upsert({ family_id: familyId, vault_id: vault.id }, { onConflict: 'family_id,vault_id', ignoreDuplicates: true })

  const dueDate = new Date()
  dueDate.setDate(dueDate.getDate() + 3)

  const { data: profile } = await supabase.from('profiles').select('full_name, email, phone').eq('id', user.id).single()

  await service.from('payments').insert({
    vault_id: vault.id,
    user_id: user.id,
    amount,
    currency: 'GEL',
    product_type: 'memorial_one_time',
    status: 'pending',
    payment_method: paymentMethod,
    due_date: dueDate.toISOString().split('T')[0],
    notes: `Hızlı satın alma — ${profile?.full_name ?? user.email} | Profil: ${displayName}`,
  })

  // Admin bildirim
  try {
    const adminEmail = await getAdminNotificationEmail()
    if (adminEmail) {
      await sendEmail({
        to: adminEmail,
        subject: `[The Eternal Memory] Hızlı kayıt — ${displayName}`,
        html: adminNewRegistrationEmail({
          senderName: profile?.full_name ?? user.email ?? '',
          senderEmail: profile?.email ?? user.email ?? '',
          phone: profile?.phone ?? '',
          productType: 'memorial_one_time',
          vaultName: displayName,
          paymentMethod,
          amount,
          adminUrl: `${SITE_URL}/admin/kasa`,
        }),
      })
    }
  } catch (e) {
    console.error('[quickPurchaseMemorialAction] admin notify error:', e)
  }

  return { ok: true, vaultId: vault.id }
}
