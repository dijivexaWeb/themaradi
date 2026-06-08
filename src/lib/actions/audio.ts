'use server'

import { createClient, createServiceClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

const MEDIA_BUCKET = 'vault-media'

function cleanFilename(name: string) {
  return (name.toLowerCase()
    .replace(/ş/g, 's').replace(/ğ/g, 'g').replace(/ü/g, 'u')
    .replace(/ö/g, 'o').replace(/ı/g, 'i').replace(/ç/g, 'c')
    .replace(/[^a-z0-9._-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')) || 'audio'
}

export async function addAudioRecordingAction(vaultId: string, formData: FormData): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: vault } = await supabase.from('vaults').select('id, status').eq('id', vaultId).eq('owner_id', user.id).single()
  if (!vault || vault.status === 'pending_verification') return

  const title = (formData.get('title') as string)?.trim()
  const author = (formData.get('author') as string)?.trim() || null
  if (!title) return

  const file = formData.get('audio_file')
  let audioUrl: string | null = (formData.get('audio_url') as string)?.trim() || null

  if (file instanceof File && file.size > 0 && file.type.startsWith('audio/')) {
    const service = await createServiceClient()
    const filename = cleanFilename(file.name)
    const path = `audio/${vaultId}/${user.id}/${Date.now()}-${filename}`
    const { error } = await service.storage.from(MEDIA_BUCKET).upload(path, file, {
      contentType: file.type,
      upsert: false,
    })
    if (!error) {
      const { data } = service.storage.from(MEDIA_BUCKET).getPublicUrl(path)
      audioUrl = data.publicUrl
    }
  }

  if (!audioUrl) return

  await supabase.from('vault_audio_recordings').insert({
    vault_id: vaultId,
    title,
    author,
    audio_url: audioUrl,
    is_public: true,
  })

  revalidatePath(`/dashboard/vault/${vaultId}/ses-kayitlari`)
}

export async function updateAudioRecordingAction(recordingId: string, vaultId: string, formData: FormData): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: vault } = await supabase.from('vaults').select('id').eq('id', vaultId).eq('owner_id', user.id).single()
  if (!vault) return

  const title = (formData.get('title') as string)?.trim()
  const author = (formData.get('author') as string)?.trim() || null
  const isPublic = formData.get('is_public') === 'true'
  if (!title) return

  await supabase.from('vault_audio_recordings')
    .update({ title, author, is_public: isPublic })
    .eq('id', recordingId).eq('vault_id', vaultId)

  revalidatePath(`/dashboard/vault/${vaultId}/ses-kayitlari`)
  redirect(`/dashboard/vault/${vaultId}/ses-kayitlari`)
}

export async function deleteAudioRecordingAction(recordingId: string, vaultId: string): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: vault } = await supabase.from('vaults').select('id').eq('id', vaultId).eq('owner_id', user.id).single()
  if (!vault) return

  await supabase.from('vault_audio_recordings').delete().eq('id', recordingId).eq('vault_id', vaultId)

  revalidatePath(`/dashboard/vault/${vaultId}/ses-kayitlari`)
}
