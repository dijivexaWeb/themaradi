'use server'

import { createClient, createServiceClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

const MEDIA_BUCKET = 'vault-media'

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
): Promise<{ mediaUrl: string | null; mediaType: string | null }> {
  const file = formData.get('media_file')
  const urlInput = (formData.get('media_url') as string)?.trim() || null

  if (file instanceof File && file.size > 0) {
    const isImage = file.type.startsWith('image/')
    const isVideo = file.type.startsWith('video/')
    if (!isImage && !isVideo) return { mediaUrl: null, mediaType: null }

    const service = await createServiceClient()
    const filename = cleanFilename(file.name)
    const path = `memories/${vaultId}/${userId}/${Date.now()}-${filename}`
    const { error } = await service.storage.from(MEDIA_BUCKET).upload(path, file, {
      contentType: file.type,
      upsert: false,
    })
    if (error) return { mediaUrl: null, mediaType: null }

    const { data } = service.storage.from(MEDIA_BUCKET).getPublicUrl(path)
    return { mediaUrl: data.publicUrl, mediaType: isImage ? 'image' : 'video' }
  }

  if (urlInput) {
    const explicitType = (formData.get('media_type') as string) || null
    const mediaType = explicitType === 'video' ? 'video' : 'image'
    return { mediaUrl: urlInput, mediaType }
  }

  return { mediaUrl: null, mediaType: null }
}

export async function addMemoryAction(vaultId: string, formData: FormData): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const vault = await assertOwner(supabase, vaultId, user.id)
  if (!vault || vault.status === 'pending_verification') return

  const title = (formData.get('title') as string)?.trim() || null
  const content = (formData.get('content') as string)?.trim()
  const memoryDate = (formData.get('memory_date') as string) || null
  const isSecret = formData.get('is_secret') === 'true'
  const section = (formData.get('section') as string) || 'general'

  if (!content || !memoryDate) return

  const { mediaUrl, mediaType } = await resolveMemoryMedia(vaultId, user.id, formData)

  await supabase.from('vault_memories').insert({
    vault_id: vaultId,
    title,
    content,
    memory_date: memoryDate,
    is_secret: isSecret,
    section,
    media_url: mediaUrl,
    media_type: mediaType,
  })

  revalidatePath(`/dashboard/vault/${vaultId}/anilar`)
  revalidatePath(`/dashboard/vault/${vaultId}/gizli-kasa`)
  revalidatePath(`/dashboard/vault/${vaultId}/vasiyet`)
  revalidatePath(`/dashboard/vault/${vaultId}`)
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

  if (!content) return

  await supabase.from('vault_memories')
    .update({ title, content, memory_date: memoryDate, updated_at: new Date().toISOString() })
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
