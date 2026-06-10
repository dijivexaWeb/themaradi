import { createClient } from '@/lib/supabase/server'
import type { NextRequest } from 'next/server'

const MAX_VIDEO_BYTES = 100 * 1024 * 1024 // 100 MB
const MAX_DURATION_SECONDS = 600          // 10 minutes

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return Response.json({ error: 'Yetkisiz erişim' }, { status: 401 })
    }

    const body = await request.json()
    const { fileName, fileSize, profileId, duration } = body

    if (!fileName || !fileSize || !profileId) {
      return Response.json({ error: 'Eksik parametreler' }, { status: 400 })
    }

    // Server-side check for video size limit
    if (fileSize > MAX_VIDEO_BYTES) {
      return Response.json({ error: 'Video boyutu en fazla 100 MB olabilir.' }, { status: 400 })
    }

    // Server-side check for video duration (if provided by frontend metadata reader)
    if (duration && duration > MAX_DURATION_SECONDS) {
      return Response.json({ error: 'Video süresi en fazla 10 dakika olabilir.' }, { status: 400 })
    }

    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID
    const apiToken = process.env.CLOUDFLARE_API_TOKEN

    if (!accountId || !apiToken) {
      console.error('[stream upload-url] Missing env vars — CLOUDFLARE_ACCOUNT_ID or CLOUDFLARE_API_TOKEN not set')
      return Response.json({ error: 'Cloudflare Stream entegrasyonu sunucu tarafında yapılandırılmamış.' }, { status: 500 })
    }

    console.log('[stream upload-url] Calling Cloudflare Stream API for account:', accountId.slice(0, 6) + '…')

    // Expiry: 30 minutes from now
    const expiryDate = new Date(Date.now() + 30 * 60 * 1000).toISOString()

    const cfResponse = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream/direct_upload`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          maxDurationSeconds: MAX_DURATION_SECONDS,
          expiry: expiryDate,
          meta: {
            name: fileName,
            profileId,
            uploaderId: user.id,
          },
        }),
      }
    )

    if (!cfResponse.ok) {
      const errorText = await cfResponse.text()
      console.error('[Cloudflare Stream direct_upload error]:', errorText)
      return Response.json({ error: 'Cloudflare Stream yükleme adresi alınamadı' }, { status: 502 })
    }

    const data = await cfResponse.json()

    if (!data.success || !data.result) {
      return Response.json({ error: 'Cloudflare Stream yükleme adresi geçersiz' }, { status: 502 })
    }

    return Response.json({
      uploadUrl: data.result.uploadURL,
      uid: data.result.uid,
    })
  } catch (error) {
    console.error('[stream upload-url API error]:', error)
    return Response.json({ error: 'Yükleme bağlantısı oluşturulamadı' }, { status: 500 })
  }
}
