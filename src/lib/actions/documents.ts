'use server'

import { createClient, createServiceClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

const BUCKET = 'vault-media'
const MAX_BYTES = 25 * 1024 * 1024 // 25 MB per file

const ALLOWED_MIME = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
])

function cleanFilename(name: string) {
  const cleaned = name
    .toLowerCase()
    .replace(/ş/g, 's').replace(/ğ/g, 'g').replace(/ü/g, 'u')
    .replace(/ö/g, 'o').replace(/ı/g, 'i').replace(/ç/g, 'c')
    .replace(/[^a-z0-9._-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
  return cleaned || 'belge'
}

export async function uploadDocumentsAction(vaultId: string, formData: FormData): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: vault } = await supabase
    .from('vaults').select('id, status')
    .eq('id', vaultId).eq('owner_id', user.id).single()
  if (!vault || vault.status === 'pending_verification') return

  const files = formData.getAll('files') as File[]
  const category = (formData.get('category') as string) || 'other'
  const description = (formData.get('description') as string)?.trim() || null

  const service = await createServiceClient()

  for (const file of files) {
    if (!(file instanceof File) || file.size === 0) continue
    if (!ALLOWED_MIME.has(file.type)) continue
    if (file.size > MAX_BYTES) continue

    const filename = cleanFilename(file.name)
    const path = `documents/${vaultId}/${user.id}/${Date.now()}-${filename}`

    const { error } = await service.storage.from(BUCKET).upload(path, file, {
      contentType: file.type,
      upsert: false,
    })
    if (error) continue

    const { data } = service.storage.from(BUCKET).getPublicUrl(path)

    await supabase.from('vault_documents').insert({
      vault_id: vaultId,
      uploader_id: user.id,
      file_name: file.name,
      file_url: data.publicUrl,
      storage_bucket: BUCKET,
      storage_path: path,
      file_size_bytes: file.size,
      mime_type: file.type,
      category,
      description,
    })
  }

  revalidatePath(`/dashboard/vault/${vaultId}/belgeler`)
  revalidatePath(`/dashboard/vault/${vaultId}`)
}

export async function deleteDocumentAction(docId: string, vaultId: string): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: doc } = await supabase
    .from('vault_documents').select('id, storage_bucket, storage_path')
    .eq('id', docId).eq('vault_id', vaultId).single()
  if (!doc) return

  await supabase.from('vault_documents').delete().eq('id', docId)

  const service = await createServiceClient()
  await service.storage.from(doc.storage_bucket).remove([doc.storage_path])

  revalidatePath(`/dashboard/vault/${vaultId}/belgeler`)
  revalidatePath(`/dashboard/vault/${vaultId}`)
}
