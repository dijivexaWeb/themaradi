'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient, createServiceClient } from '@/lib/supabase/server'

const MEDIA_BUCKET = 'vault-media'
const PHOTO_LIMIT_MEMORIAL = 50
const VIDEO_LIMIT_MEMORIAL = 10
const MAX_PHOTO_BYTES = 15 * 1024 * 1024
const MAX_VIDEO_BYTES = 100 * 1024 * 1024

type MediaKind = 'image' | 'video'

function cleanFilename(name: string) {
  const fallback = 'media'
  const cleaned = name
    .toLowerCase()
    .replace(/ş/g, 's').replace(/ğ/g, 'g').replace(/ü/g, 'u')
    .replace(/ö/g, 'o').replace(/ı/g, 'i').replace(/ç/g, 'c')
    .replace(/[^a-z0-9._-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

  return cleaned || fallback
}

function normalizeVisibility(formData: FormData) {
  return formData.get('visibility') === 'public' ? 'public' : 'private'
}

function normalizeTakenAt(value: FormDataEntryValue | null) {
  const raw = typeof value === 'string' ? value.trim() : ''
  if (!raw) return null

  const date = new Date(raw)
  return Number.isNaN(date.getTime()) ? null : date.toISOString()
}

async function getOwnedVault(vaultId: string, kind: MediaKind) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: vault } = await supabase
    .from('vaults')
    .select('id, status, product_type')
    .eq('id', vaultId)
    .eq('owner_id', user.id)
    .single()

  if (!vault || vault.status === 'pending_verification') return null

  const { count } = await supabase
    .from('media')
    .select('*', { count: 'exact', head: true })
    .eq('vault_id', vaultId)
    .eq('media_type', kind)

  if (vault.product_type === 'memorial_profile') {
    if (kind === 'image' && (count ?? 0) >= PHOTO_LIMIT_MEMORIAL) return null
    if (kind === 'video' && (count ?? 0) >= VIDEO_LIMIT_MEMORIAL) return null
  }

  return { supabase, user }
}

async function resolveMediaLocation(vaultId: string, userId: string, formData: FormData, kind: MediaKind) {
  const url = (formData.get('url') as string | null)?.trim()
  const file = formData.get('file')

  if (file instanceof File && file.size > 0) {
    const validPhoto = kind === 'image' && file.type.startsWith('image/') && file.size <= MAX_PHOTO_BYTES
    const validVideo = kind === 'video' && file.type.startsWith('video/') && file.size <= MAX_VIDEO_BYTES
    if (!validPhoto && !validVideo) return null

    const service = await createServiceClient()
    const filename = cleanFilename(file.name)
    const path = `${vaultId}/${userId}/${Date.now()}-${filename}`
    const { error } = await service.storage.from(MEDIA_BUCKET).upload(path, file, {
      contentType: file.type,
      upsert: false,
    })
    if (error) return null

    const { data } = service.storage.from(MEDIA_BUCKET).getPublicUrl(path)
    return {
      originalUrl: data.publicUrl,
      sourceType: 'bucket',
      storageBucket: MEDIA_BUCKET,
      storagePath: path,
      fileSize: file.size,
      filename,
    }
  }

  if (url) {
    return {
      originalUrl: url,
      sourceType: 'url',
      storageBucket: null,
      storagePath: null,
      fileSize: null,
      filename: null,
    }
  }

  return null
}

export async function addPhotoAction(vaultId: string, formData: FormData): Promise<void> {
  const owned = await getOwnedVault(vaultId, 'image')
  if (!owned) return

  const caption = (formData.get('caption') as string | null)?.trim()
  const takenAt = normalizeTakenAt(formData.get('taken_at'))
  const visibility = normalizeVisibility(formData)
  if (!caption || !takenAt) return

  const location = await resolveMediaLocation(vaultId, owned.user.id, formData, 'image')
  if (!location) return

  const title = (formData.get('title') as string | null)?.trim()

  await owned.supabase.from('media').insert({
    vault_id: vaultId,
    uploader_id: owned.user.id,
    original_url: location.originalUrl,
    thumb_url: location.originalUrl,
    media_type: 'image',
    is_public: visibility === 'public',
    visibility,
    source_type: location.sourceType,
    storage_bucket: location.storageBucket,
    storage_path: location.storagePath,
    file_size_bytes: location.fileSize,
    taken_at: takenAt,
    caption,
    original_filename: title || location.filename || 'Fotoğraf',
  })

  revalidatePath(`/dashboard/vault/${vaultId}/fotolar`)
  revalidatePath(`/dashboard/vault/${vaultId}`)
  revalidatePath(`/dashboard/vault/${vaultId}/onizleme`)
}

export async function addVideoAction(vaultId: string, formData: FormData): Promise<void> {
  const owned = await getOwnedVault(vaultId, 'video')
  if (!owned) return

  const visibility = normalizeVisibility(formData)
  const caption = (formData.get('caption') as string | null)?.trim()
  const takenAt = normalizeTakenAt(formData.get('taken_at'))
  if (!caption || !takenAt) return

  const location = await resolveMediaLocation(vaultId, owned.user.id, formData, 'video')
  if (!location) return

  const title = (formData.get('title') as string | null)?.trim()

  await owned.supabase.from('media').insert({
    vault_id: vaultId,
    uploader_id: owned.user.id,
    original_url: location.originalUrl,
    media_type: 'video',
    is_public: visibility === 'public',
    visibility,
    source_type: location.sourceType,
    storage_bucket: location.storageBucket,
    storage_path: location.storagePath,
    file_size_bytes: location.fileSize,
    taken_at: takenAt,
    caption,
    original_filename: title || location.filename || 'Video',
  })

  revalidatePath(`/dashboard/vault/${vaultId}/videolar`)
  revalidatePath(`/dashboard/vault/${vaultId}`)
  revalidatePath(`/dashboard/vault/${vaultId}/onizleme`)
}

export async function deleteMediaAction(vaultId: string, mediaId: string): Promise<void> {
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

  const { data: media } = await supabase
    .from('media')
    .select('id, media_type, storage_bucket, storage_path')
    .eq('id', mediaId)
    .eq('vault_id', vaultId)
    .single()
  if (!media) return

  await supabase.from('media').delete().eq('id', mediaId).eq('vault_id', vaultId)

  if (media.storage_bucket && media.storage_path) {
    const service = await createServiceClient()
    await service.storage.from(media.storage_bucket).remove([media.storage_path])
  }

  const route = media.media_type === 'video' ? 'videolar' : 'fotolar'
  revalidatePath(`/dashboard/vault/${vaultId}/${route}`)
  revalidatePath(`/dashboard/vault/${vaultId}`)
  revalidatePath(`/dashboard/vault/${vaultId}/onizleme`)
}
