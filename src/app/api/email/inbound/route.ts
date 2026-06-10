import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import PostalMime from 'postal-mime'
import { uploadR2Object, sanitizeFileName } from '@/lib/r2'
import crypto from 'crypto'

type JsonRecord = Record<string, unknown>

interface AttachmentMeta {
  filename: string
  mimeType: string
  size: number
  url: string
}

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
    ? toRaw.map((item) => typeof item === 'string' ? item : '').filter(Boolean)
    : typeof toRaw === 'string' ? [toRaw] : []

  let bodyText: string | null = null
  let bodyHtml: string | null = null
  let subject = getString(data, 'subject') ?? '(Konu yok)'
  const attachments: AttachmentMeta[] = []

  const rawMime = getString(data, 'raw')
  const rawEncoding = getString(data, 'raw_encoding')
  if (rawMime) {
    try {
      const input = rawEncoding === 'base64'
        ? Buffer.from(rawMime, 'base64')
        : rawMime
      const parsed = await PostalMime.parse(input)
      bodyText = parsed.text ?? null
      bodyHtml = parsed.html ?? null
      if (parsed.subject) subject = parsed.subject

      // Attachments — R2 private bucket'a yükle
      const bucket = process.env.R2_PRIVATE_BUCKET || 'tem-private-documents'
      const msgId = crypto.randomUUID()

      for (const att of parsed.attachments ?? []) {
        if (!att.content) continue

        // content: string | ArrayBuffer | Uint8Array — normalize to Uint8Array
        let content: Uint8Array
        if (att.content instanceof Uint8Array) {
          content = att.content
        } else if (att.content instanceof ArrayBuffer) {
          content = new Uint8Array(att.content)
        } else {
          content = new TextEncoder().encode(att.content as string)
        }

        if (content.length === 0) continue
        const MAX_SIZE = 20 * 1024 * 1024
        if (content.length > MAX_SIZE) continue

        const filename = sanitizeFileName(att.filename || `attachment-${Date.now()}`)
        const key = `email-attachments/${msgId}/${filename}`
        const mimeType = att.mimeType || 'application/octet-stream'

        try {
          await uploadR2Object(bucket, key, content, mimeType)
          attachments.push({
            filename: att.filename || filename,
            mimeType,
            size: content.length,
            url: key,
          })
        } catch (err) {
          console.error('[inbound webhook] attachment upload error:', err)
        }
      }
    } catch (err) {
      console.error('[inbound webhook] MIME parse error:', err)
    }
  }

  if (!bodyText && !bodyHtml) {
    bodyText = getString(data, 'text') ?? getString(data, 'body_text') ?? null
    bodyHtml = getString(data, 'html') ?? getString(data, 'body_html') ?? null
  }

  const { email: fromEmail, name: fromName } = parseFrom(fromRaw)
  const inbox = detectInbox(toArr)

  if (fromEmail.toLowerCase().endsWith('@theeternalmemory.com')) {
    return NextResponse.json({ ok: true, skipped: 'own_domain' })
  }

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
        await supabase.from('inbound_emails').update({ thread_id: threadId }).eq('id', existing.id)
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
    attachments: attachments.length > 0 ? attachments : [],
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
