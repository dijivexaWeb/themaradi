'use server'

import { createClient, createServiceClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { sendEmail } from '@/lib/email'
import { deleteR2Object, getPublicUrl, generateFileKey, uploadR2Object } from '@/lib/r2'

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

export async function addMemorialPhotoAction(vaultId: string, formData: FormData): Promise<{ error?: string } | void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'auth' }

  const { data: vault } = await supabase
    .from('vaults')
    .select('id, status, product_type, slug')
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

  const fileKey = (formData.get('file_key') as string | null)?.trim()
  const bucket = (formData.get('bucket') as string | null)?.trim()
  const fileNameInput = (formData.get('file_name') as string | null)?.trim()
  const fileSizeRaw = formData.get('file_size')
  const urlInput = (formData.get('url') as string | null)?.trim()

  if (fileKey && bucket) {
    originalUrl = getPublicUrl(fileKey)
    sourceType = 'bucket'
    storageBucket = bucket
    storagePath = fileKey
    fileSize = fileSizeRaw ? parseInt(fileSizeRaw as string, 10) : null
    filename = fileNameInput || null
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
    r2_file_key: fileKey || null,
    file_size_bytes: fileSize,
    taken_at: takenAt,
    caption,
    original_filename: title || filename || 'Fotoğraf',
    status: 'ready'
  })

  if (error) { console.error('[addMemorialPhotoAction] insert error:', error); return }

  revalidatePath(`/anma-paneli/${vaultId}/fotolar`)
  revalidatePath(`/anma-paneli/${vaultId}`)
  revalidatePath(`/dashboard/vault/${vaultId}/onizleme`)
  revalidatePath(`/preview/${vaultId}`)
  if (vault?.slug) {
    revalidatePath(`/memorial/${vault.slug}`)
  }
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

  const fileKey = (formData.get('file_key') as string | null)?.trim()
  const bucket = (formData.get('bucket') as string | null)?.trim()

  if (fileKey && bucket) {
    photoUrl = getPublicUrl(fileKey)
  }

  const fullName = (formData.get('full_name') as string)?.trim()
  if (!fullName) return

  const birthDate = (formData.get('birth_date') as string) || null
  const birthDatePrecision = (formData.get('birth_date_precision') as string) || 'day'
  const isAlive = formData.get('is_alive') !== 'false'
  const deathDate = isAlive ? null : (formData.get('death_date') as string) || null
  const deathDatePrecision = (formData.get('death_date_precision') as string) || 'day'

  await supabase
    .from('vault_family_members')
    .update({
      relationship: formData.get('relationship') as string,
      full_name: fullName,
      birth_date: birthDate,
      birth_date_precision: birthDate ? birthDatePrecision : null,
      death_date: deathDate,
      death_date_precision: deathDate ? deathDatePrecision : null,
      is_alive: isAlive,
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

export async function saveMemorialCemeteryAction(vaultId: string, formData: FormData): Promise<{ success: boolean }> {
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
  return { success: true }
}

export async function addMemorialVideoAction(vaultId: string, formData: FormData): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: vault } = await supabase
    .from('vaults')
    .select('id, status, product_type, slug')
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

  const cfStreamId = (formData.get('cf_stream_id') as string | null)?.trim()
  const originalFilename = (formData.get('original_filename') as string | null)?.trim()
  const fileSizeRaw = formData.get('file_size')
  const urlInput = (formData.get('url') as string | null)?.trim()

  let originalUrl: string | null = null
  let thumbUrl: string | null = null
  let sourceType = 'url'
  let fileSize: number | null = null
  let filename: string | null = null

  if (cfStreamId) {
    originalUrl = `https://iframe.videodelivery.net/${cfStreamId}`
    thumbUrl = `https://videodelivery.net/${cfStreamId}/thumbnails/thumbnail.jpg`
    sourceType = 'bucket'
    fileSize = fileSizeRaw ? parseInt(fileSizeRaw as string, 10) : null
    filename = originalFilename || null
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
    thumb_url: thumbUrl || undefined,
    media_type: 'video',
    is_public: visibility === 'public',
    visibility,
    source_type: sourceType,
    cf_stream_id: cfStreamId || null,
    file_size_bytes: fileSize,
    taken_at: takenAt,
    caption,
    original_filename: title || filename || 'Video',
    status: 'ready'
  })
  if (error) { console.error('[addMemorialVideoAction] insert error:', error); return }

  revalidatePath(`/anma-paneli/${vaultId}/videolar`)
  revalidatePath(`/anma-paneli/${vaultId}`)
  revalidatePath(`/dashboard/vault/${vaultId}/onizleme`)
  revalidatePath(`/preview/${vaultId}`)
  if (vault?.slug) {
    revalidatePath(`/memorial/${vault.slug}`)
  }
}

export async function addMemorialAudioAction(vaultId: string, formData: FormData): Promise<{ error?: string } | void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'auth' }

  const { data: vault } = await supabase
    .from('vaults')
    .select('id, status')
    .eq('id', vaultId)
    .eq('owner_id', user.id)
    .single()
  if (!vault) return { error: 'vault_not_found' }
  if (vault.status === 'pending_verification') return { error: 'locked' }

  const title = (formData.get('title') as string)?.trim()
  const author = (formData.get('author') as string)?.trim() || null
  if (!title) return { error: 'no_title' }

  const fileKey = (formData.get('file_key') as string | null)?.trim()
  const bucket = (formData.get('bucket') as string | null)?.trim()
  let audioUrl: string | null = (formData.get('audio_url') as string)?.trim() || null

  if (fileKey && bucket) {
    audioUrl = getPublicUrl(fileKey)
  }

  if (!audioUrl) return { error: 'no_url' }

  const { error: insertError } = await supabase.from('vault_audio_recordings').insert({
    vault_id: vaultId,
    title,
    author,
    audio_url: audioUrl,
    is_public: true,
  })

  if (insertError) return { error: insertError.message }

  revalidatePath(`/anma-paneli/${vaultId}/ses-kayitlari`)
  revalidatePath(`/anma-paneli/${vaultId}`)
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

  const fileKey = (formData.get('file_key') as string | null)?.trim()
  const bucket = (formData.get('bucket') as string | null)?.trim()
  const fileName = (formData.get('file_name') as string | null)?.trim()
  const fileSizeRaw = formData.get('file_size')
  const mimeType = (formData.get('mime_type') as string | null)?.trim()

  if (!fileKey || !bucket || !fileName || !fileSizeRaw || !mimeType) {
    console.error('[uploadVerificationDocAction] Missing R2 metadata')
    return
  }

  const fileSize = parseInt(fileSizeRaw as string, 10)

  if (!ALLOWED_DOC_MIME.has(mimeType)) {
    console.error('[uploadVerificationDocAction] Invalid MIME type:', mimeType)
    return
  }
  if (isNaN(fileSize) || fileSize > MAX_DOC_BYTES) {
    console.error('[uploadVerificationDocAction] File too large:', fileSize)
    return
  }

  // Önceki pending/rejected belgeler varsa sil (her vault için 1 aktif belge)
  await supabase.from('memorial_verification_docs')
    .delete().eq('vault_id', vaultId).in('status', ['pending', 'rejected'])

  await supabase.from('memorial_verification_docs').insert({
    vault_id: vaultId,
    uploader_id: user.id,
    file_name: fileName,
    file_url: '', // Özel belgelere direkt link verilmez
    file_key: fileKey,
    storage_bucket: bucket,
    storage_path: fileKey,
    file_size_bytes: fileSize,
    mime_type: mimeType,
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
    .select('id, storage_bucket, storage_path, file_key, status')
    .eq('vault_id', vaultId)
    .neq('status', 'approved')
    .single()
  if (!doc) return

  await supabase.from('memorial_verification_docs').delete().eq('id', doc.id)

  const keyToDelete = doc.file_key || doc.storage_path
  if (keyToDelete && doc.storage_bucket) {
    try {
      await deleteR2Object(doc.storage_bucket, keyToDelete)
    } catch (err) {
      console.error('[deleteVerificationDocAction] R2 delete failed:', err)
    }
  }

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
  const phone = (formData.get('phone') as string)?.trim() || null
  const consentProcessing = formData.get('consent_processing') === 'on'
  const consentPhone = formData.get('consent_phone') === 'on'
  const consentEmail = formData.get('consent_email') === 'on'

  if (!fullName || !email || !phone) return
  if (!consentProcessing || !consentPhone || !consentEmail) return

  // Mevcut şahit sayısını kontrol et (max 5)
  const { count } = await supabase.from('memorial_witnesses')
    .select('id', { count: 'exact', head: true }).eq('vault_id', vaultId)
  if ((count ?? 0) >= 5) return

  const { data: witness, error } = await supabase.from('memorial_witnesses').insert({
    vault_id: vaultId, full_name: fullName, email, phone,
    consent_processing: consentProcessing,
    consent_phone: consentPhone,
    consent_email: consentEmail,
  }).select('id, token').single()

  if (error || !witness) return

  // Şahide onay emaili gönder
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://theeternalmemory.com'
  const confirmUrl = `${baseUrl}/verify/witness?token=${witness.token}`

  try {
    await sendEmail({
      to: email,
      subject: `${vault.display_name} için vefat doğrulaması — Şahit onayı`,
      html: witnessEmailHtml(fullName, vault.display_name as string, confirmUrl),
    })
  } catch (e) {
    console.error('[addWitnessAction] email error:', e)
  }

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

  try {
    await sendEmail({
      to: witness.email,
      subject: `${vault.display_name} için vefat doğrulaması — Şahit onayı (Yeniden)`,
      html: witnessEmailHtml(witness.full_name, vault.display_name as string, confirmUrl),
    })
  } catch (e) {
    console.error('[resendWitnessEmailAction] email error:', e)
  }

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

// ─── Favori Şarkı Yükleme ────────────────────────────────────────────────────

const MAX_SONG_BYTES = 50 * 1024 * 1024 // 50 MB (bucket limiti)

export async function uploadSongFileAction(
  vaultId: string,
  formData: FormData
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Oturum bulunamadı' }

    const { data: vault } = await supabase
      .from('vaults')
      .select('id')
      .eq('id', vaultId)
      .eq('owner_id', user.id)
      .single()
    if (!vault) return { success: false, error: 'Yetkisiz' }

    const file = formData.get('song_file')
    if (!(file instanceof File) || file.size === 0) return { success: false, error: 'Dosya seçilmedi' }
    if (file.size > MAX_SONG_BYTES) return { success: false, error: 'Dosya çok büyük (max 50 MB)' }
    if (!file.type.startsWith('audio/')) return { success: false, error: 'Sadece ses dosyası yükleyebilirsiniz' }

    // Bucket audio/mp4 kabul ediyor, m4a için content type'ı normalize et
    const contentType = file.name.toLowerCase().endsWith('.m4a') ? 'audio/mp4' : file.type

    const bucket = process.env.R2_PUBLIC_BUCKET || 'tem-public-media'
    const key = generateFileKey('audio_recording', vaultId, file.name)
    const buffer = Buffer.from(await file.arrayBuffer())
    await uploadR2Object(bucket, key, buffer, contentType)
    const publicUrl = getPublicUrl(key)
    return { success: true, url: publicUrl }
  } catch (err) {
    console.error('[uploadSongFileAction]', err)
    return { success: false, error: 'Sunucu hatası' }
  }
}

// ─── QR / Slug Actions ───────────────────────────────────────────────────────

export async function checkSlugAvailabilityAction(
  slug: string,
  currentVaultId: string,
): Promise<{ available: boolean }> {
  if (!slug || slug.length < 3) return { available: false }
  const supabase = await createClient()
  const { data } = await supabase
    .from('vaults')
    .select('id')
    .eq('slug', slug)
    .neq('id', currentVaultId)
    .maybeSingle()
  return { available: !data }
}

export async function updateMemorialSlugAction(
  vaultId: string,
  newSlug: string,
): Promise<{ success: boolean; error?: string }> {
  if (!newSlug || newSlug.length < 3) return { success: false, error: 'Slug çok kısa' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Oturum bulunamadı' }

  const { data: vault } = await supabase
    .from('vaults')
    .select('id, slug')
    .eq('id', vaultId)
    .eq('owner_id', user.id)
    .single()
  if (!vault) return { success: false, error: 'Yetkisiz' }

  // Aynı slug ise işlem yapma
  if (vault.slug === newSlug) return { success: true }

  // Benzersiz mi kontrol et
  const { data: conflict } = await supabase
    .from('vaults')
    .select('id')
    .eq('slug', newSlug)
    .neq('id', vaultId)
    .maybeSingle()
  if (conflict) return { success: false, error: 'Bu adres zaten alınmış' }

  const { error } = await supabase
    .from('vaults')
    .update({ slug: newSlug })
    .eq('id', vaultId)
  if (error) return { success: false, error: error.message }

  revalidatePath(`/anma-paneli/${vaultId}/link-ayari`)
  if (vault.slug) revalidatePath(`/memorial/${vault.slug}`)
  revalidatePath(`/memorial/${newSlug}`)
  return { success: true }
}

// ─── Memorial Style Actions ───────────────────────────────────────────────────

export interface MemorialActionInput {
  id?: string | null
  label: string
  icon: string
  is_active: boolean
  show_counter: boolean
  sort_order: number
}

export async function saveMemorialStyleAction(
  vaultId: string,
  templateKey: string,
  actions: MemorialActionInput[]
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Oturum bulunamadı' }

  const { data: vault } = await supabase
    .from('vaults')
    .select('id')
    .eq('id', vaultId)
    .eq('owner_id', user.id)
    .single()

  if (!vault) return { success: false, error: 'Yetkisiz' }

  const service = await createServiceClient()

  const { error: styleErr } = await service
    .from('memorial_styles')
    .upsert(
      { memorial_id: vaultId, selected_template_key: templateKey, updated_at: new Date().toISOString() },
      { onConflict: 'memorial_id' }
    )

  if (styleErr) return { success: false, error: styleErr.message }

  // Mevcut action ID'lerini al
  const { data: existingRows } = await service
    .from('memorial_actions')
    .select('id')
    .eq('memorial_id', vaultId)

  const existingIds = new Set((existingRows ?? []).map((r: { id: string }) => r.id))
  const incomingIds = new Set(actions.filter(a => a.id).map(a => a.id!))

  // Silinenleri temizle — memorial_id skopuyla RLS bypass'ı önle
  const toDelete = [...existingIds].filter(id => !incomingIds.has(id))
  if (toDelete.length > 0) {
    await service.from('memorial_actions').delete().eq('memorial_id', vaultId).in('id', toDelete)
  }

  // Mevcutları güncelle
  for (const action of actions.filter(a => a.id)) {
    await service.from('memorial_actions')
      .update({
        label: action.label,
        icon: action.icon,
        is_active: action.is_active,
        show_counter: action.show_counter,
        sort_order: action.sort_order,
        updated_at: new Date().toISOString(),
      })
      .eq('id', action.id!)
      .eq('memorial_id', vaultId)
  }

  // Yenileri ekle
  const newActions = actions.filter(a => !a.id)
  if (newActions.length > 0) {
    await service.from('memorial_actions').insert(
      newActions.map(a => ({
        memorial_id: vaultId,
        label: a.label,
        icon: a.icon,
        is_active: a.is_active,
        show_counter: a.show_counter,
        sort_order: a.sort_order,
        count: 0,
      }))
    )
  }

  revalidatePath(`/anma-paneli/${vaultId}/anma-tarzi`)
  return { success: true }
}

// ─── Bulk-import: Sahiplen (claim) ─────────────────────────────────────────
// Toplu içe aktarımdan gelen (vault_origin='bulk_import') profiller 'unclaimed'
// durumda başlar. Alıcı kendisine verilen kullanıcı adı/şifreyle giriş yapıp
// bu action'ı çağırdığında profil kalıcı olarak yayına alınır — tek yönlü,
// geri alınamaz bir işlem.
export async function claimVaultAction(vaultId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Oturum bulunamadı.' }

  const { data: vault } = await supabase
    .from('vaults')
    .select('id, status, vault_origin')
    .eq('id', vaultId)
    .eq('owner_id', user.id)
    .single()

  if (!vault) return { success: false, error: 'Profil bulunamadı.' }
  if (vault.vault_origin !== 'bulk_import' || vault.status !== 'unclaimed') {
    return { success: false, error: 'Bu profil sahiplenilmeyi bekliyor durumda değil.' }
  }

  const now = new Date().toISOString()
  const { error } = await supabase
    .from('vaults')
    .update({ status: 'public_memorial', claimed_at: now, published_at: now })
    .eq('id', vaultId)

  if (error) return { success: false, error: error.message }

  revalidatePath(`/anma-paneli/${vaultId}`)
  return { success: true }
}
