// Upload a cover video to R2 and update the vault record
// Usage: node scripts/upload-cover-video.mjs

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { randomBytes } from 'crypto'
import { resolve } from 'path'
import { readFileSync as readEnv } from 'fs'

// Parse .env.local manually
function loadEnv(path) {
  try {
    const content = readEnv(path, 'utf8')
    for (const line of content.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eq = trimmed.indexOf('=')
      if (eq < 0) continue
      const key = trimmed.slice(0, eq).trim()
      const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '')
      if (!process.env[key]) process.env[key] = val
    }
  } catch {}
}
loadEnv(resolve(process.cwd(), '.env.local'))

const VAULT_ID = '36cfbd54-21ec-4a3c-919c-9bd042d8a651'
const VIDEO_PATH = resolve(process.cwd(), 'scripts/demo-photos/videos/გიორგი_ბერიძე.mp4')
const BUCKET = process.env.R2_PUBLIC_BUCKET || 'tem-public-media'
const PUBLIC_URL_BASE = process.env.R2_PUBLIC_URL || ''

const r2 = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
  requestChecksumCalculation: 'WHEN_REQUIRED',
  responseChecksumValidation: 'WHEN_REQUIRED',
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function main() {
  const fileId = randomBytes(6).toString('hex')
  const key = `profiles/${VAULT_ID}/cover-video/${fileId}-giorgi-beridze.mp4`
  const publicUrl = `${PUBLIC_URL_BASE.replace(/\/$/, '')}/${key}`

  console.log('Uploading:', VIDEO_PATH)
  console.log('R2 key:', key)

  const buffer = readFileSync(VIDEO_PATH)
  await r2.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: buffer,
    ContentType: 'video/mp4',
  }))
  console.log('Upload OK:', publicUrl)

  const { error } = await supabase
    .from('vaults')
    .update({ cover_video_url: publicUrl })
    .eq('id', VAULT_ID)

  if (error) throw new Error('DB update failed: ' + error.message)
  console.log('DB updated ✓')
  console.log('URL:', publicUrl)
}

main().catch(e => { console.error(e); process.exit(1) })
