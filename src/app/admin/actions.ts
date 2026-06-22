'use server'

import { requireAdmin } from '@/lib/admin/auth'
import { logAdminAction } from '@/lib/admin/audit'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { sendEmail } from '@/lib/email'
import {
  shippingPreparingEmail,
  shippingShippedEmail,
  shippingDeliveredEmail,
  shippingConfirmedEmail,
} from '@/lib/email/templates'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://theeternalmemory.com'

const ALLOWED_VAULT_STATUSES = [
  'hidden_vault',
  'private_memorial',
  'public_memorial',
  'pending_verification',
  'suspended',
] as const

type ActionResult = { success: boolean; error?: string }

// ─── Vault Actions ─────────────────────────────────────────────────────────

export async function approveVault(vaultId: string): Promise<ActionResult> {
  const { user, profile } = await requireAdmin()
  const schema = z.string().uuid()
  if (!schema.safeParse(vaultId).success) return { success: false, error: 'Geçersiz vault ID' }

  const supabase = await createServiceClient()

  const { data: oldVault } = await supabase
    .from('vaults')
    .select('status, display_name')
    .eq('id', vaultId)
    .single()

  const { error } = await supabase
    .from('vaults')
    .update({ status: 'public_memorial', updated_at: new Date().toISOString(), published_at: new Date().toISOString() })
    .eq('id', vaultId)

  if (error) return { success: false, error: error.message }

  await logAdminAction({
    adminId: user.id,
    adminEmail: user.email ?? profile.email ?? '',
    action: 'vault_approved',
    entityType: 'vault',
    entityId: vaultId,
    oldValue: { status: oldVault?.status },
    newValue: { status: 'public_memorial' },
  })

  revalidatePath('/admin/verifications')
  revalidatePath('/admin/memorials')
  return { success: true }
}

export async function rejectVault(vaultId: string, reason: string): Promise<ActionResult> {
  const { user, profile } = await requireAdmin()
  const schema = z.object({ vaultId: z.string().uuid(), reason: z.string().min(5).max(1000) })
  if (!schema.safeParse({ vaultId, reason }).success) return { success: false, error: 'Geçersiz parametre' }

  const supabase = await createServiceClient()

  const { data: oldVault } = await supabase
    .from('vaults')
    .select('status')
    .eq('id', vaultId)
    .single()

  const { error } = await supabase
    .from('vaults')
    .update({ status: 'suspended', updated_at: new Date().toISOString() })
    .eq('id', vaultId)

  if (error) return { success: false, error: error.message }

  await logAdminAction({
    adminId: user.id,
    adminEmail: user.email ?? profile.email ?? '',
    action: 'vault_rejected',
    entityType: 'vault',
    entityId: vaultId,
    oldValue: { status: oldVault?.status },
    newValue: { status: 'suspended', reason },
  })

  revalidatePath('/admin/verifications')
  revalidatePath('/admin/memorials')
  return { success: true }
}

export async function changeVaultStatus(vaultId: string, newStatus: string): Promise<ActionResult> {
  const { user, profile } = await requireAdmin()

  if (!ALLOWED_VAULT_STATUSES.includes(newStatus as typeof ALLOWED_VAULT_STATUSES[number])) {
    return { success: false, error: 'Geçersiz durum değeri' }
  }

  const schema = z.string().uuid()
  if (!schema.safeParse(vaultId).success) return { success: false, error: 'Geçersiz vault ID' }

  const supabase = await createServiceClient()

  const { data: oldVault } = await supabase
    .from('vaults')
    .select('status')
    .eq('id', vaultId)
    .single()

  const now = new Date().toISOString()
  const extraFields = newStatus === 'public_memorial' && oldVault?.status !== 'public_memorial'
    ? { published_at: now }
    : {}

  const { error } = await supabase
    .from('vaults')
    .update({ status: newStatus, updated_at: now, ...extraFields })
    .eq('id', vaultId)

  if (error) return { success: false, error: error.message }

  await logAdminAction({
    adminId: user.id,
    adminEmail: user.email ?? profile.email ?? '',
    action: 'vault_status_changed',
    entityType: 'vault',
    entityId: vaultId,
    oldValue: { status: oldVault?.status },
    newValue: { status: newStatus },
  })

  revalidatePath('/admin/memorials')
  revalidatePath('/')
  return { success: true }
}

// ─── Objections ─────────────────────────────────────────────────────────────

export async function resolveObjection(
  objectionId: string,
  resolution: 'upheld' | 'dismissed',
  note: string
): Promise<ActionResult> {
  const { user, profile } = await requireAdmin()
  const schema = z.object({
    objectionId: z.string().uuid(),
    note: z.string().max(2000),
  })
  if (!schema.safeParse({ objectionId, note }).success) return { success: false, error: 'Geçersiz parametre' }

  const supabase = await createServiceClient()

  const { error } = await supabase
    .from('claim_objections')
    .update({
      status: resolution === 'upheld' ? 'upheld' : 'dismissed',
      admin_note: note,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', objectionId)

  if (error) return { success: false, error: error.message }

  await logAdminAction({
    adminId: user.id,
    adminEmail: user.email ?? profile.email ?? '',
    action: 'objection_resolved',
    entityType: 'claim_objection',
    entityId: objectionId,
    newValue: { status: resolution, note },
  })

  revalidatePath('/admin/objections')
  return { success: true }
}

// ─── Contact Messages ────────────────────────────────────────────────────────

export async function updateContactStatus(
  contactId: string,
  status: string,
  adminNote?: string
): Promise<ActionResult> {
  const { user, profile } = await requireAdmin()
  const allowedStatuses = ['new', 'in_progress', 'resolved', 'spam']
  if (!allowedStatuses.includes(status)) return { success: false, error: 'Geçersiz durum' }

  const schema = z.string().uuid()
  if (!schema.safeParse(contactId).success) return { success: false, error: 'Geçersiz ID' }

  const supabase = await createServiceClient()

  const { error } = await supabase
    .from('contact_messages')
    .update({
      status,
      admin_note: adminNote ?? null,
      replied_at: status === 'resolved' ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', contactId)

  if (error) return { success: false, error: error.message }

  await logAdminAction({
    adminId: user.id,
    adminEmail: user.email ?? profile.email ?? '',
    action: 'contact_status_updated',
    entityType: 'contact_message',
    entityId: contactId,
    newValue: { status, adminNote },
  })

  revalidatePath('/admin/contacts')
  return { success: true }
}

// ─── Payments ────────────────────────────────────────────────────────────────

export async function updatePaymentStatus(
  paymentId: string,
  status: string
): Promise<ActionResult> {
  const { user, profile } = await requireAdmin()
  const allowedStatuses = ['pending', 'paid', 'overdue', 'failed', 'refunded', 'cancelled']
  if (!allowedStatuses.includes(status)) return { success: false, error: 'Geçersiz durum' }

  const schema = z.string().uuid()
  if (!schema.safeParse(paymentId).success) return { success: false, error: 'Geçersiz ID' }

  const supabase = await createServiceClient()

  const { data: oldPayment } = await supabase
    .from('payments')
    .select('status')
    .eq('id', paymentId)
    .single()

  const { error } = await supabase
    .from('payments')
    .update({
      status,
      paid_at: status === 'paid' ? new Date().toISOString() : undefined,
      updated_at: new Date().toISOString(),
    })
    .eq('id', paymentId)

  if (error) return { success: false, error: error.message }

  await logAdminAction({
    adminId: user.id,
    adminEmail: user.email ?? profile.email ?? '',
    action: 'payment_status_updated',
    entityType: 'payment',
    entityId: paymentId,
    oldValue: { status: oldPayment?.status },
    newValue: { status },
  })

  revalidatePath('/admin/kasa')
  return { success: true }
}

// ─── Alive Alerts ────────────────────────────────────────────────────────────

export async function resolveAliveAlert(
  alertId: string,
  status: string,
  note: string
): Promise<ActionResult> {
  const { user, profile } = await requireAdmin()
  const allowedStatuses = ['open', 'investigating', 'resolved', 'dismissed']
  if (!allowedStatuses.includes(status)) return { success: false, error: 'Geçersiz durum' }

  const schema = z.string().uuid()
  if (!schema.safeParse(alertId).success) return { success: false, error: 'Geçersiz ID' }

  const supabase = await createServiceClient()

  const { error } = await supabase
    .from('alive_alerts')
    .update({
      status,
      admin_note: note,
      resolved_at: ['resolved', 'dismissed'].includes(status) ? new Date().toISOString() : null,
      resolved_by: ['resolved', 'dismissed'].includes(status) ? user.id : null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', alertId)

  if (error) return { success: false, error: error.message }

  await logAdminAction({
    adminId: user.id,
    adminEmail: user.email ?? profile.email ?? '',
    action: 'alive_alert_resolved',
    entityType: 'alive_alert',
    entityId: alertId,
    newValue: { status, note },
  })

  revalidatePath('/admin/alive-alerts')
  return { success: true }
}

// ─── GDPR Requests ───────────────────────────────────────────────────────────

export async function resolveGdprRequest(
  requestId: string,
  status: string,
  note: string
): Promise<ActionResult> {
  const { user, profile } = await requireAdmin()
  const allowedStatuses = ['pending', 'in_progress', 'completed', 'rejected']
  if (!allowedStatuses.includes(status)) return { success: false, error: 'Geçersiz durum' }

  const schema = z.string().uuid()
  if (!schema.safeParse(requestId).success) return { success: false, error: 'Geçersiz ID' }

  const supabase = await createServiceClient()

  const { error } = await supabase
    .from('gdpr_requests')
    .update({
      status,
      admin_note: note,
      completed_at: status === 'completed' ? new Date().toISOString() : null,
      completed_by: status === 'completed' ? user.id : null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', requestId)

  if (error) return { success: false, error: error.message }

  await logAdminAction({
    adminId: user.id,
    adminEmail: user.email ?? profile.email ?? '',
    action: 'gdpr_request_resolved',
    entityType: 'gdpr_request',
    entityId: requestId,
    newValue: { status, note },
  })

  revalidatePath('/admin/gdpr')
  return { success: true }
}

// ─── Guestbook ───────────────────────────────────────────────────────────────

export async function moderateGuestbook(
  entryId: string,
  status: 'approved' | 'rejected' | 'spam'
): Promise<ActionResult> {
  const { user, profile } = await requireAdmin()
  const schema = z.string().uuid()
  if (!schema.safeParse(entryId).success) return { success: false, error: 'Geçersiz ID' }

  const supabase = await createServiceClient()

  // Fetch vault slug before update so we can revalidate the memorial page
  const { data: entry } = await supabase
    .from('guestbook_entries')
    .select('vault_id, vaults(slug)')
    .eq('id', entryId)
    .single()

  const { error } = await supabase
    .from('guestbook_entries')
    .update({ status })
    .eq('id', entryId)

  if (error) return { success: false, error: error.message }

  await logAdminAction({
    adminId: user.id,
    adminEmail: user.email ?? profile.email ?? '',
    action: 'guestbook_moderated',
    entityType: 'guestbook_entry',
    entityId: entryId,
    newValue: { status },
  })

  revalidatePath('/admin/guestbook')

  // Revalidate the memorial page so approved entry appears immediately
  const slug = (entry?.vaults as { slug?: string } | null)?.slug
  if (slug) revalidatePath(`/memorial/${slug}`)

  return { success: true }
}

// ─── Manual Payment ─────────────────────────────────────────────────────────

const manualPaymentSchema = z.object({
  vault_id: z.string().uuid(),
  amount: z.coerce.number().positive().max(100000),
  product_type: z.enum(['memorial_one_time', 'vault_setup', 'vault_monthly']),
  status: z.enum(['paid', 'pending', 'overdue']),
  paid_at: z.string().optional(),
  notes: z.string().max(500).optional(),
})

export async function addManualPayment(formData: FormData): Promise<ActionResult> {
  const { user, profile } = await requireAdmin()

  const parsed = manualPaymentSchema.safeParse({
    vault_id: formData.get('vault_id'),
    amount: formData.get('amount'),
    product_type: formData.get('product_type'),
    status: formData.get('status'),
    paid_at: formData.get('paid_at') || undefined,
    notes: formData.get('notes') || undefined,
  })

  if (!parsed.success) return { success: false, error: 'Geçersiz form verisi: ' + parsed.error.issues[0]?.message }

  const supabase = await createServiceClient()

  // Verify vault exists
  const { data: vault } = await supabase.from('vaults').select('id, owner_id, display_name').eq('id', parsed.data.vault_id).single()
  if (!vault) return { success: false, error: 'Vault bulunamadı' }

  const { data: payment, error } = await supabase.from('payments').insert({
    vault_id: parsed.data.vault_id,
    user_id: vault.owner_id,
    amount: parsed.data.amount,
    currency: 'GEL',
    product_type: parsed.data.product_type,
    status: parsed.data.status,
    paid_at: parsed.data.status === 'paid' && parsed.data.paid_at ? new Date(parsed.data.paid_at).toISOString() : null,
    notes: parsed.data.notes ?? null,
  }).select('id').single()

  if (error) return { success: false, error: error.message }

  await logAdminAction({
    adminId: user.id,
    adminEmail: user.email ?? profile.email ?? '',
    action: 'manual_payment_added',
    entityType: 'payment',
    entityId: payment?.id,
    newValue: { vault: vault.display_name, amount: parsed.data.amount, product_type: parsed.data.product_type, status: parsed.data.status },
  })

  revalidatePath('/admin/kasa')
  return { success: true }
}

// ─── Pricing Settings ───────────────────────────────────────────────────────

export async function updatePricingSettings(formData: FormData): Promise<ActionResult> {
  const { user, profile } = await requireAdmin()

  const keys = [
    'price_memorial_one_time', 'price_vault_setup', 'price_vault_monthly',
    'price_memorial_try', 'price_vault_setup_try', 'price_vault_monthly_try',
    'price_memorial_usd', 'price_vault_setup_usd', 'price_vault_monthly_usd',
    'price_memorial_rub', 'price_vault_setup_rub', 'price_vault_monthly_rub',
    'price_family_gel', 'price_family_try', 'price_family_usd', 'price_family_rub',
    'campaign_active', 'campaign_label',
    'campaign_price_memorial', 'campaign_price_vault_setup', 'campaign_price_vault_monthly',
    'campaign_price_memorial_try', 'campaign_price_vault_monthly_try',
    'campaign_price_memorial_usd', 'campaign_price_vault_monthly_usd',
    'campaign_price_memorial_rub', 'campaign_price_vault_monthly_rub',
    'campaign_price_family_gel', 'campaign_price_family_try',
    'campaign_price_family_usd', 'campaign_price_family_rub',
    'campaign_ends_at',
  ]

  const supabase = await createServiceClient()
  const updates = keys.map((key) => ({
    key,
    value: (formData.get(key) ?? '').toString(),
    updated_at: new Date().toISOString(),
  }))

  const { error } = await supabase
    .from('platform_settings')
    .upsert(updates, { onConflict: 'key' })

  if (error) return { success: false, error: error.message }

  await logAdminAction({
    adminId: user.id,
    adminEmail: user.email ?? profile.email ?? '',
    action: 'pricing_settings_updated',
    entityType: 'platform_settings',
    newValue: Object.fromEntries(updates.map((u) => [u.key, u.value])),
  })

  revalidatePath('/admin/settings')
  revalidatePath('/')
  revalidatePath('/pricing')
  return { success: true }
}

// ─── Bank Settings ──────────────────────────────────────────────────────────

export async function updateBankSettings(formData: FormData): Promise<ActionResult> {
  const { user, profile } = await requireAdmin()
  const supabase = await createServiceClient()

  const keys = ['bank_iban', 'bank_name', 'bank_recipient', 'paypal_link']
  const updates = keys.map((key) => ({
    key,
    value: (formData.get(key) ?? '').toString().trim(),
    updated_at: new Date().toISOString(),
  }))

  const { error } = await supabase
    .from('platform_settings')
    .upsert(updates, { onConflict: 'key' })

  if (error) return { success: false, error: error.message }

  await logAdminAction({
    adminId: user.id,
    adminEmail: user.email ?? profile.email ?? '',
    action: 'bank_settings_updated',
    entityType: 'platform_settings',
    newValue: Object.fromEntries(updates.map((u) => [u.key, u.value])),
  })

  revalidatePath('/admin/settings')
  revalidatePath('/satin-al/anma')
  revalidatePath('/satin-al/kasa')
  return { success: true }
}

// ─── Payment Gateway Settings ───────────────────────────────────────────────

export async function updateGatewaySettings(formData: FormData): Promise<ActionResult> {
  const { user, profile } = await requireAdmin()
  const supabase = await createServiceClient()

  const keys = ['payment_gateway_provider', 'payment_gateway_api_key', 'payment_gateway_secret', 'payment_gateway_enabled']
  const updates = keys.map((key) => ({
    key,
    value: (formData.get(key) ?? '').toString().trim(),
    updated_at: new Date().toISOString(),
  }))

  const { error } = await supabase
    .from('platform_settings')
    .upsert(updates, { onConflict: 'key' })

  if (error) return { success: false, error: error.message }

  await logAdminAction({
    adminId: user.id,
    adminEmail: user.email ?? profile.email ?? '',
    action: 'gateway_settings_updated',
    entityType: 'platform_settings',
    newValue: { provider: formData.get('payment_gateway_provider') },
  })

  revalidatePath('/admin/settings')
  return { success: true }
}

// ─── Pricing Exemptions ─────────────────────────────────────────────────────

const exemptionSchema = z.object({
  vault_id: z.string().uuid(),
  exemption_type: z.enum(['free', 'discounted']),
  discount_percent: z.coerce.number().min(1).max(99).optional(),
  reason: z.string().min(3).max(255),
  expires_at: z.string().optional(),
  notes: z.string().max(500).optional(),
})

export async function addPricingExemption(formData: FormData): Promise<ActionResult> {
  const { user, profile } = await requireAdmin()

  const parsed = exemptionSchema.safeParse({
    vault_id: formData.get('vault_id'),
    exemption_type: formData.get('exemption_type'),
    discount_percent: formData.get('discount_percent') || undefined,
    reason: formData.get('reason'),
    expires_at: formData.get('expires_at') || undefined,
    notes: formData.get('notes') || undefined,
  })

  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? 'Geçersiz veri' }

  const supabase = await createServiceClient()

  const { data: vault } = await supabase.from('vaults').select('id, owner_id, display_name').eq('id', parsed.data.vault_id).single()
  if (!vault) return { success: false, error: 'Vault bulunamadı' }

  const { error } = await supabase.from('pricing_exemptions').insert({
    vault_id: parsed.data.vault_id,
    user_id: vault.owner_id,
    exemption_type: parsed.data.exemption_type,
    discount_percent: parsed.data.exemption_type === 'discounted' ? (parsed.data.discount_percent ?? null) : null,
    reason: parsed.data.reason,
    expires_at: parsed.data.expires_at ? new Date(parsed.data.expires_at).toISOString() : null,
    notes: parsed.data.notes ?? null,
    granted_by: user.id,
  })

  if (error) return { success: false, error: error.message }

  await logAdminAction({
    adminId: user.id,
    adminEmail: user.email ?? profile.email ?? '',
    action: 'pricing_exemption_granted',
    entityType: 'pricing_exemptions',
    entityId: parsed.data.vault_id,
    newValue: { vault: vault.display_name, type: parsed.data.exemption_type, reason: parsed.data.reason },
  })

  revalidatePath('/admin/settings')
  return { success: true }
}

// ─── Notable Profile ────────────────────────────────────────────────────────

export async function saveNotableProfile(
  vaultId: string,
  data: {
    is_notable: boolean
    nationality: string | null
    notable_subtitle: string | null
    notable_motto: string | null
    notable_motto_tr: string | null
    featured_quote: string | null
    notable_legacy_text: string | null
    notable_verified_note: string | null
    notable_sort_order: number | null
    notable_intro_text: string | null
  }
): Promise<ActionResult> {
  const { user, profile } = await requireAdmin()
  if (!z.string().uuid().safeParse(vaultId).success) return { success: false, error: 'Geçersiz vault ID' }

  const supabase = await createServiceClient()

  const { data: vault, error } = await supabase.from('vaults').update({
    ...data,
    updated_at: new Date().toISOString(),
  }).eq('id', vaultId).select('slug').single()

  if (error) return { success: false, error: error.message }

  await logAdminAction({
    adminId: user.id,
    adminEmail: user.email ?? profile.email ?? '',
    action: 'notable_profile_updated',
    entityType: 'vault',
    entityId: vaultId,
    newValue: { is_notable: data.is_notable, nationality: data.nationality },
  })

  revalidatePath(`/admin/memorials/${vaultId}`)
  if (vault?.slug) revalidatePath(`/memorial/${vault.slug}`)
  revalidatePath('/memorial')
  return { success: true }
}

// ─── Admin: Create Memorial ──────────────────────────────────────────────────

function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
    .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim().replace(/\s+/g, '-').replace(/-+/g, '-')
}

function randomSuffix(n = 8): string {
  return Math.random().toString(36).slice(2, 2 + n)
}

export async function createAdminMemorial(data: {
  email: string
  password: string
  display_name: string
  birth_date: string | null
  birth_date_precision: string
  death_date: string | null
  death_date_precision: string
  tagline: string | null
  is_notable: boolean
  nationality: string | null
  notable_sort_order: number | null
}): Promise<{ success: boolean; vaultId?: string; error?: string }> {
  const { user, profile } = await requireAdmin()

  const supabase = await createServiceClient()

  // 1. Create auth user (auto-confirmed, no email sent)
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: data.email.trim().toLowerCase(),
    password: data.password,
    email_confirm: true,
  })
  if (authError || !authData.user) {
    return { success: false, error: authError?.message ?? 'Kullanıcı oluşturulamadı.' }
  }
  const newUserId = authData.user.id

  // 2. Upsert profile (trigger may have already inserted a row)
  const { error: profileError } = await supabase.from('profiles').upsert({
    id: newUserId,
    full_name: data.display_name.trim(),
    email: data.email.trim().toLowerCase(),
    role: 'user',
  }, { onConflict: 'id' })
  if (profileError) {
    await supabase.auth.admin.deleteUser(newUserId)
    return { success: false, error: profileError.message }
  }

  // 3. Create vault
  const slug = `${slugify(data.display_name)}-${randomSuffix()}`
  const now = new Date().toISOString()
  const { data: vault, error: vaultError } = await supabase.from('vaults').insert({
    owner_id: newUserId,
    display_name: data.display_name.trim(),
    slug,
    status: 'public_memorial',
    product_type: 'memorial_profile',
    published_at: now,
    updated_at: now,
    birth_date: data.birth_date || null,
    birth_date_precision: data.birth_date ? data.birth_date_precision : null,
    death_date: data.death_date || null,
    death_date_precision: data.death_date ? data.death_date_precision : null,
    tagline: data.tagline?.trim() || null,
    is_notable: data.is_notable,
    nationality: data.is_notable ? data.nationality : null,
    notable_sort_order: data.is_notable ? data.notable_sort_order : null,
    hide_objection: data.is_notable,
  }).select('id').single()

  if (vaultError || !vault) {
    await supabase.auth.admin.deleteUser(newUserId)
    return { success: false, error: vaultError?.message ?? 'Vault oluşturulamadı.' }
  }

  await logAdminAction({
    adminId: user.id,
    adminEmail: user.email ?? profile.email ?? '',
    action: 'admin_memorial_created',
    entityType: 'vault',
    entityId: vault.id,
    newValue: { display_name: data.display_name, email: data.email, is_notable: data.is_notable },
  })

  revalidatePath('/admin/memorials')
  revalidatePath('/memorial')

  return { success: true, vaultId: vault.id }
}

// ─── Hide Objection Toggle ───────────────────────────────────────────────────

export async function saveHideObjection(vaultId: string, hide: boolean): Promise<ActionResult> {
  const { user, profile } = await requireAdmin()
  if (!z.string().uuid().safeParse(vaultId).success) return { success: false, error: 'Geçersiz vault ID' }

  const supabase = await createServiceClient()
  const { data: vault, error } = await supabase
    .from('vaults')
    .update({ hide_objection: hide, updated_at: new Date().toISOString() })
    .eq('id', vaultId)
    .select('slug')
    .single()

  if (error) return { success: false, error: error.message }

  await logAdminAction({
    adminId: user.id,
    adminEmail: user.email ?? profile.email ?? '',
    action: 'hide_objection_updated',
    entityType: 'vault',
    entityId: vaultId,
    newValue: { hide_objection: hide },
  })

  revalidatePath(`/admin/memorials/${vaultId}`)
  if (vault?.slug) revalidatePath(`/memorial/${vault.slug}`)
  return { success: true }
}


// ─── Shipping Address ─────────────────────────────────────────────────────────

export async function updateShippingAddressAction(_prev: unknown, formData: FormData) {
  const { user, profile } = await requireAdmin()
  const vaultId = (formData.get('vault_id') as string)?.trim()
  const shippingAddress = (formData.get('shipping_address') as string)?.trim()

  if (!z.string().uuid().safeParse(vaultId).success) return { error: 'Geçersiz vault ID' }

  const supabase = await createServiceClient()
  const { error } = await supabase
    .from('vaults')
    .update({ shipping_address: shippingAddress || null, updated_at: new Date().toISOString() })
    .eq('id', vaultId)

  if (error) return { error: error.message }

  await logAdminAction({
    adminId: user.id,
    adminEmail: user.email ?? profile.email ?? '',
    action: 'shipping_address_updated',
    entityType: 'vault',
    entityId: vaultId,
    newValue: { shipping_address: shippingAddress },
  })

  revalidatePath(`/admin/memorials/${vaultId}`)
  return { success: true }
}

// ─── Shipping Status Update ───────────────────────────────────────────────────

const SHIPPING_STATUSES = ['pending', 'preparing', 'ready', 'shipped', 'delivered', 'confirmed'] as const
type ShippingStatus = typeof SHIPPING_STATUSES[number]

export async function updateShippingStatusAction(_prev: unknown, formData: FormData) {
  const { user, profile } = await requireAdmin()
  const vaultId = (formData.get('vault_id') as string)?.trim()
  const newStatus = (formData.get('status') as string)?.trim() as ShippingStatus
  const trackingNumber = (formData.get('tracking_number') as string)?.trim() || null
  const trackingCarrier = (formData.get('tracking_carrier') as string)?.trim() || null

  if (!z.string().uuid().safeParse(vaultId).success) return { error: 'Geçersiz vault ID' }
  if (!SHIPPING_STATUSES.includes(newStatus)) return { error: 'Geçersiz status' }
  if (newStatus === 'shipped' && !trackingNumber) return { error: 'Kargo numarası zorunludur' }

  const supabase = await createServiceClient()

  // Vault + owner bilgisi
  const { data: vault, error: vaultErr } = await supabase
    .from('vaults')
    .select('id, display_name, shipping_address, shipping_status, owner_id')
    .eq('id', vaultId)
    .single()

  if (vaultErr || !vault) return { error: 'Vault bulunamadı' }

  const { data: ownerProfile } = await supabase
    .from('profiles')
    .select('full_name, email')
    .eq('id', vault.owner_id)
    .single()

  const updates: Record<string, unknown> = {
    shipping_status: newStatus,
    updated_at: new Date().toISOString(),
  }
  if (newStatus === 'shipped') {
    updates.tracking_number = trackingNumber
    updates.tracking_carrier = trackingCarrier
    updates.shipped_at = new Date().toISOString()
  }
  if (newStatus === 'delivered') {
    updates.delivered_at = new Date().toISOString()
  }
  if (newStatus === 'confirmed') {
    updates.shipping_confirmed_at = new Date().toISOString()
  }

  const { error } = await supabase.from('vaults').update(updates).eq('id', vaultId)
  if (error) return { error: error.message }

  await logAdminAction({
    adminId: user.id,
    adminEmail: user.email ?? profile.email ?? '',
    action: 'shipping_status_updated',
    entityType: 'vault',
    entityId: vaultId,
    newValue: { shipping_status: newStatus, tracking_number: trackingNumber },
  })

  // Email gönder
  if (ownerProfile?.email) {
    const recipientName = ownerProfile.full_name ?? 'Müşteri'
    const vaultName = vault.display_name ?? ''
    const shippingAddress = vault.shipping_address ?? ''

    try {
      if (newStatus === 'preparing') {
        await sendEmail({
          to: ownerProfile.email,
          subject: `📦 Tabelanız hazırlanıyor — ${vaultName}`,
          html: shippingPreparingEmail({ recipientName, vaultName, shippingAddress }),
        })
      } else if (newStatus === 'shipped') {
        await sendEmail({
          to: ownerProfile.email,
          subject: `🚚 Tabelanız kargoya verildi — ${vaultName}`,
          html: shippingShippedEmail({
            recipientName,
            vaultName,
            trackingNumber: trackingNumber!,
            trackingCarrier: trackingCarrier ?? 'Kargo firması',
            shippingAddress,
          }),
        })
      } else if (newStatus === 'delivered') {
        const confirmUrl = `${SITE_URL}/anma-paneli/${vaultId}/kargo?confirm=1`
        await sendEmail({
          to: ownerProfile.email,
          subject: `🏠 Tabelanız teslim edildi — ${vaultName}`,
          html: shippingDeliveredEmail({ recipientName, vaultName, confirmUrl }),
        })
      }
    } catch (e) {
      console.error('[updateShippingStatusAction] email error:', e)
    }
  }

  revalidatePath('/admin/kargo')
  revalidatePath(`/admin/memorials/${vaultId}`)
  return { success: true }
}

export async function confirmDeliveryAction(vaultId: string) {
  const authClient = await createClient()
  const { data: { user } } = await authClient.auth.getUser()
  if (!user) return { error: 'Yetkisiz erişim' }

  const supabase = await createServiceClient()

  const { data: vault, error: fetchErr } = await supabase
    .from('vaults')
    .select('display_name, shipping_status, owner_id')
    .eq('id', vaultId)
    .single()

  if (fetchErr || !vault) return { error: 'Vault bulunamadı' }
  if (vault.owner_id !== user.id) return { error: 'Yetkisiz erişim' }
  if (vault.shipping_status !== 'delivered') return { error: 'Bu işlem şu anda yapılamaz' }

  const { error } = await supabase
    .from('vaults')
    .update({ shipping_status: 'confirmed', shipping_confirmed_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq('id', vaultId)

  if (error) return { error: error.message }

  const { data: ownerProfile } = await supabase
    .from('profiles')
    .select('full_name, email')
    .eq('id', vault.owner_id)
    .single()

  if (ownerProfile?.email) {
    try {
      await sendEmail({
        to: ownerProfile.email,
        subject: `✅ Teslimat onaylandı — ${vault.display_name}`,
        html: shippingConfirmedEmail({
          recipientName: ownerProfile.full_name ?? 'Müşteri',
          vaultName: vault.display_name ?? '',
        }),
      })
    } catch (e) {
      console.error('[confirmDeliveryAction] email error:', e)
    }
  }

  revalidatePath(`/anma-paneli/${vaultId}/kargo`)
  return { success: true }
}
