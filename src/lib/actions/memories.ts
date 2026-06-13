'use server'

import { createClient } from '@/lib/supabase/server'
import { generateFileKey, getPublicUrl, uploadR2Object } from '@/lib/r2'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

const MAX_MEMORY_MEDIA_BYTES = 50 * 1024 * 1024

type MemoryMediaResult =
  | { ok: true; mediaUrl: string | null; mediaType: string | null }
  | { ok: false; error: string }

async function assertOwner(supabase: Awaited<ReturnType<typeof createClient>>, vaultId: string, userId: string) {
  const { data } = await supabase.from('vaults').select('id, status').eq('id', vaultId).eq('owner_id', userId).single()
  if (!data) return null
  return data
}

async function uploadToCloudflareStream(file: File): Promise<string> {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID
  const apiToken = process.env.CLOUDFLARE_API_TOKEN
  if (!accountId || !apiToken) {
    throw new Error('Cloudflare Stream credentials are not configured')
  }

  const formData = new FormData()
  formData.append('file', file)

  const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/stream`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiToken}`,
    },
    body: formData,
  })

  if (!res.ok) {
    const errorJson = await res.json().catch(() => ({}))
    throw new Error(errorJson.errors?.[0]?.message || `Cloudflare Stream upload failed: ${res.statusText}`)
  }

  const data = await res.json()
  return `https://iframe.videodelivery.net/${data.result.uid}`
}

async function resolveMemoryMedia(
  vaultId: string,
  formData: FormData,
): Promise<MemoryMediaResult> {
  const file = formData.get('media_file')
  const urlInput = (formData.get('media_url') as string)?.trim() || null

  if (file instanceof File && file.size > 0) {
    const isImage = file.type.startsWith('image/')
    const isVideo = file.type.startsWith('video/')
    if (!isImage && !isVideo) return { ok: false, error: 'Sadece fotoğraf veya video dosyası yükleyebilirsiniz.' }
    if (file.size > MAX_MEMORY_MEDIA_BYTES) return { ok: false, error: 'Dosya boyutu 50 MB sınırını aşıyor.' }

    try {
      if (isImage) {
        const bucket = process.env.R2_PUBLIC_BUCKET || 'tem-public-media'
        const key = generateFileKey('gallery_image', vaultId, file.name)
        const buffer = Buffer.from(await file.arrayBuffer())
        await uploadR2Object(bucket, key, buffer, file.type)
        const mediaUrl = getPublicUrl(key)
        return { ok: true, mediaUrl, mediaType: 'image' }
      } else {
        const mediaUrl = await uploadToCloudflareStream(file)
        return { ok: true, mediaUrl, mediaType: 'video' }
      }
    } catch (err: any) {
      console.error('[resolveMemoryMedia] R2/Stream upload error:', err)
      return { ok: false, error: `Dosya yüklenemedi: ${err.message}` }
    }
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

  const mediaResult = await resolveMemoryMedia(vaultId, formData)
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

  revalidatePath(`/anma-paneli/${vaultId}/anilar`)
  revalidatePath(`/anma-paneli/${vaultId}`)

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

  revalidatePath(`/anma-paneli/${vaultId}/anilar`)
  revalidatePath(`/anma-paneli/${vaultId}`)
  redirect(redirectTo)
}

export async function deleteMemoryAction(memoryId: string, vaultId: string): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const vault = await assertOwner(supabase, vaultId, user.id)
  if (!vault) return

  await supabase.from('vault_memories').delete().eq('id', memoryId).eq('vault_id', vaultId)

  revalidatePath(`/anma-paneli/${vaultId}/anilar`)
  revalidatePath(`/anma-paneli/${vaultId}`)
}
