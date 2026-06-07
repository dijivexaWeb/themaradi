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
  return { success: true }
}

// ─── Users ───────────────────────────────────────────────────────────────────

export async function updateUserRole(
  userId: string,
  role: 'user' | 'admin' | 'moderator'
): Promise<ActionResult> {
  const { user, profile } = await requireAdmin()
  const schema = z.string().uuid()
  if (!schema.safeParse(userId).success) return { success: false, error: 'Geçersiz kullanıcı ID' }

  const allowedRoles = ['user', 'admin', 'moderator']
  if (!allowedRoles.includes(role)) return { success: false, error: 'Geçersiz rol' }

  const supabase = await createServiceClient()

  const { data: oldProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single()

  const { error } = await supabase
    .from('profiles')
    .update({ role, updated_at: new Date().toISOString() })
    .eq('id', userId)

  if (error) return { success: false, error: error.message }

  await logAdminAction({
    adminId: user.id,
    adminEmail: user.email ?? profile.email ?? '',
    action: 'user_role_changed',
    entityType: 'profile',
    entityId: userId,
    oldValue: { role: oldProfile?.role },
    newValue: { role },
  })

  revalidatePath('/admin/users')
  return { success: true }
}

export async function banUser(userId: string): Promise<ActionResult> {
  const { user, profile } = await requireAdmin()
  const schema = z.string().uuid()
  if (!schema.safeParse(userId).success) return { success: false, error: 'Geçersiz kullanıcı ID' }

  // Prevent self-ban
  if (userId === user.id) return { success: false, error: 'Kendinizi banlayamazsınız' }

  const supabase = await createServiceClient()

  // Ban via Supabase Admin API — update banned_until to far future
  const { error } = await supabase.auth.admin.updateUserById(userId, {
    ban_duration: '876000h', // ~100 years
  })

  if (error) return { success: false, error: error.message }

  await logAdminAction({
    adminId: user.id,
    adminEmail: user.email ?? profile.email ?? '',
    action: 'user_banned',
    entityType: 'auth_user',
    entityId: userId,
  })

  revalidatePath('/admin/users')
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
