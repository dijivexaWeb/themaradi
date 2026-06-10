import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import PostalMime from 'postal-mime'
import crypto from 'crypto'

type JsonRecord = Record<string, unknown>

function getString(obj: unknown, ...keys: string[]): string | null {
  if (!obj || typeof obj !== 'object') return null
  let current: unknown = obj
  for (const key of keys) {
    if (!current || typeof current !== 'object') return null
    if (key in current) {
      const value = (current as JsonRecord)[key]
      if (typeof value === 'string') return value
      current = value
    } else {
      return null
    }
  }
  return null
}

function parseFrom(raw: unknown): { email: string; name: string | null } {
  if (!raw) return { email: '', name: null }
  if (typeof raw === 'string') {
    const match = raw.match(/^(.*?)\s*<([^>]+)>$/)
    if (match) return { name: match[1].trim() || null, email: match[2].trim() }
    return { name: null, email: raw.trim() }
  }
  if (typeof raw === 'object') {
    const record = raw as JsonRecord
    const email = typeof record.email === 'string'
      ? record.email
      : typeof record.address === 'string'
        ? record.address
        : ''
    const name = typeof record.name === 'string' ? record.name.trim() : null
    return { email: email.trim(), name }
  }
  return { email: '', name: null }
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

function stripRePrefix(subject: string): string {
  return subject
    .replace(/^(Re|Fwd|Yanıt|YNT|TR|AW):\s*/i, '')
    .replace(/\s*[—–-]\s*\S.*$/, '')
    .trim()
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

  let payload: JsonRecord
  try {
    payload = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const data = (payload.data as JsonRecord) ?? payload

  const fromRaw = data.from ?? ''
  const toRaw = data.to ?? []
  const toArr = Array.isArray(toRaw)
    ? toRaw.map((item) => typeof item === 'string' ? item : '')
        .filter(Boolean)
    : typeof toRaw === 'string'
      ? [toRaw]
      : []

  const subject = getString(data, 'subject') ?? '(Konu yok)'

  let bodyText: string | null = null
  let bodyHtml: string | null = null

  // Cloudflare Worker'dan gelen raw MIME email
  const rawMime = getString(data, 'raw')
  if (rawMime) {
    try {
      const parsed = await PostalMime.parse(rawMime)
      bodyText = parsed.text ?? null
      bodyHtml = parsed.html ?? null
    } catch (err) {
      console.error('[inbound webhook] MIME parse error:', err)
    }
  }

  // Fallback: payload içinde direkt html/text alanları varsa
  if (!bodyText && !bodyHtml) {
    bodyText = getString(data, 'text') ?? getString(data, 'body_text') ?? null
    bodyHtml = getString(data, 'html') ?? getString(data, 'body_html') ?? null
  }

  const { email: fromEmail, name: fromName } = parseFrom(fromRaw)
  const inbox = detectInbox(toArr)

  // Kendi domain'imizden gelen mailler (outbound loop) — yoksay
  if (fromEmail.toLowerCase().endsWith('@theeternalmemory.com')) {
    return NextResponse.json({ ok: true, skipped: 'own_domain' })
  }

  // Thread algılama: aynı from_email + benzer konu → aynı thread
  let threadId: string | null = null
  const cleanedSubject = stripRePrefix(subject)

  if (cleanedSubject) {
    const { data: existing } = await supabase
      .from('inbound_emails')
      .select('id, thread_id')
      .eq('from_email', fromEmail)
      .ilike('subject', `%${cleanedSubject}%`)
      .order('received_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (existing) {
      if (existing.thread_id) {
        threadId = existing.thread_id
      } else {
        threadId = crypto.randomUUID()
        await supabase
          .from('inbound_emails')
          .update({ thread_id: threadId })
          .eq('id', existing.id)
      }
    }
  }

  const { error } = await supabase.from('inbound_emails').insert({
    inbox,
    from_email: fromEmail,
    from_name: fromName,
    subject,
    body_text: bodyText,
    body_html: bodyHtml,
    received_at: (payload.created_at as string) ?? new Date().toISOString(),
    thread_id: threadId,
    raw_payload: payload,
  })

  if (error) {
    console.error('[inbound email] insert error:', error)
    return NextResponse.json({ error: 'DB error' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
