'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { deleteR2Object } from '@/lib/r2'

export async function uploadDocumentsAction(vaultId: string, formData: FormData): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: vault } = await supabase
    .from('vaults').select('id, status')
    .eq('id', vaultId).eq('owner_id', user.id).single()
  if (!vault || vault.status === 'pending_verification') return

  const category = (formData.get('category') as string) || 'other'
  const description = (formData.get('description') as string)?.trim() || null
  const uploadedFilesRaw = formData.get('uploaded_files') as string

  if (!uploadedFilesRaw) {
    console.error('[uploadDocumentsAction] No uploaded files metadata provided')
    return
  }

  try {
    const files = JSON.parse(uploadedFilesRaw) as Array<{
      fileKey: string
      fileName: string
      fileSize: number
      mimeType: string
      bucket: string
    }>

    for (const file of files) {
      const { error } = await supabase.from('vault_documents').insert({
        vault_id: vaultId,
        uploader_id: user.id,
        file_name: file.fileName,
        file_url: '', // Private files have blank public URL for security
        file_key: file.fileKey,
        storage_bucket: file.bucket,
        storage_path: file.fileKey,
        file_size_bytes: file.fileSize,
        mime_type: file.mimeType,
        category,
        description,
      })
      if (error) {
        console.error('[uploadDocumentsAction] Insert error:', error.message)
      }
    }
  } catch (err) {
    console.error('[uploadDocumentsAction] Parsing metadata or inserting failed:', err)
  }

  revalidatePath(`/dashboard/vault/${vaultId}/belgeler`)
  revalidatePath(`/dashboard/vault/${vaultId}`)
}

export async function deleteDocumentAction(docId: string, vaultId: string): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: doc } = await supabase
    .from('vault_documents').select('id, storage_bucket, storage_path, file_key')
    .eq('id', docId).eq('vault_id', vaultId).single()
  if (!doc) return

  await supabase.from('vault_documents').delete().eq('id', docId)

  // Delete from R2 Private Bucket
  const keyToDelete = doc.file_key || doc.storage_path
  if (keyToDelete && doc.storage_bucket) {
    try {
      await deleteR2Object(doc.storage_bucket, keyToDelete)
    } catch (err) {
      console.error('[deleteDocumentAction] R2 delete failed:', err)
    }
  }

  revalidatePath(`/dashboard/vault/${vaultId}/belgeler`)
  revalidatePath(`/dashboard/vault/${vaultId}`)
}
