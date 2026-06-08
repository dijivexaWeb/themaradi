'use server'

import { verifyTurnstile } from '@/lib/turnstile'

export async function checkTurnstileAction(token: string): Promise<{ ok: boolean }> {
  const ok = await verifyTurnstile(token)
  return { ok }
}
