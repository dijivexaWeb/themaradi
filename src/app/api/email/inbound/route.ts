import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

function parseFrom(raw: string): { email: string; name: string | null } {
  const match = raw.match(/^(.*?)\s*<([^>]+)>$/)
  if (match) return { name: match[1].trim() || null, email: match[2].trim() }
  return { name: null, email: raw.trim() }
}

function detectInbox(toAddresses: string[]): 'support' | 'partner' | 'privacy' | 'other' {
  for (const addr of toAddresses) {
    const local = addr.split('@')[0]?.toLowerCase()
    if (local === 'support') return 'support'
    if (local === 'partner') return 'partner'
    if (local === 'privacy') return 'privacy'
  }
  return 'other'
}

export async function POST(req: NextRequest) {
  const supabase = await createServiceClient()

  // Token doğrulama
  const { data: tokenRow } = await supabase
    .from('platform_settings')
    .select('value')
    .eq('key', 'inbound_webhook_secret')
    .single()

  const secret = tokenRow?.value?.trim()
  if (secret) {
    const incoming = req.nextUrl.searchParams.get('token')
    if (incoming !== secret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  let payload: Record<string, unknown>
  try {
    payload = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // Resend inbound format: payload ya direkt ya da payload.data altında olabilir
  const data = (payload.data as Record<string, unknown>) ?? payload

  const fromRaw = (data.from as string) ?? ''
  const toRaw = data.to as string | string[] | undefined
  const toArr = Array.isArray(toRaw) ? toRaw : typeof toRaw === 'string' ? [toRaw] : []
  const subject = (data.subject as string) ?? '(Konu yok)'
  const bodyText = (data.text as string) ?? null
  const bodyHtml = (data.html as string) ?? null

  const { email: fromEmail, name: fromName } = parseFrom(fromRaw)
  const inbox = detectInbox(toArr)

  const { error } = await supabase.from('inbound_emails').insert({
    inbox,
    from_email: fromEmail,
    from_name: fromName,
    subject,
    body_text: bodyText,
    body_html: bodyHtml,
    received_at: (payload.created_at as string) ?? new Date().toISOString(),
    raw_payload: payload,
  })

  if (error) {
    console.error('[inbound email] insert error:', error)
    return NextResponse.json({ error: 'DB error' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
