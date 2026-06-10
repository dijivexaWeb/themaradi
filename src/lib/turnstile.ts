'use server'

import { createServiceClient } from '@/lib/supabase/server'

// Static in-memory cache for the serverless container instance
let cachedSiteKey: string | null = null
let cachedSecretKey: string | null = null

export async function getTurnstileSiteKey(): Promise<string> {
  if (process.env.NODE_ENV === 'development') {
    return ''
  }

  // 1. Check environment variable first
  const envSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
  if (envSiteKey) {
    return envSiteKey.trim()
  }

  // 2. Check in-memory cache
  if (cachedSiteKey !== null) {
    return cachedSiteKey
  }

  // 3. Fallback to database query and cache
  try {
    const supabase = await createServiceClient()
    const { data } = await supabase
      .from('platform_settings')
      .select('value')
      .eq('key', 'turnstile_site_key')
      .maybeSingle()
    const siteKey = data?.value?.trim() ?? ''
    cachedSiteKey = siteKey
    return siteKey
  } catch (err) {
    console.error('Error fetching turnstile site key:', err)
    return ''
  }
}

export async function verifyTurnstile(token: string | null | undefined): Promise<boolean> {
  if (!token) return false

  // 1. Check environment variable first
  let secretKey = process.env.TURNSTILE_SECRET_KEY

  // 2. Check in-memory cache
  if (!secretKey && cachedSecretKey !== null) {
    secretKey = cachedSecretKey
  }

  // 3. Fallback to database query and cache
  if (!secretKey) {
    try {
      const supabase = await createServiceClient()
      const { data } = await supabase
        .from('platform_settings')
        .select('value')
        .eq('key', 'turnstile_secret_key')
        .maybeSingle()

      const fetchedKey = data?.value?.trim() ?? ''
      secretKey = fetchedKey
      cachedSecretKey = fetchedKey
    } catch (err) {
      console.error('Error fetching turnstile secret key:', err)
      return false
    }
  }

  if (!secretKey) return true  // not configured → skip check

  try {
    const resp = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret: secretKey, response: token }),
    })
    const json = await resp.json() as { success: boolean }
    return json.success === true
  } catch {
    return false
  }
}

