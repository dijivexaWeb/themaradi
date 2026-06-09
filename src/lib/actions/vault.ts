'use server'

import { createClient, createServiceClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

const MEDIA_BUCKET = 'vault-media'
const MAX_PROFILE_PHOTO_BYTES = 15 * 1024 * 1024
const MAX_FAVORITE_SONG_BYTES = 25 * 1024 * 1024

function cleanFilename(name: string) {
  const cleaned = name
    .toLowerCase()
    .replace(/ş/g, 's').replace(/ğ/g, 'g').replace(/ü/g, 'u')
    .replace(/ö/g, 'o').replace(/ı/g, 'i').replace(/ç/g, 'c')
    .replace(/[^a-z0-9._-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

  return cleaned || 'profil-fotografi'
}

async function uploadProfilePhoto(vaultId: string, userId: string, formData: FormData) {
  const file = formData.get('cover_photo_file')
  if (!(file instanceof File) || file.size === 0) return null
  if (!file.type.startsWith('image/') || file.size > MAX_PROFILE_PHOTO_BYTES) return null

  const service = await createServiceClient()
  const path = `${vaultId}/${userId}/profile-${Date.now()}-${cleanFilename(file.name)}`
  let { error } = await service.storage.from(MEDIA_BUCKET).upload(path, file, {
    contentType: file.type,
    upsert: false,
  })
  if (error && error.message.toLowerCase().includes('bucket')) {
    await service.storage.createBucket(MEDIA_BUCKET, {
      public: true,
      fileSizeLimit: MAX_PROFILE_PHOTO_BYTES,
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    })
    const retry = await service.storage.from(MEDIA_BUCKET).upload(path, file, {
      contentType: file.type,
      upsert: false,
    })
    error = retry.error
  }
  if (error) return null

  const { data } = service.storage.from(MEDIA_BUCKET).getPublicUrl(path)
  return data.publicUrl
}

export async function createVaultAction(formData: FormData): Promise<void> {
  void formData
  redirect('/satin-al')
}

export async function updateVaultAction(vaultId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const updates: Record<string, unknown> = {}
  const displayName = formData.get('display_name') as string
  const birthDate = formData.get('birth_date') as string
  const deathDate = formData.get('death_date') as string

  if (displayName) updates.display_name = displayName.trim()
  if (birthDate) updates.birth_date = birthDate
  if (deathDate) updates.death_date = deathDate

  const { error } = await supabase
    .from('vaults')
    .update(updates)
    .eq('id', vaultId)
    .eq('owner_id', user.id)

  if (error) return { error: error.message }

  revalidatePath(`/dashboard/vault/${vaultId}`)
  return { success: true }
}

export async function updateBiographyAction(vaultId: string, content: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Basic XSS: strip HTML tags, keep text only
  const sanitized = content.replace(/<[^>]*>/g, '')

  const { error } = await supabase
    .from('vaults')
    .update({ biography: sanitized })
    .eq('id', vaultId)
    .eq('owner_id', user.id)

  if (error) return { error: error.message }

  revalidatePath(`/dashboard/vault/${vaultId}/biography`)
  return { success: true }
}

export async function deleteVaultAction(vaultId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { error } = await supabase
    .from('vaults')
    .delete()
    .eq('id', vaultId)
    .eq('owner_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard')
  redirect('/dashboard')
}

export async function linkQRToVaultAction(vaultId: string, qrHash: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Verify vault ownership
  const { data: vault } = await supabase
    .from('vaults')
    .select('id')
    .eq('id', vaultId)
    .eq('owner_id', user.id)
    .single()

  if (!vault) return { error: 'Anı alanı bulunamadı' }

  const { error } = await supabase
    .from('dynamic_qr')
    .update({
      target_vault_id: vaultId,
      activated_at: new Date().toISOString(),
    })
    .eq('qr_hash', qrHash)
    .is('target_vault_id', null)

  if (error) return { error: 'QR eşleştirme başarısız' }

  revalidatePath(`/dashboard/vault/${vaultId}/settings`)
  return { success: true }
}

async function uploadBgPhoto(vaultId: string, userId: string, formData: FormData) {
  const file = formData.get('hero_bg_file')
  if (!(file instanceof File) || file.size === 0) return null
  if (!file.type.startsWith('image/') || file.size > MAX_PROFILE_PHOTO_BYTES) return null

  const service = await createServiceClient()
  const path = `${vaultId}/${userId}/hero-bg-${Date.now()}-${cleanFilename(file.name)}`
  const { error } = await service.storage.from(MEDIA_BUCKET).upload(path, file, {
    contentType: file.type,
    upsert: false,
  })
  if (error) return null
  const { data } = service.storage.from(MEDIA_BUCKET).getPublicUrl(path)
  return data.publicUrl
}

async function uploadFavoriteSong(vaultId: string, userId: string, formData: FormData) {
  const file = formData.get('favorite_song_file')
  if (!(file instanceof File) || file.size === 0) return null
  if (!file.type.startsWith('audio/') || file.size > MAX_FAVORITE_SONG_BYTES) return null

  const service = await createServiceClient()
  const path = `${vaultId}/${userId}/favorite-song-${Date.now()}-${cleanFilename(file.name)}`
  const { error } = await service.storage.from(MEDIA_BUCKET).upload(path, file, {
    contentType: file.type,
    upsert: false,
  })
  if (error) return null

  const { data } = service.storage.from(MEDIA_BUCKET).getPublicUrl(path)
  return data.publicUrl
}

function redirectToProfileWithMessage(vaultId: string, params: URLSearchParams): never {
  redirect(`/dashboard/vault/${vaultId}/profil?${params.toString()}`)
}

function redirectToProfileError(vaultId: string, message: string): never {
  const params = new URLSearchParams({ error: message })
  redirectToProfileWithMessage(vaultId, params)
}

export async function saveVaultProfileAction(vaultId: string, formData: FormData): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: vault } = await supabase
    .from('vaults')
    .select('id, display_name, status, cover_photo_url, hero_bg_url, favorite_song_url')
    .eq('id', vaultId)
    .eq('owner_id', user.id)
    .single()

  if (!vault) redirectToProfileError(vaultId, 'Anı alanı bulunamadı.')
  if (vault.status === 'pending_verification') redirectToProfileError(vaultId, 'Ödeme doğrulanmadan kayıt yapılamaz.')

  const uploadedCoverUrl = await uploadProfilePhoto(vaultId, user.id, formData)
  const coverPhotoUrl = uploadedCoverUrl
    ?? (formData.get('cover_photo_url') as string)?.trim()
    ?? vault.cover_photo_url
    ?? null

  const uploadedBgUrl = await uploadBgPhoto(vaultId, user.id, formData)
  const heroBgUrl = uploadedBgUrl
    ?? (formData.get('hero_bg_url') as string)?.trim()
    ?? (vault as Record<string, unknown>).hero_bg_url as string | null
    ?? null

  const uploadedSongUrl = await uploadFavoriteSong(vaultId, user.id, formData)
  const favoriteSongUrl = uploadedSongUrl
    ?? (formData.get('favorite_song_url') as string)?.trim()
    ?? (vault as Record<string, unknown>).favorite_song_url as string | null
    ?? null

  const { error } = await supabase
    .from('vaults')
    .update({
      display_name: (formData.get('display_name') as string)?.trim() || vault.display_name,
      tagline: (formData.get('tagline') as string)?.trim() || null,
      profession: (formData.get('profession') as string)?.trim() || null,
      hobbies: (formData.get('hobbies') as string)?.trim() || null,
      favorite_song_title: (formData.get('favorite_song_title') as string)?.trim() || null,
      favorite_song_url: favoriteSongUrl || null,
      donation_preference: (formData.get('donation_preference') as string)?.trim() || null,
      donation_url: (formData.get('donation_url') as string)?.trim() || null,
      birth_date: (formData.get('birth_date') as string) || null,
      death_date: (formData.get('death_date') as string) || null,
      birth_place: (formData.get('birth_place') as string)?.trim() || null,
      death_place: (formData.get('death_place') as string)?.trim() || null,
      cover_photo_url: coverPhotoUrl || null,
      hero_bg_url: heroBgUrl || null,
      last_message: (formData.get('last_message') as string)?.trim() || null,
      cemetery_name: (formData.get('cemetery_name') as string)?.trim() || null,
      cemetery_address: (formData.get('cemetery_address') as string)?.trim() || null,
      cemetery_lat: (formData.get('cemetery_lat') as string) ? parseFloat(formData.get('cemetery_lat') as string) : null,
      cemetery_lng: (formData.get('cemetery_lng') as string) ? parseFloat(formData.get('cemetery_lng') as string) : null,
      cemetery_plot: (formData.get('cemetery_plot') as string)?.trim() || null,
      cemetery_row: (formData.get('cemetery_row') as string)?.trim() || null,
      cemetery_hours: (formData.get('cemetery_hours') as string)?.trim() || null,
      cemetery_note: (formData.get('cemetery_note') as string)?.trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', vaultId)
    .eq('owner_id', user.id)

  if (error) redirectToProfileError(vaultId, `Kayıt yapılamadı: ${error.message}`)

  revalidatePath(`/dashboard/vault/${vaultId}`)
  revalidatePath(`/dashboard/vault/${vaultId}/profil`)
  revalidatePath(`/dashboard/vault/${vaultId}/onizleme`)
  redirectToProfileWithMessage(vaultId, new URLSearchParams({ saved: '1' }))
}
