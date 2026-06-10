import { createClient } from '@/lib/supabase/server'
import { generateFileKey, createPresignedUploadUrl, getPublicUrl } from '@/lib/r2'
import type { NextRequest } from 'next/server'

const MAX_IMAGE_BYTES = 8 * 1024 * 1024       // 8 MB
const MAX_AUDIO_BYTES = 30 * 1024 * 1024     // 30 MB
const MAX_DOCUMENT_BYTES = 15 * 1024 * 1024  // 15 MB

const ALLOWED_IMAGES = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp'])
const ALLOWED_AUDIOS = new Set(['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav', 'audio/webm', 'audio/mp4', 'audio/m4a', 'audio/x-m4a'])
const ALLOWED_DOCS = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/heic',
])

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const body = await request.json()
    const { fileName, fileSize, category, profileId, orderId, mimeType } = body

    if (!fileName || !fileSize || !category || !mimeType) {
      return Response.json({ error: 'Eksik parametreler' }, { status: 400 })
    }

    // Determine ID context (profileId, orderId, or userId)
    let contextId = ''
    if (!user) {
      const isPublicGuestUpload = category === 'gallery_image' && profileId
      if (isPublicGuestUpload) {
        const { data: vault } = await supabase
          .from('vaults')
          .select('id, status')
          .eq('id', profileId)
          .single()

        if (!vault || vault.status !== 'public_memorial') {
          return Response.json({ error: 'Geçersiz veya yayında olmayan anı alanı' }, { status: 401 })
        }
        contextId = profileId
      } else {
        return Response.json({ error: 'Yetkisiz erişim' }, { status: 401 })
      }
    } else {
      contextId = user.id
      if (category === 'payment_proof' && orderId) {
        contextId = orderId
      } else if (profileId) {
        contextId = profileId
      }
    }

    // Validate size and mime type based on category
    let isAllowed = false
    let sizeLimit = 0

    if (['gallery_image', 'profile_cover', 'profile_photo', 'hero_bg'].includes(category)) {
      isAllowed = ALLOWED_IMAGES.has(mimeType)
      sizeLimit = MAX_IMAGE_BYTES
    } else if (category === 'audio_recording') {
      isAllowed = ALLOWED_AUDIOS.has(mimeType)
      sizeLimit = MAX_AUDIO_BYTES
    } else if (['death_certificate', 'verification_document', 'payment_proof'].includes(category)) {
      isAllowed = ALLOWED_DOCS.has(mimeType)
      sizeLimit = MAX_DOCUMENT_BYTES
    } else {
      return Response.json({ error: 'Geçersiz kategori' }, { status: 400 })
    }

    if (!isAllowed) {
      return Response.json({ error: `Desteklenmeyen dosya formatı: ${mimeType}` }, { status: 400 })
    }

    if (fileSize > sizeLimit) {
      const limitMb = sizeLimit / (1024 * 1024)
      return Response.json({ error: `Dosya boyutu sınırı aşıldı. Maksimum limit: ${limitMb} MB` }, { status: 400 })
    }

    // Select Bucket
    const isPrivate = ['death_certificate', 'verification_document', 'payment_proof'].includes(category)
    const bucket = isPrivate
      ? (process.env.R2_PRIVATE_BUCKET || 'tem-private-documents')
      : (process.env.R2_PUBLIC_BUCKET || 'tem-public-media')

    // Generate Object Key and Presigned Upload URL
    const fileKey = generateFileKey(category, contextId, fileName)
    const uploadUrl = await createPresignedUploadUrl(bucket, fileKey, mimeType, fileSize)

    return Response.json({
      uploadUrl,
      fileKey,
      bucket,
      publicUrl: getPublicUrl(fileKey),
    })
  } catch (error) {
    console.error('[presign API error]:', error)
    return Response.json({ error: 'Presign URL üretilemedi' }, { status: 500 })
  }
}
