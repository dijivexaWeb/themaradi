import { createServiceClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ qr_id: string }> }
) {
  const { qr_id } = await params
  const supabase = await createServiceClient()

  const { data: vault } = await supabase
    .from('vaults')
    .select('slug, status')
    .eq('qr_id', qr_id)
    .single()

  if (!vault?.slug) {
    return NextResponse.redirect(new URL('/', _req.url), 302)
  }

  // Slug değişse bile qr_id sabit kalır — her zaman güncel slug'a yönlendir
  return NextResponse.redirect(
    new URL(`/memorial/${vault.slug}`, _req.url),
    { status: 301 }
  )
}
