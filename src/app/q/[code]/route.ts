import { createServiceClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params
  const upperCode = code.toUpperCase()
  const origin = new URL(request.url).origin

  const supabase = await createServiceClient()

  const { data: vault } = await supabase
    .from('vaults')
    .select('id, slug, status')
    .eq('qr_code', upperCode)
    .single()

  // Taramayı logla (fire-and-forget, hata yönlendirmeyi engellemesin)
  if (vault) {
    supabase
      .from('qr_scan_logs')
      .insert({
        qr_code: upperCode,
        vault_id: vault.id,
        user_agent: request.headers.get('user-agent') ?? undefined,
      })
      .then(() => {})
      .catch(() => {})
  }

  // QR kodu hiç tanınmıyorsa
  if (!vault) {
    return NextResponse.redirect(`${origin}/q/not-found`, { status: 302 })
  }

  // Profil yayında → direkt gönder
  if (vault.status === 'public_memorial' || vault.status === 'private_memorial') {
    return NextResponse.redirect(`${origin}/memorial/${vault.slug}`, {
      status: 301,
    })
  }

  // Henüz onaylanmamış / hazırlanıyor
  return NextResponse.redirect(
    `${origin}/q/pending?code=${upperCode}`,
    { status: 302 }
  )
}
