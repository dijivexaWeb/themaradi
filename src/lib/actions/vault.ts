'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

function redirectToProfileWithMessage(vaultId: string, params: URLSearchParams): never {
  redirect(`/dashboard/vault/${vaultId}/profil?${params.toString()}`)
}

function redirectToProfileError(vaultId: string, message: string): never {
  const params = new URLSearchParams({ error: message })
  redirectToProfileWithMessage(vaultId, params)
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

export async function saveVaultProfileAction(vaultId: string, formData: FormData): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: vault } = await supabase
    .from('vaults')
    .select('id, display_name, status, cover_photo_url, hero_bg_url, favorite_song_url, theme')
    .eq('id', vaultId)
    .eq('owner_id', user.id)
    .single()

  if (!vault) redirectToProfileError(vaultId, 'Anı alanı bulunamadı.')
  if (vault.status === 'pending_verification') redirectToProfileError(vaultId, 'Ödeme doğrulanmadan kayıt yapılamaz.')

  const coverPhotoUrl = (formData.get('cover_photo_url') as string)?.trim() || vault.cover_photo_url || null
  const heroBgUrl = (formData.get('hero_bg_url') as string)?.trim() || vault.hero_bg_url || null
  const favoriteSongUrl = (formData.get('favorite_song_url') as string)?.trim() || vault.favorite_song_url || null

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
      theme: (formData.get('theme') as string)?.trim() || vault.theme || 'classic_emerald',
      updated_at: new Date().toISOString(),
    })
    .eq('id', vaultId)
    .eq('owner_id', user.id)

  if (error) redirectToProfileError(vaultId, `Kayıt yapılamadı: ${error.message}`)

  revalidatePath(`/dashboard/vault/${vaultId}`)
  revalidatePath(`/dashboard/vault/${vaultId}/profil`)
  revalidatePath(`/dashboard/vault/${vaultId}/onizleme`)
  
  const nextStep = (formData.get('next_step') as string) || '1'
  redirectToProfileWithMessage(vaultId, new URLSearchParams({ step: nextStep, saved: '1' }))
}
