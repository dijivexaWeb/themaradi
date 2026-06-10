'use server'

import { createServiceClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/admin/auth'
import { revalidatePath } from 'next/cache'

export async function approvePaymentAction(vaultId: string, paymentId: string) {
  const { user } = await requireAdmin()
  const supabase = await createServiceClient()

  await supabase.from('vaults').update({
    status: 'hidden_vault',
    payment_verified_at: new Date().toISOString(),
    verified_by: user.id,
  }).eq('id', vaultId)

  if (paymentId) {
    await supabase.from('payments').update({
      status: 'paid',
      paid_at: new Date().toISOString(),
    }).eq('id', paymentId)
  }

  await supabase.from('admin_audit_logs').insert({
    admin_id: user.id,
    admin_email: user.email,
    action: 'payment_approved',
    entity_type: 'vault',
    entity_id: vaultId,
    new_value: { vault_id: vaultId, payment_id: paymentId },
  })

  revalidatePath('/admin/verifications')
  revalidatePath('/admin')
  return { success: true }
}

export async function rejectPaymentAction(vaultId: string, paymentId: string, reason: string) {
  const { user } = await requireAdmin()
  const supabase = await createServiceClient()

  await supabase.from('vaults').update({ status: 'hidden_vault' }).eq('id', vaultId)

  if (paymentId) {
    await supabase.from('payments').update({
      status: 'cancelled',
      notes: `Reddedildi: ${reason}`,
    }).eq('id', paymentId)
  }

  await supabase.from('admin_audit_logs').insert({
    admin_id: user.id,
    admin_email: user.email,
    action: 'payment_rejected',
    entity_type: 'vault',
    entity_id: vaultId,
    new_value: { vault_id: vaultId, payment_id: paymentId, reason },
  })

  revalidatePath('/admin/verifications')
  return { success: true }
}

export async function approveDocumentAction(docId: string, vaultId: string) {
  const { user } = await requireAdmin()
  const supabase = await createServiceClient()

  await supabase.from('memorial_verification_docs').update({
    status: 'approved',
    reviewed_by: user.id,
    reviewed_at: new Date().toISOString(),
    admin_note: null,
  }).eq('id', docId)

  // Belge onaylandı + 2 şahit onayladıysa private_memorial'a geç
  const { count } = await supabase.from('memorial_witnesses')
    .select('id', { count: 'exact', head: true })
    .eq('vault_id', vaultId).eq('status', 'confirmed')

  if ((count ?? 0) >= 2) {
    await supabase.from('vaults').update({ status: 'private_memorial' }).eq('id', vaultId)
  }

  await supabase.from('admin_audit_logs').insert({
    admin_id: user.id,
    admin_email: user.email,
    action: 'doc_approved',
    entity_type: 'memorial_verification_docs',
    entity_id: docId,
    new_value: { vault_id: vaultId },
  })

  revalidatePath('/admin/verifications')
  return { success: true }
}

export async function rejectDocumentAction(docId: string, vaultId: string, reason: string) {
  const { user } = await requireAdmin()
  const supabase = await createServiceClient()

  await supabase.from('memorial_verification_docs').update({
    status: 'rejected',
    reviewed_by: user.id,
    reviewed_at: new Date().toISOString(),
    admin_note: reason,
  }).eq('id', docId)

  await supabase.from('admin_audit_logs').insert({
    admin_id: user.id,
    admin_email: user.email,
    action: 'doc_rejected',
    entity_type: 'memorial_verification_docs',
    entity_id: docId,
    new_value: { vault_id: vaultId, reason },
  })

  revalidatePath('/admin/verifications')
  return { success: true }
}
