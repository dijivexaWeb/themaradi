import { NextRequest, NextResponse } from 'next/server'
import { getAdminContext } from '@/lib/admin/auth'
import { createServiceClient } from '@/lib/supabase/server'
import { buildLabelSvg } from '@/lib/labels/build-label-svg'

export async function GET(request: NextRequest) {
  const ctx = await getAdminContext()
  if (!ctx) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  const vaultId = request.nextUrl.searchParams.get('vaultId')
  if (!vaultId) return NextResponse.json({ error: 'vaultId gerekli' }, { status: 400 })

  const supabase = await createServiceClient()
  const { data: vault, error } = await supabase
    .from('vaults')
    .select('display_name, qr_id, login_username')
    .eq('id', vaultId)
    .single()

  if (error || !vault) return NextResponse.json({ error: 'Kayıt bulunamadı' }, { status: 404 })

  const svg = await buildLabelSvg({
    displayName: vault.display_name,
    qrId: vault.qr_id,
    loginUsername: vault.login_username,
  })

  await supabase.from('vaults').update({ qr_label_printed: true }).eq('id', vaultId)

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Content-Disposition': `attachment; filename="etiket-${vaultId}.svg"`,
      'Cache-Control': 'no-store',
    },
  })
}
