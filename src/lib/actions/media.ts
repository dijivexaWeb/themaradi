'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { deleteR2Object, getPublicUrl } from '@/lib/r2'

const PHOTO_LIMIT_MEMORIAL = 50
const VIDEO_LIMIT_MEMORIAL = 10

type MediaKind = 'image' | 'video'

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

async function deleteCloudflareStreamVideo(streamId: string) {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID
  const apiToken = process.env.CLOUDFLARE_API_TOKEN
  if (!accountId || !apiToken || !streamId) return

  try {
    const res = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream/${streamId}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${apiToken}`,
        },
      }
    )
    if (!res.ok) {
      console.error('[deleteCloudflareStreamVideo] Cloudflare Stream returned error:', await res.text())
    }
  } catch (err) {
    console.error('[deleteCloudflareStreamVideo] Exception during delete:', err)
  }
}

export async function addPhotoAction(vaultId: string, formData: FormData): Promise<void> {
  const owned = await getOwnedVault(vaultId, 'image')
  if (!owned) return

  const caption = (formData.get('caption') as string | null)?.trim() || null
  const takenAt = normalizeTakenAt(formData.get('taken_at'))
  const visibility = normalizeVisibility(formData)
  const title = (formData.get('title') as string | null)?.trim()

  // R2 upload metadata sent from client
  const fileKey = (formData.get('file_key') as string | null)?.trim()
  const bucket = (formData.get('bucket') as string | null)?.trim()
  const fileSizeRaw = formData.get('file_size')
  const originalFilename = (formData.get('original_filename') as string | null)?.trim()
  const url = (formData.get('url') as string | null)?.trim()

  let finalUrl = ''
  let sourceType = 'url'

  if (fileKey && bucket) {
    finalUrl = getPublicUrl(fileKey)
    sourceType = 'bucket'
  } else if (url) {
    finalUrl = url
    sourceType = 'url'
  } else {
    console.error('[addPhotoAction] No photo source provided')
    return
  }

  const { error } = await owned.supabase.from('media').insert({
    vault_id: vaultId,
    uploader_id: owned.user.id,
    original_url: finalUrl,
    thumb_url: finalUrl,
    media_type: 'image',
    is_public: visibility === 'public',
    visibility,
    source_type: sourceType,
    storage_bucket: bucket || null,
    storage_path: fileKey || null,
    r2_file_key: fileKey || null,
    file_size_bytes: fileSizeRaw ? parseInt(fileSizeRaw.toString(), 10) : null,
    taken_at: takenAt,
    caption,
    original_filename: title || originalFilename || 'Fotoğraf',
    status: 'ready'
  })

  if (error) {
    console.error('[addPhotoAction] insert error:', error)
    return
  }

  const { data: vault } = await owned.supabase
    .from('vaults')
    .select('slug')
    .eq('id', vaultId)
    .single()

  revalidatePath(`/dashboard/vault/${vaultId}/fotolar`)
  revalidatePath(`/dashboard/vault/${vaultId}`)
  revalidatePath(`/dashboard/vault/${vaultId}/onizleme`)
  revalidatePath(`/preview/${vaultId}`)
  if (vault?.slug) {
    revalidatePath(`/memorial/${vault.slug}`)
  }
  redirect(`/dashboard/vault/${vaultId}/fotolar`)
}

export async function addVideoAction(vaultId: string, formData: FormData): Promise<void> {
  const owned = await getOwnedVault(vaultId, 'video')
  if (!owned) return

  const visibility = normalizeVisibility(formData)
  const caption = (formData.get('caption') as string | null)?.trim() || null
  const takenAt = normalizeTakenAt(formData.get('taken_at'))
  const title = (formData.get('title') as string | null)?.trim()

  // Cloudflare Stream video UID sent from client after direct upload
  const cfStreamId = (formData.get('cf_stream_id') as string | null)?.trim()
  const originalFilename = (formData.get('original_filename') as string | null)?.trim()
  const fileSizeRaw = formData.get('file_size')

  if (!cfStreamId) {
    console.error('[addVideoAction] cf_stream_id is required')
    return
  }

  // Cloudflare Stream universal playback & thumbnail formats
  const finalUrl = `https://iframe.videodelivery.net/${cfStreamId}`
  const thumbUrl = `https://videodelivery.net/${cfStreamId}/thumbnails/thumbnail.jpg`

  const { error } = await owned.supabase.from('media').insert({
    vault_id: vaultId,
    uploader_id: owned.user.id,
    original_url: finalUrl,
    thumb_url: thumbUrl,
    media_type: 'video',
    is_public: visibility === 'public',
    visibility,
    source_type: 'bucket',
    cf_stream_id: cfStreamId,
    file_size_bytes: fileSizeRaw ? parseInt(fileSizeRaw.toString(), 10) : null,
    taken_at: takenAt,
    caption,
    original_filename: title || originalFilename || 'Video',
    status: 'ready'
  })

  if (error) {
    console.error('[addVideoAction] insert error:', error)
    return
  }

  const { data: vault } = await owned.supabase
    .from('vaults')
    .select('slug')
    .eq('id', vaultId)
    .single()

  revalidatePath(`/dashboard/vault/${vaultId}/videolar`)
  revalidatePath(`/dashboard/vault/${vaultId}`)
  revalidatePath(`/dashboard/vault/${vaultId}/onizleme`)
  revalidatePath(`/preview/${vaultId}`)
  if (vault?.slug) {
    revalidatePath(`/memorial/${vault.slug}`)
  }
  redirect(`/dashboard/vault/${vaultId}/videolar`)
}

export async function updateMediaAction(mediaId: string, vaultId: string, redirectTo: string, formData: FormData): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: vault } = await supabase.from('vaults').select('id, slug').eq('id', vaultId).eq('owner_id', user.id).single()
  if (!vault) return

  const title = (formData.get('title') as string | null)?.trim() || null
  const caption = (formData.get('caption') as string | null)?.trim() || null
  const takenAt = normalizeTakenAt(formData.get('taken_at'))
  const visibility = normalizeVisibility(formData)
  const isPublic = visibility === 'public'

  await supabase.from('media').update({
    original_filename: title,
    caption,
    taken_at: takenAt,
    visibility,
    is_public: isPublic,
  }).eq('id', mediaId).eq('vault_id', vaultId)

  revalidatePath(`/dashboard/vault/${vaultId}/fotolar`)
  revalidatePath(`/dashboard/vault/${vaultId}/videolar`)
  revalidatePath(`/dashboard/vault/${vaultId}`)
  revalidatePath(`/dashboard/vault/${vaultId}/onizleme`)
  revalidatePath(`/preview/${vaultId}`)
  if (vault?.slug) {
    revalidatePath(`/memorial/${vault.slug}`)
  }
  redirect(redirectTo)
}

export async function deleteMediaAction(vaultId: string, mediaId: string): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: vault } = await supabase
    .from('vaults')
    .select('id, slug')
    .eq('id', vaultId)
    .eq('owner_id', user.id)
    .single()
  if (!vault) return

  const { data: media } = await supabase
    .from('media')
    .select('id, media_type, storage_bucket, storage_path, r2_file_key, cf_stream_id')
    .eq('id', mediaId)
    .eq('vault_id', vaultId)
    .single()
  if (!media) return

  // Delete DB record first
  await supabase.from('media').delete().eq('id', mediaId).eq('vault_id', vaultId)

  // Delete physical files
  if (media.media_type === 'video' && media.cf_stream_id) {
    // Delete from Cloudflare Stream
    await deleteCloudflareStreamVideo(media.cf_stream_id)
  } else if (media.r2_file_key && media.storage_bucket) {
    // Delete from Cloudflare R2
    await deleteR2Object(media.storage_bucket, media.r2_file_key)
  } else if (media.storage_bucket && media.storage_path) {
    // Fallback delete for legacy Supabase Storage files
    const service = await createServiceClient()
    await service.storage.from(media.storage_bucket).remove([media.storage_path])
  }

  const route = media.media_type === 'video' ? 'videolar' : 'fotolar'
  revalidatePath(`/dashboard/vault/${vaultId}/${route}`)
  revalidatePath(`/dashboard/vault/${vaultId}`)
  revalidatePath(`/dashboard/vault/${vaultId}/onizleme`)
  revalidatePath(`/preview/${vaultId}`)
  if (vault?.slug) {
    revalidatePath(`/memorial/${vault.slug}`)
  }
}
