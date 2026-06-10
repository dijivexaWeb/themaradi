'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { deleteR2Object, getPublicUrl } from '@/lib/r2'

export async function addAudioRecordingAction(vaultId: string, formData: FormData): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: vault } = await supabase.from('vaults').select('id, status').eq('id', vaultId).eq('owner_id', user.id).single()
  if (!vault || vault.status === 'pending_verification') return

  const title = (formData.get('title') as string)?.trim()
  const author = (formData.get('author') as string)?.trim() || null
  if (!title) return

  // R2 file upload details submitted from frontend
  const fileKey = (formData.get('file_key') as string | null)?.trim()
  const bucket = (formData.get('bucket') as string | null)?.trim()
  const originalUrl = (formData.get('audio_url') as string | null)?.trim()

  let audioUrl = ''
  let storageBucket: string | null = null
  let storagePath: string | null = null
  let r2FileKey: string | null = null

  if (fileKey && bucket) {
    audioUrl = getPublicUrl(fileKey)
    storageBucket = bucket
    storagePath = fileKey
    r2FileKey = fileKey
  } else if (originalUrl) {
    audioUrl = originalUrl
  } else {
    console.error('[addAudioRecordingAction] No audio file source provided')
    return
  }

  const { error } = await supabase.from('vault_audio_recordings').insert({
    vault_id: vaultId,
    title,
    author,
    audio_url: audioUrl,
    is_public: true,
    storage_bucket: storageBucket,
    storage_path: storagePath,
    r2_file_key: r2FileKey
  })

  if (error) {
    console.error('[addAudioRecordingAction] Insert error:', error.message)
  }

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

  const { data: recording } = await supabase
    .from('vault_audio_recordings')
    .select('id, storage_bucket, storage_path, r2_file_key')
    .eq('id', recordingId)
    .eq('vault_id', vaultId)
    .single()

  if (!recording) return

  // Delete DB record first
  await supabase.from('vault_audio_recordings').delete().eq('id', recordingId).eq('vault_id', vaultId)

  // Clean up R2 object if exists
  const keyToDelete = recording.r2_file_key || recording.storage_path
  if (keyToDelete && recording.storage_bucket) {
    try {
      await deleteR2Object(recording.storage_bucket, keyToDelete)
    } catch (err) {
      console.error('[deleteAudioRecordingAction] R2 delete failed:', err)
    }
  }

  revalidatePath(`/dashboard/vault/${vaultId}/ses-kayitlari`)
}
