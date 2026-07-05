import { createClient } from '@/lib/supabase/server'
import { generateFileKey, uploadR2Object, getPublicUrl } from '@/lib/r2'
import { verifyUploadOwnership } from '@/lib/r2-ownership'
import type { NextRequest } from 'next/server'

const MAX_IMAGE_BYTES = 8 * 1024 * 1024
const MAX_AUDIO_BYTES = 30 * 1024 * 1024
const MAX_DOCUMENT_BYTES = 15 * 1024 * 1024
const MAX_COVER_VIDEO_BYTES = 50 * 1024 * 1024

const ALLOWED_IMAGES = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic'])
const ALLOWED_AUDIOS = new Set(['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav', 'audio/webm', 'audio/mp4', 'audio/m4a', 'audio/x-m4a'])
const ALLOWED_DOCS = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic',
])

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return Response.json({ error: 'Yetkisiz erişim' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const category = formData.get('category') as string
    const profileId = formData.get('profileId') as string | null

    if (!file || !category) {
      return Response.json({ error: 'Eksik parametreler (file, category)' }, { status: 400 })
    }

    const mimeType = file.type || 'application/octet-stream'
    const fileSize = file.size
    const fileName = file.name

    const contextId = profileId ?? user.id

    // profileId varsa, bu kullanıcının gerçekten o profile/aile üzerinde yetkisi olduğunu
    // doğrula — aksi halde herkes başkasının vault/aile ID'siyle onun storage alanına
    // dosya yükleyebilirdi (IDOR).
    if (profileId) {
      const owns = await verifyUploadOwnership(supabase, user.id, category, profileId)
      if (!owns) {
        return Response.json({ error: 'Bu profil üzerinde yetkiniz yok' }, { status: 403 })
      }
    }

    // Validate category + mime + size
    let isAllowed = false
    let sizeLimit = 0
    let bucket = process.env.R2_PUBLIC_BUCKET || 'tem-public-media'

    if (['gallery_image', 'profile_cover', 'profile_photo', 'hero_bg', 'family_photo'].includes(category)) {
      isAllowed = ALLOWED_IMAGES.has(mimeType)
      sizeLimit = MAX_IMAGE_BYTES
    } else if (category === 'profile_cover_video') {
      isAllowed = ['video/mp4', 'video/quicktime', 'video/webm'].includes(mimeType)
      sizeLimit = MAX_COVER_VIDEO_BYTES
    } else if (category === 'audio_recording') {
      isAllowed = ALLOWED_AUDIOS.has(mimeType)
      sizeLimit = MAX_AUDIO_BYTES
    } else if (['death_certificate', 'verification_document', 'payment_proof'].includes(category)) {
      isAllowed = ALLOWED_DOCS.has(mimeType)
      sizeLimit = MAX_DOCUMENT_BYTES
      bucket = process.env.R2_PRIVATE_BUCKET || 'tem-private-documents'
    } else {
      return Response.json({ error: 'Geçersiz kategori' }, { status: 400 })
    }

    if (!isAllowed) {
      return Response.json({ error: `Desteklenmeyen dosya formatı: ${mimeType}` }, { status: 400 })
    }
    if (fileSize > sizeLimit) {
      const limitMb = sizeLimit / (1024 * 1024)
      return Response.json({ error: `Dosya çok büyük (max ${limitMb} MB)` }, { status: 400 })
    }

    const fileKey = generateFileKey(category, contextId, fileName)
    const buffer = Buffer.from(await file.arrayBuffer())
    await uploadR2Object(bucket, fileKey, buffer, mimeType)

    return Response.json({ publicUrl: getPublicUrl(fileKey), fileKey, bucket })
  } catch (error) {
    console.error('[r2/upload error]:', error)
    return Response.json({ error: 'Yükleme sırasında hata oluştu' }, { status: 500 })
  }
}
