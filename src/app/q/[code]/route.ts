import { createServiceClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params
  const origin = new URL(request.url).origin
  const supabase = await createServiceClient()

  // Yeni sistem: qr_id (mem-XXXXXXXX formatı)
  if (code.startsWith('mem-')) {
    const { data: vault } = await supabase
      .from('vaults')
      .select('slug, status')
      .eq('qr_id', code)
      .single()

    if (!vault?.slug) {
      return NextResponse.redirect(`${origin}/q/not-found`, { status: 302 })
    }
    return NextResponse.redirect(`${origin}/memorial/${vault.slug}`, { status: 301 })
  }

  // Eski sistem: qr_code (büyük harf kısa kod)
  const upperCode = code.toUpperCase()

  const { data: vault } = await supabase
    .from('vaults')
    .select('id, slug, status')
    .eq('qr_code', upperCode)
    .single()

  if (vault) {
    void Promise.resolve(
      supabase.from('qr_scan_logs').insert({
        qr_code: upperCode,
        vault_id: vault.id,
        user_agent: request.headers.get('user-agent') ?? undefined,
      })
    ).catch(() => {})
  }

  if (!vault) {
    return NextResponse.redirect(`${origin}/q/not-found`, { status: 302 })
  }

  if (vault.status === 'public_memorial' || vault.status === 'private_memorial') {
    return NextResponse.redirect(`${origin}/memorial/${vault.slug}`, { status: 301 })
  }

  return NextResponse.redirect(`${origin}/q/pending?code=${upperCode}`, { status: 302 })
}
