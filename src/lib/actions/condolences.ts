'use server'

import { createClient, createServiceClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { sendEmail, isNotificationEnabled } from '@/lib/email'
import { newGuestbookEntryEmail, messageApprovedEmail, condolenceReceivedEmail } from '@/lib/email/templates'
import { verifyTurnstile } from '@/lib/turnstile'

type EntryEmoji = 'heart' | 'pray' | 'smile' | 'cry' | 'dove'

export async function reactToEntryAction(
  entryId: string,
  emoji: EntryEmoji,
  delta: 1 | -1,
): Promise<{ success: boolean; newCount: number }> {
  const allowed: EntryEmoji[] = ['heart', 'pray', 'smile', 'cry', 'dove']
  if (!allowed.includes(emoji)) return { success: false, newCount: 0 }

  const col = `react_${emoji}` as const
  const service = await createServiceClient()

  const { data } = await service
    .from('guestbook_entries')
    .select(`id, ${col}`)
    .eq('id', entryId)
    .eq('status', 'approved')
    .single()

  if (!data) return { success: false, newCount: 0 }

  const current = (data as Record<string, number>)[col] ?? 0
  const newCount = Math.max(0, current + delta)

  await service.from('guestbook_entries').update({ [col]: newCount }).eq('id', entryId)
  return { success: true, newCount }
}

export async function addReactionAction(vaultId: string, type: 'candle' | 'flower' | 'prayer'): Promise<void> {
  if (!['candle', 'flower', 'prayer'].includes(type)) return

  const supabase = await createClient()
  const { data: vault } = await supabase
    .from('vaults')
    .select('id')
    .eq('id', vaultId)
    .in('status', ['public_memorial', 'private_memorial'])
    .single()
  if (!vault) return

  const service = await createServiceClient()
  await service.from('memorial_reactions').insert({ vault_id: vaultId, reaction_type: type })
  revalidatePath(`/memorial/[slug]`, 'page')
}

export async function approveGuestbookEntryAction(entryId: string, vaultId: string): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: vault } = await supabase.from('vaults').select('id, display_name, slug').eq('id', vaultId).eq('owner_id', user.id).single()
  if (!vault) return

  const { data: entry } = await supabase
    .from('guestbook_entries')
    .select('author_email, author_name')
    .eq('id', entryId)
    .eq('vault_id', vaultId)
    .single()

  await supabase.from('guestbook_entries').update({ status: 'approved' }).eq('id', entryId).eq('vault_id', vaultId)

  // Göndericiye onay emaili (fire-and-forget)
  if (entry?.author_email) {
    const notifyEnabled = await isNotificationEnabled('email_notify_approved')
    if (notifyEnabled) {
      const memorialUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://theeternalmemory.com'}/memorial/${vault.slug}`
      sendEmail({
        to: entry.author_email,
        subject: `Mesajınız yayınlandı — ${vault.display_name}`,
        html: messageApprovedEmail({
          vaultName: vault.display_name,
          authorName: entry.author_name,
          memorialUrl,
        }),
      }).catch((e) => console.error('[approveGuestbookEntryAction] email error:', e))
    }
  }

  revalidatePath(`/dashboard/vault/${vaultId}/taziye-defteri`)
  revalidatePath(`/memorial/[slug]`, 'page')
}

export async function rejectGuestbookEntryAction(entryId: string, vaultId: string): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: vault } = await supabase.from('vaults').select('id').eq('id', vaultId).eq('owner_id', user.id).single()
  if (!vault) return

  await supabase.from('guestbook_entries').delete().eq('id', entryId).eq('vault_id', vaultId)

  revalidatePath(`/dashboard/vault/${vaultId}/taziye-defteri`)
}

export async function submitCondolenceAction(vaultId: string, formData: FormData): Promise<{ error?: string }> {
  // Katman 1 — Honeypot
  const hp = formData.get('_hp') as string | null
  if (hp) return {}  // bot — sessizce kabul et, aslında kaydetme

  // Katman 2 — Zaman kontrolü (< 3 saniye = bot)
  const ts = parseInt((formData.get('_t') as string | null) ?? '0', 10)
  if (!ts || Date.now() - ts < 3000) return {}  // çok hızlı — sessizce yoksay

  // Katman 3 — Turnstile CAPTCHA
  const turnstileOk = await verifyTurnstile(formData.get('cf-turnstile-response') as string | null)
  if (!turnstileOk) return { error: 'CAPTCHA doğrulaması başarısız. Tekrar deneyin.' }

  const authorName = (formData.get('author_name') as string)?.trim()
  const relation = (formData.get('relation') as string)?.trim() || null
  const message = (formData.get('message') as string)?.trim()
  const email = (formData.get('email') as string)?.trim() || null

  if (!authorName || !message) return { error: 'Ad ve mesaj zorunludur.' }
  if (authorName.length > 100) return { error: 'Ad çok uzun.' }
  if (message.length > 2000) return { error: 'Mesaj 2000 karakteri geçemez.' }

  // Katman 3 — IP rate limit
  const hdrs = await headers()
  const ip = hdrs.get('x-forwarded-for')?.split(',')[0]?.trim()
    || hdrs.get('x-real-ip')
    || 'unknown'

  const service = await createServiceClient()
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  const { count } = await service
    .from('guestbook_entries')
    .select('*', { count: 'exact', head: true })
    .eq('vault_id', vaultId)
    .eq('ip_address', ip)
    .gte('created_at', since)

  if ((count ?? 0) >= 3) return { error: 'Bu sayfa için günlük mesaj limitine ulaştınız (maks. 3).' }

  const supabase = await createClient()

  const { data: vault } = await supabase
    .from('vaults')
    .select('id, status, display_name, slug, owner_id')
    .eq('id', vaultId)
    .in('status', ['public_memorial', 'private_memorial'])
    .single()

  if (!vault) return { error: 'Bu sayfa için mesaj gönderilemez.' }

  const { error } = await supabase.from('guestbook_entries').insert({
    vault_id: vaultId,
    author_name: authorName,
    relation,
    message,
    author_email: email,
    status: 'pending',
    ip_address: ip,
  })

  if (error) return { error: 'Mesaj gönderilemedi.' }

  // Vault sahibine email bildirimi (fire-and-forget)
  const notifyEnabled = await isNotificationEnabled('email_notify_new_guestbook')
  if (notifyEnabled && vault.owner_id) {
    const svc = await createServiceClient()
    const { data: profile } = await svc
      .from('profiles')
      .select('email')
      .eq('id', vault.owner_id)
      .single()

    if (profile?.email) {
      const dashboardUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://theeternalmemory.com'}/dashboard/vault/${vaultId}/taziye-defteri`
      sendEmail({
        to: profile.email,
        subject: `Yeni taziye mesajı — ${vault.display_name}`,
        html: newGuestbookEntryEmail({
          vaultName: vault.display_name,
          authorName,
          relation: relation ?? null,
          message,
          dashboardUrl,
        }),
      }).catch((e) => console.error('[submitCondolenceAction] email error:', e))
    }
  }

  // Taziye gönderene teşekkür emaili (fire-and-forget)
  if (email) {
    const memorialUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://theeternalmemory.com'}/memorial/${vault.slug}`
    sendEmail({
      to: email,
      subject: `Taziye mesajınız alındı — ${vault.display_name}`,
      html: condolenceReceivedEmail({ vaultName: vault.display_name, authorName, memorialUrl }),
    }).catch((e) => console.error('[submitCondolenceAction] submitter email error:', e))
  }

  revalidatePath(`/memorial/[slug]`, 'page')
  return {}
}
