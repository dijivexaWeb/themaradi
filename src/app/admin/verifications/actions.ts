'use server'

import { createServiceClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/admin/auth'
import { revalidatePath } from 'next/cache'
import { sendEmail } from '@/lib/email'

function verificationApprovedEmailHtml(ownerName: string, vaultName: string, dashboardUrl: string): string {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="font-family:Georgia,serif;background:#fbf8f1;margin:0;padding:0;">
  <div style="max-width:520px;margin:32px auto;background:#fff;border:1px solid #e6dccb;border-radius:16px;overflow:hidden;">
    <div style="background:#174f35;padding:28px 32px;text-align:center;">
      <p style="margin:0;color:#c7a76f;font-size:13px;letter-spacing:0.15em;text-transform:uppercase;">The Eternal Memory</p>
    </div>
    <div style="padding:36px 32px;">
      <h2 style="margin:0 0 16px;font-size:20px;color:#1f2d27;">Anma Sayfanız Doğrulandı</h2>
      <p style="color:#4a5e55;line-height:1.8;margin:0 0 16px;">Sayın ${ownerName},</p>
      <p style="color:#4a5e55;line-height:1.8;margin:0 0 16px;">
        <strong>${vaultName}</strong> için hazırlanan anma sayfası, gerekli belgeler ve şahit onayları incelenerek doğrulanmıştır.
      </p>
      <p style="color:#4a5e55;line-height:1.8;margin:0 0 24px;">
        Bu zorlu süreçte gösterdiğiniz sabır ve anlayış için teşekkür ederiz. Sevdiklerinizin anısını yaşatma çabanıza saygıyla eşlik etmekten onur duyuyoruz.
      </p>
      <div style="text-align:center;margin:28px 0;">
        <a href="${dashboardUrl}" style="display:inline-block;background:#174f35;color:#fff;text-decoration:none;padding:12px 28px;border-radius:12px;font-size:14px;font-weight:600;">
          Anma Sayfasını Yayına Al →
        </a>
      </div>
      <p style="color:#8a7a64;font-size:12px;line-height:1.8;margin:24px 0 0;">
        Saygılarımızla,<br>
        The Eternal Memory ekibi
      </p>
    </div>
  </div>
</body></html>`
}

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

    // Vault sahibine onay emaili gönder
    const { data: vault } = await supabase
      .from('vaults')
      .select('display_name, profiles!vaults_owner_id_fkey(full_name, email)')
      .eq('id', vaultId)
      .single()

    const owner = vault ? (Array.isArray((vault as Record<string, unknown>).profiles) ? ((vault as Record<string, unknown>).profiles as Record<string, unknown>[])[0] : (vault as Record<string, unknown>).profiles) as Record<string, unknown> | null : null
    const ownerEmail = owner?.email as string | null
    const ownerName = (owner?.full_name as string | null) ?? 'Değerli Kullanıcı'
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://theeternalmemory.com'

    if (ownerEmail) {
      await sendEmail({
        to: ownerEmail,
        subject: `${vault?.display_name} — Anma sayfanız doğrulandı`,
        html: verificationApprovedEmailHtml(ownerName, vault?.display_name as string ?? '', `${baseUrl}/anma-paneli/${vaultId}/dogrulama`),
      })
    }
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
