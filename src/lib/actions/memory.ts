'use server'

import { createClient, createServiceClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { getPublicUrl } from '@/lib/r2'

export async function submitMemoryAction(
  vaultId: string,
  data: {
    author_name: string
    relation?: string
    memory_text: string
    photo_url?: string
    file_key?: string
    bucket?: string
    author_email?: string
  },
): Promise<{ error?: string }> {
  const { author_name, relation, memory_text, photo_url, file_key, bucket, author_email } = data

  if (!author_name?.trim() || !memory_text?.trim())
    return { error: 'Ad ve anı metni zorunludur.' }
  if (author_name.trim().length > 100) return { error: 'Ad çok uzun.' }
  if (memory_text.trim().length > 1500) return { error: 'Anı 1500 karakteri geçemez.' }

  const hdrs = await headers()
  const ip =
    hdrs.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    hdrs.get('x-real-ip') ||
    'unknown'

  const service = await createServiceClient()

  // Rate limit: 3 per 24h per IP (only for anon users)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const { count } = await service
      .from('memory_book_entries')
      .select('*', { count: 'exact', head: true })
      .eq('vault_id', vaultId)
      .eq('ip_address', ip)
      .gte('created_at', since)

    if ((count ?? 0) >= 3)
      return { error: 'Günlük anı paylaşım limitine ulaştınız (maks. 3).' }
  }

  // Verify vault is active
  const { data: vault } = await service
    .from('vaults')
    .select('id')
    .eq('id', vaultId)
    .in('status', ['public_memorial', 'private_memorial'])
    .single()

  if (!vault) return { error: 'Bu sayfa için anı paylaşılamaz.' }

  let finalPhotoUrl = photo_url || null
  if (file_key && bucket) {
    finalPhotoUrl = getPublicUrl(file_key)
  }

  await service.from('memory_book_entries').insert({
    vault_id: vaultId,
    author_name: author_name.trim(),
    relation: relation?.trim() || null,
    memory_text: memory_text.trim(),
    photo_url: finalPhotoUrl,
    author_email: author_email?.trim() || null,
    ip_address: ip,
    status: 'pending',
  })

  revalidatePath('/memorial/[slug]', 'page')
  return {}
}

export async function addOwnerMemoryAction(vaultId: string, formData: FormData): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: vault } = await supabase
    .from('vaults')
    .select('id')
    .eq('id', vaultId)
    .eq('owner_id', user.id)
    .single()
  if (!vault) return

  const authorName = (formData.get('author_name') as string)?.trim()
  const memoryText = (formData.get('memory_text') as string)?.trim()
  const relation = (formData.get('relation') as string)?.trim() || null

  if (!authorName || !memoryText) return
  if (memoryText.length > 1500) return

  let photoUrl: string | null = null
  const fileKey = (formData.get('file_key') as string | null)?.trim()
  const bucket = (formData.get('bucket') as string | null)?.trim()
  if (fileKey && bucket) {
    photoUrl = getPublicUrl(fileKey)
  }

  const service = await createServiceClient()
  await service.from('memory_book_entries').insert({
    vault_id: vaultId,
    author_name: authorName,
    relation,
    memory_text: memoryText,
    photo_url: photoUrl,
    author_email: user.email ?? null,
    ip_address: 'owner',
    status: 'approved',
  })

  revalidatePath(`/anma-paneli/${vaultId}/ani-defteri`)
  revalidatePath('/memorial/[slug]', 'page')
}

export async function approveMemoryAction(entryId: string, vaultId: string): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: vault } = await supabase
    .from('vaults')
    .select('id')
    .eq('id', vaultId)
    .eq('owner_id', user.id)
    .single()
  if (!vault) return

  await supabase
    .from('memory_book_entries')
    .update({ status: 'approved' })
    .eq('id', entryId)
    .eq('vault_id', vaultId)

  revalidatePath(`/anma-paneli/${vaultId}/ani-defteri`)
  revalidatePath('/memorial/[slug]', 'page')
}

export async function rejectMemoryAction(entryId: string, vaultId: string): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: vault } = await supabase
    .from('vaults')
    .select('id')
    .eq('id', vaultId)
    .eq('owner_id', user.id)
    .single()
  if (!vault) return

  await supabase
    .from('memory_book_entries')
    .delete()
    .eq('id', entryId)
    .eq('vault_id', vaultId)

  revalidatePath(`/anma-paneli/${vaultId}/ani-defteri`)
  revalidatePath('/memorial/[slug]', 'page')
}
