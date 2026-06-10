import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { nanoid } from 'nanoid'

// Initialize S3 Client configured for Cloudflare R2
const r2Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT || '',
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  },
})

/**
 * Cleans the file name by stripping Turkish characters and special characters.
 */
export function sanitizeFileName(name: string): string {
  const dotIndex = name.lastIndexOf('.')
  const ext = dotIndex > 0 ? name.slice(dotIndex).toLowerCase() : ''
  const base = dotIndex > 0 ? name.slice(0, dotIndex) : name

  const cleanedBase = base
    .toLowerCase()
    .replace(/ş/g, 's')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ö/g, 'o')
    .replace(/ı/g, 'i')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9._-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

  return (cleanedBase || 'file') + ext
}

/**
 * Generates the object key path for R2 based on the file category and ID context.
 */
export function generateFileKey(
  category: string,
  idContext: string, // profileId, orderId or userId
  fileName: string
): string {
  const fileId = nanoid(10)
  const safeName = sanitizeFileName(fileName)

  switch (category) {
    // Public Media
    case 'gallery_image':
      return `profiles/${idContext}/gallery/${fileId}-${safeName}`
    case 'memory_video':
      return `profiles/${idContext}/videos/original/${fileId}-${safeName}`
    case 'audio_recording':
      return `profiles/${idContext}/audio/${fileId}-${safeName}`
    case 'profile_cover':
    case 'profile_photo':
    case 'hero_bg':
      return `profiles/${idContext}/assets/${fileId}-${safeName}`

    // Private Documents
    case 'death_certificate':
    case 'verification_document':
      return `profiles/${idContext}/verification/${fileId}-${safeName}`
    case 'payment_proof':
      return `orders/${idContext}/payment-proofs/${fileId}-${safeName}`
    case 'private_user_file':
      return `users/${idContext}/private/${fileId}-${safeName}`

    default:
      return `uploads/${idContext}/${category}/${fileId}-${safeName}`
  }
}

/**
 * Creates a presigned PUT URL for frontend direct upload.
 * Valid for 15 minutes by default.
 */
export async function createPresignedUploadUrl(
  bucket: string,
  key: string,
  mimeType: string,
  sizeBytes: number
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: mimeType,
    ContentLength: sizeBytes,
  })

  // Expiration: 900 seconds = 15 minutes
  return getSignedUrl(r2Client, command, { expiresIn: 900 })
}

/**
 * Creates a presigned GET URL to view private files.
 * Valid for 15 minutes by default.
 */
export async function createPresignedReadUrl(
  bucket: string,
  key: string,
  expiresInSeconds = 900
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  })

  return getSignedUrl(r2Client, command, { expiresIn: expiresInSeconds })
}

/**
 * Deletes an object from the specified R2 bucket.
 */
export async function deleteR2Object(bucket: string, key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: bucket,
    Key: key,
  })

  await r2Client.send(command)
}

/**
 * Returns the public URL of a public R2 object.
 */
export function getPublicUrl(key: string): string {
  const publicBaseUrl = process.env.R2_PUBLIC_URL
  if (publicBaseUrl) {
    // Remove trailing slash if exists
    const cleanBase = publicBaseUrl.endsWith('/') ? publicBaseUrl.slice(0, -1) : publicBaseUrl
    return `${cleanBase}/${key}`
  }

  // Fallback to Cloudflare public R2 endpoint format if public URL is not configured
  const accountId = process.env.R2_ACCOUNT_ID
  const bucket = process.env.R2_PUBLIC_BUCKET || 'tem-public-media'
  return `https://${bucket}.${accountId}.r2.cloudflarestorage.com/${key}`
}
