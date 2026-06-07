'use server'

import { createServiceClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/admin/auth'
import { revalidatePath } from 'next/cache'

export async function approvePaymentAction(vaultId: string, paymentId: string) {
  const { user } = await requireAdmin()
  const supabase = await createServiceClient()

  await supabase.from('vaults').update({
    status: 'private_memorial',
    payment_verified_at: new Date().toISOString(),
    verified_by: user.id,
  }).eq('id', vaultId)

  await supabase.from('payments').update({
    status: 'paid',
    paid_at: new Date().toISOString(),
  }).eq('id', paymentId)

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

  await supabase.from('payments').update({
    status: 'cancelled',
    notes: `Reddedildi: ${reason}`,
  }).eq('id', paymentId)

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
