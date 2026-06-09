import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
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
    .replace(/^(Re|Fwd|Fwd|Yanıt|YNT|TR|AW):\s*/i, '')
    .replace(/\s*[—–-]\s*\S.*$/, '')
    .trim()
}

async function fetchEmailBodyFromResend(emailId: string, apiKey: string): Promise<{ text?: string; html?: string } | null> {
  try {
    const response = await fetch(`https://api.resend.com/emails/${emailId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    })
    if (!response.ok) {
      console.warn(`[Resend API] Failed to fetch email ${emailId}: ${response.status}`)
      return null
    }
    const data = (await response.json()) as JsonRecord
    const text = typeof data.text === 'string' ? data.text : undefined
    const html = typeof data.html === 'string' ? data.html : undefined
    return { text, html }
  } catch (err) {
    console.error(`[Resend API] Error fetching email ${emailId}:`, err)
    return null
  }
}

export async function POST(req: NextRequest) {
  console.log('[inbound webhook] POST received at', new Date().toISOString())
  const supabase = await createServiceClient()

  // Token doğrulama
  const { data: tokenRow } = await supabase
    .from('platform_settings')
    .select('value')
    .eq('key', 'inbound_webhook_secret')
    .single()

  const secret = tokenRow?.value?.trim()
  console.log('[inbound webhook] secret exists:', !!secret)
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
  const message = (data.message as JsonRecord) ?? data

  const fromRaw = data.from ?? message.from ?? ''
  const toRaw = data.to ?? message.to ?? []
  const toArr = Array.isArray(toRaw)
    ? toRaw.map((item) => typeof item === 'string' ? item : typeof item === 'object' && item ? String((item as JsonRecord).email ?? (item as JsonRecord).address ?? '') : '')
      .filter(Boolean)
    : typeof toRaw === 'string'
      ? [toRaw]
      : []

  const subject = getString(data, 'subject') ?? getString(message, 'subject') ?? '(Konu yok)'
  let bodyText = getString(message, 'text')
    ?? getString(message, 'body')
    ?? getString(message, 'body_text')
    ?? getString(data, 'text')
    ?? getString(data, 'body')
    ?? getString(data, 'body_text')
  let bodyHtml = getString(message, 'html')
    ?? getString(message, 'body_html')
    ?? getString(message, 'body')
    ?? getString(data, 'html')
    ?? getString(data, 'body_html')
    ?? getString(data, 'body')

  // Eğer payload'da body yoksa ve email_id varsa, Resend API'den fetch et
  if (!bodyText && !bodyHtml) {
    const emailId = getString(data, 'email_id')
    console.log('[inbound webhook] bodyText/bodyHtml empty, emailId:', emailId)
    if (emailId) {
      // Resend API key'i platform_settings'den al
      const { data: apiKeyRow } = await supabase
        .from('platform_settings')
        .select('value')
        .eq('key', 'email_api_key')
        .single()

      const apiKey = apiKeyRow?.value?.trim()
      console.log('[inbound webhook] apiKey exists:', !!apiKey)
      if (apiKey) {
        const fetched = await fetchEmailBodyFromResend(emailId, apiKey)
        console.log('[inbound webhook] fetched body:', fetched)
        if (fetched) {
          bodyText = fetched.text || bodyText
          bodyHtml = fetched.html || bodyHtml
        }
      }
    }
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
        // İlk defa thread oluşturuluyor — her iki emaili de bağla
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
