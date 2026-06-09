import { createHmac, timingSafeEqual } from 'node:crypto'

const TOKEN_VERSION = 'v1'

function getPreviewSecret() {
  const secret = process.env.PREVIEW_TOKEN_SECRET ?? process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!secret) throw new Error('Preview token secret is not configured')
  return secret
}

function signPreviewPayload(vaultId: string) {
  return createHmac('sha256', getPreviewSecret())
    .update(`${TOKEN_VERSION}:${vaultId}`)
    .digest('base64url')
}

export function createPreviewToken(vaultId: string) {
  return `${TOKEN_VERSION}.${signPreviewPayload(vaultId)}`
}

export function verifyPreviewToken(vaultId: string, token: string | null | undefined) {
  if (!token) return false

  const [version, signature] = token.split('.')
  if (version !== TOKEN_VERSION || !signature) return false

  const expected = Buffer.from(signPreviewPayload(vaultId), 'base64url')
  const received = Buffer.from(signature, 'base64url')
  if (expected.length !== received.length) return false

  return timingSafeEqual(expected, received)
}
