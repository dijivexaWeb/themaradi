'use server'

import { createClient, createServiceClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { sendEmail } from '@/lib/email'

const MEDIA_BUCKET = 'vault-media'
const PHOTO_LIMIT_MEMORIAL = 50
const VIDEO_LIMIT_MEMORIAL = 10
const MAX_PHOTO_BYTES = 15 * 1024 * 1024
const MAX_VIDEO_BYTES = 100 * 1024 * 1024

function cleanFilename(name: string) {
  const cleaned = name
    .toLowerCase()
    .replace(/ş/g, 's').replace(/ğ/g, 'g').replace(/ü/g, 'u')
    .replace(/ö/g, 'o').replace(/ı/g, 'i').replace(/ç/g, 'c')
    .replace(/[^a-z0-9._-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
  return cleaned || 'photo'
}

export async function addMemorialPhotoAction(vaultId: string, formData: FormData): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: vault } = await supabase
    .from('vaults')
    .select('id, status, product_type')
    .eq('id', vaultId)
    .eq('owner_id', user.id)
    .eq('product_type', 'memorial_profile')
    .single()

  if (!vault || vault.status === 'pending_verification') return

  const { count } = await supabase
    .from('media')
    .select('*', { count: 'exact', head: true })
    .eq('vault_id', vaultId)
    .eq('media_type', 'image')

  if ((count ?? 0) >= PHOTO_LIMIT_MEMORIAL) return

  let originalUrl: string | null = null
  let sourceType = 'url'
  let storageBucket: string | null = null
  let storagePath: string | null = null
  let fileSize: number | null = null
  let filename: string | null = null

  const file = formData.get('file')
  const urlInput = (formData.get('url') as string | null)?.trim()

  if (file instanceof File && file.size > 0) {
    if (!file.type.startsWith('image/') || file.size > MAX_PHOTO_BYTES) return
    const service = await createServiceClient()
    const fn = cleanFilename(file.name)
    const path = `images/${vaultId}/${user.id}/${Date.now()}-${fn}`
    const { error } = await service.storage
      .from(MEDIA_BUCKET)
      .upload(path, file, { contentType: file.type, upsert: false })
    if (error) { console.error('[addMemorialPhotoAction] upload error:', error); return }
    const { data } = service.storage.from(MEDIA_BUCKET).getPublicUrl(path)
    originalUrl = data.publicUrl
    sourceType = 'bucket'
    storageBucket = MEDIA_BUCKET
    storagePath = path
    fileSize = file.size
    filename = fn
  } else if (urlInput) {
    originalUrl = urlInput
  } else {
    return
  }

  const caption = (formData.get('caption') as string | null)?.trim() || null
  const takenAtRaw = (formData.get('taken_at') as string | null)?.trim()
  const takenAt = takenAtRaw
    ? (isNaN(new Date(takenAtRaw).getTime()) ? null : new Date(takenAtRaw).toISOString())
    : null
  const visibility = formData.get('visibility') === 'public' ? 'public' : 'private'
  const title = (formData.get('title') as string | null)?.trim()

  const { error } = await supabase.from('media').insert({
    vault_id: vaultId,
    uploader_id: user.id,
    original_url: originalUrl,
    thumb_url: originalUrl,
    media_type: 'image',
    is_public: visibility === 'public',
    visibility,
    source_type: sourceType,
    storage_bucket: storageBucket,
    storage_path: storagePath,
    file_size_bytes: fileSize,
    taken_at: takenAt,
    caption,
    original_filename: title || filename || 'Fotoğraf',
  })

  if (error) { console.error('[addMemorialPhotoAction] insert error:', error); return }

  revalidatePath(`/anma-paneli/${vaultId}/fotolar`)
  revalidatePath(`/anma-paneli/${vaultId}`)
  redirect(`/anma-paneli/${vaultId}/fotolar`)
}

export async function updateMemorialFamilyMemberAction(
  memberId: string,
  vaultId: string,
  formData: FormData,
): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: vault } = await supabase
    .from('vaults')
    .select('id, status')
    .eq('id', vaultId)
    .eq('owner_id', user.id)
    .single()

  if (!vault || vault.status === 'pending_verification') return

  let photoUrl = (formData.get('photo_url') as string)?.trim() || null

  const photoFile = formData.get('photo_file')
  if (photoFile instanceof File && photoFile.size > 0 && photoFile.type.startsWith('image/')) {
    const service = await createServiceClient()
    const fn = cleanFilename(photoFile.name)
    const path = `family/${vaultId}/${user.id}/${Date.now()}-${fn}`
    const { error } = await service.storage
      .from(MEDIA_BUCKET)
      .upload(path, photoFile, { contentType: photoFile.type, upsert: false })
    if (!error) {
      const { data } = service.storage.from(MEDIA_BUCKET).getPublicUrl(path)
      photoUrl = data.publicUrl
    }
  }

  const fullName = (formData.get('full_name') as string)?.trim()
  if (!fullName) return

  await supabase
    .from('vault_family_members')
    .update({
      relationship: formData.get('relationship') as string,
      full_name: fullName,
      birth_date: (formData.get('birth_date') as string) || null,
      death_date: formData.get('is_alive') !== 'false' ? null : (formData.get('death_date') as string) || null,
      is_alive: formData.get('is_alive') !== 'false',
      photo_url: photoUrl,
      notes: (formData.get('notes') as string)?.trim() || null,
      parent_member_id: (formData.get('parent_member_id') as string) || null,
    })
    .eq('id', memberId)
    .eq('vault_id', vaultId)

  revalidatePath(`/anma-paneli/${vaultId}/aile`)
  revalidatePath(`/anma-paneli/${vaultId}`)
  redirect(`/anma-paneli/${vaultId}/aile`)
}

export async function saveMemorialCemeteryAction(vaultId: string, formData: FormData): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: vault } = await supabase
    .from('vaults')
    .select('id, status')
    .eq('id', vaultId)
    .eq('owner_id', user.id)
    .eq('product_type', 'memorial_profile')
    .single()

  if (!vault || vault.status === 'pending_verification') return

  const lat = (formData.get('cemetery_lat') as string)?.trim()
  const lng = (formData.get('cemetery_lng') as string)?.trim()

  await supabase
    .from('vaults')
    .update({
      cemetery_name: (formData.get('cemetery_name') as string)?.trim() || null,
      cemetery_address: (formData.get('cemetery_address') as string)?.trim() || null,
      cemetery_lat: lat ? parseFloat(lat) : null,
      cemetery_lng: lng ? parseFloat(lng) : null,
      cemetery_plot: (formData.get('cemetery_plot') as string)?.trim() || null,
      cemetery_row: (formData.get('cemetery_row') as string)?.trim() || null,
      cemetery_hours: (formData.get('cemetery_hours') as string)?.trim() || null,
      cemetery_note: (formData.get('cemetery_note') as string)?.trim() || null,
    })
    .eq('id', vaultId)

  revalidatePath(`/anma-paneli/${vaultId}/mezar`)
  revalidatePath(`/anma-paneli/${vaultId}`)
  redirect(`/anma-paneli/${vaultId}/mezar`)
}

export async function addMemorialVideoAction(vaultId: string, formData: FormData): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: vault } = await supabase
    .from('vaults')
    .select('id, status, product_type')
    .eq('id', vaultId)
    .eq('owner_id', user.id)
    .eq('product_type', 'memorial_profile')
    .single()
  if (!vault || vault.status === 'pending_verification') return

  const { count } = await supabase
    .from('media')
    .select('*', { count: 'exact', head: true })
    .eq('vault_id', vaultId)
    .eq('media_type', 'video')
  if ((count ?? 0) >= VIDEO_LIMIT_MEMORIAL) return

  const urlInput = (formData.get('url') as string | null)?.trim()
  const file = formData.get('file')

  let originalUrl: string | null = null
  let sourceType = 'url'
  let storageBucket: string | null = null
  let storagePath: string | null = null
  let fileSize: number | null = null
  let filename: string | null = null

  if (file instanceof File && file.size > 0) {
    if (!file.type.startsWith('video/') || file.size > MAX_VIDEO_BYTES) return
    const service = await createServiceClient()
    const fn = cleanFilename(file.name)
    const path = `videos/${vaultId}/${user.id}/${Date.now()}-${fn}`
    const { error } = await service.storage
      .from(MEDIA_BUCKET)
      .upload(path, file, { contentType: file.type, upsert: false })
    if (error) { console.error('[addMemorialVideoAction] upload error:', error); return }
    const { data } = service.storage.from(MEDIA_BUCKET).getPublicUrl(path)
    originalUrl = data.publicUrl
    sourceType = 'bucket'
    storageBucket = MEDIA_BUCKET
    storagePath = path
    fileSize = file.size
    filename = fn
  } else if (urlInput) {
    originalUrl = urlInput
  } else {
    return
  }

  const title = (formData.get('title') as string | null)?.trim()
  const caption = (formData.get('caption') as string | null)?.trim() || null
  const takenAtRaw = (formData.get('taken_at') as string | null)?.trim()
  const takenAt = takenAtRaw ? (isNaN(new Date(takenAtRaw).getTime()) ? null : new Date(takenAtRaw).toISOString()) : null
  const visibility = formData.get('visibility') === 'public' ? 'public' : 'private'

  const { error } = await supabase.from('media').insert({
    vault_id: vaultId,
    uploader_id: user.id,
    original_url: originalUrl,
    media_type: 'video',
    is_public: visibility === 'public',
    visibility,
    source_type: sourceType,
    storage_bucket: storageBucket,
    storage_path: storagePath,
    file_size_bytes: fileSize,
    taken_at: takenAt,
    caption,
    original_filename: title || filename || 'Video',
  })
  if (error) { console.error('[addMemorialVideoAction] insert error:', error); return }

  revalidatePath(`/anma-paneli/${vaultId}/videolar`)
  revalidatePath(`/anma-paneli/${vaultId}`)
  redirect(`/anma-paneli/${vaultId}/videolar`)
}

export async function addMemorialAudioAction(vaultId: string, formData: FormData): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: vault } = await supabase
    .from('vaults')
    .select('id, status')
    .eq('id', vaultId)
    .eq('owner_id', user.id)
    .eq('product_type', 'memorial_profile')
    .single()
  if (!vault || vault.status === 'pending_verification') return

  const title = (formData.get('title') as string)?.trim()
  const author = (formData.get('author') as string)?.trim() || null
  if (!title) return

  const file = formData.get('audio_file')
  let audioUrl: string | null = (formData.get('audio_url') as string)?.trim() || null

  if (file instanceof File && file.size > 0 && file.type.startsWith('audio/')) {
    const service = await createServiceClient()
    const fn = cleanFilename(file.name)
    const path = `audio/${vaultId}/${user.id}/${Date.now()}-${fn}`
    const { error } = await service.storage.from(MEDIA_BUCKET).upload(path, file, { contentType: file.type, upsert: false })
    if (!error) {
      const { data } = service.storage.from(MEDIA_BUCKET).getPublicUrl(path)
      audioUrl = data.publicUrl
    }
  }

  if (!audioUrl) return

  await supabase.from('vault_audio_recordings').insert({ vault_id: vaultId, title, author, audio_url: audioUrl, is_public: true })

  revalidatePath(`/anma-paneli/${vaultId}/ses-kayitlari`)
  revalidatePath(`/anma-paneli/${vaultId}`)
  redirect(`/anma-paneli/${vaultId}/ses-kayitlari`)
}

export async function updateMemorialAudioAction(recordingId: string, vaultId: string, formData: FormData): Promise<void> {
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
    .eq('id', recordingId)
    .eq('vault_id', vaultId)

  revalidatePath(`/anma-paneli/${vaultId}/ses-kayitlari`)
  redirect(`/anma-paneli/${vaultId}/ses-kayitlari`)
}

export async function saveMemorialThemeAction(vaultId: string, formData: FormData): Promise<{ success: boolean }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: vault } = await supabase
    .from('vaults')
    .select('id, status')
    .eq('id', vaultId)
    .eq('owner_id', user.id)
    .eq('product_type', 'memorial_profile')
    .single()
  if (!vault || vault.status === 'pending_verification') return { success: false }

  const theme = (formData.get('theme') as string)?.trim() || 'classic_emerald'
  const valid = ['classic_emerald', 'warm_sunset', 'midnight_silence', 'pure_light', 'rustic_autumn']
  if (!valid.includes(theme)) return { success: false }

  await supabase.from('vaults').update({ theme }).eq('id', vaultId)

  revalidatePath(`/anma-paneli/${vaultId}/gorunum`)
  revalidatePath(`/anma-paneli/${vaultId}`)
  return { success: true }
}

export async function publishMemorialAction(vaultId: string): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Kullanıcı sahipliği kontrolü
  const { data: vault } = await supabase
    .from('vaults')
    .select('id, status, slug')
    .eq('id', vaultId)
    .eq('owner_id', user.id)
    .eq('product_type', 'memorial_profile')
    .single()

  if (!vault || vault.status !== 'private_memorial') return

  // Doğrulama koşullarını kontrol et
  const ready = await isVerificationComplete(vaultId)
  if (!ready) return

  // Status güncellemesi için service client kullan (kullanıcı RLS'i bypass)
  const service = await createServiceClient()
  const { error } = await service.from('vaults')
    .update({ status: 'public_memorial' })
    .eq('id', vaultId)

  if (error) {
    console.error('[publishMemorialAction] update error:', error)
    return
  }

  revalidatePath(`/anma-paneli/${vaultId}`)
  revalidatePath(`/anma-paneli/${vaultId}/dogrulama`)
  if (vault.slug) revalidatePath(`/memorial/${vault.slug}`)
  redirect(`/anma-paneli/${vaultId}/dogrulama`)
}

// Doğrulama tamamlandı mı? (belge onaylı + min 2 şahit onaylı)
export async function isVerificationComplete(vaultId: string): Promise<boolean> {
  const supabase = await createServiceClient()
  const [{ data: doc }, { count: witnessCount }] = await Promise.all([
    supabase.from('memorial_verification_docs')
      .select('id')
      .eq('vault_id', vaultId)
      .eq('status', 'approved')
      .limit(1)
      .single(),
    supabase.from('memorial_witnesses')
      .select('id', { count: 'exact', head: true })
      .eq('vault_id', vaultId)
      .eq('status', 'confirmed'),
  ])
  return !!doc && (witnessCount ?? 0) >= 2
}

// --- Belge doğrulama ---

const ALLOWED_DOC_MIME = new Set([
  'application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'image/heic',
])
const MAX_DOC_BYTES = 20 * 1024 * 1024

export async function uploadVerificationDocAction(vaultId: string, formData: FormData): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: vault } = await supabase
    .from('vaults').select('id, status')
    .eq('id', vaultId).eq('owner_id', user.id).eq('product_type', 'memorial_profile').single()
  if (!vault || vault.status === 'pending_verification') return

  const file = formData.get('doc_file')
  if (!(file instanceof File) || file.size === 0) return
  if (!ALLOWED_DOC_MIME.has(file.type) || file.size > MAX_DOC_BYTES) return

  const service = await createServiceClient()
  const fn = cleanFilename(file.name)
  const path = `verification/${vaultId}/${user.id}/${Date.now()}-${fn}`
  const { error } = await service.storage.from(MEDIA_BUCKET).upload(path, file, { contentType: file.type, upsert: false })
  if (error) { console.error('[uploadVerificationDocAction]', error); return }

  const { data } = service.storage.from(MEDIA_BUCKET).getPublicUrl(path)

  // Önceki pending/rejected belgeler varsa sil (her vault için 1 aktif belge)
  await supabase.from('memorial_verification_docs')
    .delete().eq('vault_id', vaultId).in('status', ['pending', 'rejected'])

  await supabase.from('memorial_verification_docs').insert({
    vault_id: vaultId,
    uploader_id: user.id,
    file_name: file.name,
    file_url: data.publicUrl,
    storage_bucket: MEDIA_BUCKET,
    storage_path: path,
    file_size_bytes: file.size,
    mime_type: file.type,
    status: 'pending',
  })

  revalidatePath(`/anma-paneli/${vaultId}/dogrulama`)
  revalidatePath(`/anma-paneli/${vaultId}`)
  redirect(`/anma-paneli/${vaultId}/dogrulama`)
}

export async function deleteVerificationDocAction(vaultId: string): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: doc } = await supabase.from('memorial_verification_docs')
    .select('id, storage_path, status')
    .eq('vault_id', vaultId)
    .neq('status', 'approved')
    .single()
  if (!doc) return

  await supabase.from('memorial_verification_docs').delete().eq('id', doc.id)
  const service = await createServiceClient()
  await service.storage.from(MEDIA_BUCKET).remove([doc.storage_path])

  revalidatePath(`/anma-paneli/${vaultId}/dogrulama`)
  redirect(`/anma-paneli/${vaultId}/dogrulama`)
}

// --- Şahit işlemleri ---

export async function addWitnessAction(vaultId: string, formData: FormData): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: vault } = await supabase
    .from('vaults').select('id, status, display_name')
    .eq('id', vaultId).eq('owner_id', user.id).eq('product_type', 'memorial_profile').single()
  if (!vault || vault.status === 'pending_verification') return

  const fullName = (formData.get('full_name') as string)?.trim()
  const email = (formData.get('email') as string)?.trim().toLowerCase()
  if (!fullName || !email) return

  // Mevcut şahit sayısını kontrol et (max 5)
  const { count } = await supabase.from('memorial_witnesses')
    .select('id', { count: 'exact', head: true }).eq('vault_id', vaultId)
  if ((count ?? 0) >= 5) return

  const { data: witness, error } = await supabase.from('memorial_witnesses').insert({
    vault_id: vaultId, full_name: fullName, email,
  }).select('id, token').single()

  if (error || !witness) return

  // Şahide onay emaili gönder
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://theeternalmemory.com'
  const confirmUrl = `${baseUrl}/verify/witness?token=${witness.token}`

  await sendEmail({
    to: email,
    subject: `${vault.display_name} için vefat doğrulaması — Şahit onayı`,
    html: witnessEmailHtml(fullName, vault.display_name as string, confirmUrl),
  })

  revalidatePath(`/anma-paneli/${vaultId}/dogrulama`)
  redirect(`/anma-paneli/${vaultId}/dogrulama`)
}

export async function resendWitnessEmailAction(witnessId: string, vaultId: string): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: vault } = await supabase.from('vaults')
    .select('id, display_name').eq('id', vaultId).eq('owner_id', user.id).single()
  if (!vault) return

  const service = await createServiceClient()
  const { data: witness } = await service.from('memorial_witnesses')
    .select('id, full_name, email, token, status').eq('id', witnessId).eq('vault_id', vaultId).single()
  if (!witness || witness.status === 'confirmed') return

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://theeternalmemory.com'
  const confirmUrl = `${baseUrl}/verify/witness?token=${witness.token}`

  await sendEmail({
    to: witness.email,
    subject: `${vault.display_name} için vefat doğrulaması — Şahit onayı (Yeniden)`,
    html: witnessEmailHtml(witness.full_name, vault.display_name as string, confirmUrl),
  })

  revalidatePath(`/anma-paneli/${vaultId}/dogrulama`)
  redirect(`/anma-paneli/${vaultId}/dogrulama`)
}

export async function removeWitnessAction(witnessId: string, vaultId: string): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: vault } = await supabase.from('vaults')
    .select('id').eq('id', vaultId).eq('owner_id', user.id).single()
  if (!vault) return

  await supabase.from('memorial_witnesses')
    .delete().eq('id', witnessId).eq('vault_id', vaultId).neq('status', 'confirmed')

  revalidatePath(`/anma-paneli/${vaultId}/dogrulama`)
  redirect(`/anma-paneli/${vaultId}/dogrulama`)
}

function witnessEmailHtml(witnessName: string, deceasedName: string, confirmUrl: string): string {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="font-family:Georgia,serif;background:#fbf8f1;margin:0;padding:0;">
  <div style="max-width:520px;margin:32px auto;background:#fff;border:1px solid #e6dccb;border-radius:16px;overflow:hidden;">
    <div style="background:#0c3327;padding:24px 32px;text-align:center;">
      <span style="font-size:13px;letter-spacing:0.2em;color:#c7a76f;text-transform:uppercase;">The Eternal Memory</span>
    </div>
    <div style="padding:32px;color:#1f2d27;">
      <p style="font-size:15px;margin:0 0 16px;">Sayın <strong>${witnessName}</strong>,</p>
      <p style="font-size:14px;line-height:1.7;color:#4a5e55;margin:0 0 20px;">
        <strong>${deceasedName}</strong> adına hazırlanan anma sayfası için şahit olarak eklendiniz.
        Vefatı doğrulamak için aşağıdaki butona tıklayın.
      </p>
      <a href="${confirmUrl}" style="display:inline-block;background:#174f35;color:#fff;font-size:14px;font-weight:600;padding:14px 28px;border-radius:10px;text-decoration:none;margin-bottom:24px;">
        Şahitliği Onayla →
      </a>
      <p style="font-size:12px;color:#adb5ab;margin:0;">
        Bu e-postayı siz talep etmediyseniz dikkate almayınız.<br>
        Link tek kullanımlıktır.
      </p>
    </div>
    <div style="padding:16px 32px;border-top:1px solid #f0ebe0;text-align:center;font-size:11px;color:#adb5ab;">
      © The Eternal Memory — theeternalmemory.com
    </div>
  </div>
</body></html>`
}
