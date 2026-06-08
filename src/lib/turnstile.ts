'use server'

import { createServiceClient } from '@/lib/supabase/server'

export async function getTurnstileSiteKey(): Promise<string> {
  const supabase = await createServiceClient()
  const { data } = await supabase
    .from('platform_settings')
    .select('value')
    .eq('key', 'turnstile_site_key')
    .maybeSingle()
  return data?.value?.trim() ?? ''
}

export async function verifyTurnstile(token: string | null | undefined): Promise<boolean> {
  if (!token) return false

  const supabase = await createServiceClient()
  const { data } = await supabase
    .from('platform_settings')
    .select('value')
    .eq('key', 'turnstile_secret_key')
    .maybeSingle()

  const secretKey = data?.value?.trim()
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
