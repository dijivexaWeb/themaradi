'use server'

import { requireAdmin } from '@/lib/admin/auth'
import { logAdminAction } from '@/lib/admin/audit'
import { createServiceClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'

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
    .update({ status: 'public_memorial', updated_at: new Date().toISOString() })
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

  const { error } = await supabase
    .from('vaults')
    .update({ status: newStatus, updated_at: new Date().toISOString() })
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
    'campaign_active', 'campaign_label',
    'campaign_price_memorial', 'campaign_price_vault_setup', 'campaign_price_vault_monthly',
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
  return { success: true }
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
