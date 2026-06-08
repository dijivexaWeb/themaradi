import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import crypto from 'crypto'

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

function stripRePrefix(subject: string): string {
  return subject.replace(/^(Re|Fwd|Fwd|Yanıt|YNT|TR|AW):\s*/i, '').trim()
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

  const data = (payload.data as Record<string, unknown>) ?? payload

  const fromRaw = (data.from as string) ?? ''
  const toRaw = data.to as string | string[] | undefined
  const toArr = Array.isArray(toRaw) ? toRaw : typeof toRaw === 'string' ? [toRaw] : []
  const subject = (data.subject as string) ?? '(Konu yok)'
  const bodyText = (data.text as string) ?? null
  const bodyHtml = (data.html as string) ?? null

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
