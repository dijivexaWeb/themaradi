'use server'

import { createClient, createServiceClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

const MEDIA_BUCKET = 'vault-media'
const MAX_MEMORY_MEDIA_BYTES = 50 * 1024 * 1024

type MemoryMediaResult =
  | { ok: true; mediaUrl: string | null; mediaType: string | null }
  | { ok: false; error: string }

function cleanFilename(name: string) {
  const cleaned = name
    .toLowerCase()
    .replace(/ş/g, 's').replace(/ğ/g, 'g').replace(/ü/g, 'u')
    .replace(/ö/g, 'o').replace(/ı/g, 'i').replace(/ç/g, 'c')
    .replace(/[^a-z0-9._-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
  return cleaned || 'media'
}

async function assertOwner(supabase: Awaited<ReturnType<typeof createClient>>, vaultId: string, userId: string) {
  const { data } = await supabase.from('vaults').select('id, status').eq('id', vaultId).eq('owner_id', userId).single()
  if (!data) return null
  return data
}

async function resolveMemoryMedia(
  vaultId: string,
  userId: string,
  formData: FormData,
): Promise<MemoryMediaResult> {
  const file = formData.get('media_file')
  const urlInput = (formData.get('media_url') as string)?.trim() || null

  if (file instanceof File && file.size > 0) {
    const isImage = file.type.startsWith('image/')
    const isVideo = file.type.startsWith('video/')
    if (!isImage && !isVideo) return { ok: false, error: 'Sadece fotoğraf veya video dosyası yükleyebilirsiniz.' }
    if (file.size > MAX_MEMORY_MEDIA_BYTES) return { ok: false, error: 'Dosya boyutu 50 MB sınırını aşıyor.' }

    const service = await createServiceClient()
    const filename = cleanFilename(file.name)
    const path = `memories/${vaultId}/${userId}/${Date.now()}-${filename}`
    const { error } = await service.storage.from(MEDIA_BUCKET).upload(path, file, {
      contentType: file.type,
      upsert: false,
    })
    if (error) return { ok: false, error: `Dosya yüklenemedi: ${error.message}` }

    const { data } = service.storage.from(MEDIA_BUCKET).getPublicUrl(path)
    return { ok: true, mediaUrl: data.publicUrl, mediaType: isImage ? 'image' : 'video' }
  }

  if (urlInput) {
    const explicitType = (formData.get('media_type') as string) || null
    const mediaType = explicitType === 'video' ? 'video' : 'image'
    return { ok: true, mediaUrl: urlInput, mediaType }
  }

  return { ok: true, mediaUrl: null, mediaType: null }
}

function redirectWithMemoryError(redirectTo: string | null, message: string): never {
  const target = redirectTo ?? '/dashboard'
  const separator = target.includes('?') ? '&' : '?'
  redirect(`${target}${separator}error=${encodeURIComponent(message)}`)
}

export async function addMemoryAction(vaultId: string, redirectTo: string | null, formData: FormData): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const vault = await assertOwner(supabase, vaultId, user.id)
  if (!vault || vault.status === 'pending_verification') return

  const title = (formData.get('title') as string)?.trim() || null
  const content = (formData.get('content') as string)?.trim()
  const memoryDate = (formData.get('memory_date') as string) || null
  const isSecret = formData.get('is_secret') === 'true'
  const section = (formData.get('section') as string)?.trim() || null

  if (!content || !memoryDate) return

  const mediaResult = await resolveMemoryMedia(vaultId, user.id, formData)
  if (!mediaResult.ok) redirectWithMemoryError(redirectTo, mediaResult.error)

  await supabase.from('vault_memories').insert({
    vault_id: vaultId,
    title,
    content,
    memory_date: memoryDate,
    is_secret: isSecret,
    section,
    media_url: mediaResult.mediaUrl,
    media_type: mediaResult.mediaType,
  })

  revalidatePath(`/dashboard/vault/${vaultId}/anilar`)
  revalidatePath(`/dashboard/vault/${vaultId}/gizli-kasa`)
  revalidatePath(`/dashboard/vault/${vaultId}/vasiyet`)
  revalidatePath(`/dashboard/vault/${vaultId}`)

  if (redirectTo) {
    const sep = redirectTo.includes('?') ? '&' : '?'
    redirect(`${redirectTo}${sep}saved=1`)
  }
}

export async function updateMemoryAction(memoryId: string, vaultId: string, redirectTo: string, formData: FormData): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const vault = await assertOwner(supabase, vaultId, user.id)
  if (!vault || vault.status === 'pending_verification') return

  const title = (formData.get('title') as string)?.trim() || null
  const content = (formData.get('content') as string)?.trim()
  const memoryDate = (formData.get('memory_date') as string) || null
  const section = (formData.get('section') as string) || null

  if (!content) return

  await supabase.from('vault_memories')
    .update({ title, content, memory_date: memoryDate, section, updated_at: new Date().toISOString() })
    .eq('id', memoryId)
    .eq('vault_id', vaultId)

  revalidatePath(`/dashboard/vault/${vaultId}/anilar`)
  revalidatePath(`/dashboard/vault/${vaultId}/gizli-kasa`)
  revalidatePath(`/dashboard/vault/${vaultId}/vasiyet`)
  revalidatePath(`/dashboard/vault/${vaultId}`)
  redirect(redirectTo)
}

export async function deleteMemoryAction(memoryId: string, vaultId: string): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const vault = await assertOwner(supabase, vaultId, user.id)
  if (!vault) return

  await supabase.from('vault_memories').delete().eq('id', memoryId).eq('vault_id', vaultId)

  revalidatePath(`/dashboard/vault/${vaultId}/anilar`)
  revalidatePath(`/dashboard/vault/${vaultId}/gizli-kasa`)
  revalidatePath(`/dashboard/vault/${vaultId}/vasiyet`)
  revalidatePath(`/dashboard/vault/${vaultId}`)
}
