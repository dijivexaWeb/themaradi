import { createClient } from '@supabase/supabase-js'
import { NextResponse, type NextRequest } from 'next/server'

export const runtime = 'edge'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Props { params: Promise<{ hash: string }> }

export async function GET(request: NextRequest, { params }: Props) {
  const { hash } = await params

  const { data: qr } = await supabase
    .from('dynamic_qr')
    .select('target_vault_id, is_active, redirect_count')
    .eq('qr_hash', hash)
    .eq('is_active', true)
    .single()

  if (!qr?.target_vault_id) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  const { data: vault } = await supabase
    .from('vaults')
    .select('slug, status')
    .eq('id', qr.target_vault_id)
    .single()

  // Track analytics (fire and forget)
  const ua = request.headers.get('user-agent') ?? ''
  const country = request.headers.get('x-vercel-ip-country') ?? null
  const city = request.headers.get('x-vercel-ip-city') ?? null
  const device = /Mobile|Android|iPhone|iPad/i.test(ua) ? 'mobile' : 'desktop'

  void Promise.resolve(supabase.from('qr_analytics').insert({
    qr_hash: hash,
    user_agent: ua.slice(0, 500),
    device_type: device,
    country_code: country,
    city,
  })).catch(() => {})

  if (!vault?.slug || vault.status !== 'public_memorial') {
    return NextResponse.redirect(new URL('/', request.url), { status: 302 })
  }

  return NextResponse.redirect(
    new URL(`/memorial/${vault.slug}`, request.url),
    { status: 302 }
  )
}
