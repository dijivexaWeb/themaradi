import { NextRequest, NextResponse } from 'next/server'
import { getAdminContext } from '@/lib/admin/auth'
import { createServiceClient } from '@/lib/supabase/server'
import { buildLetterPdf, type LetterRecord } from '@/lib/labels/build-letter-pdf'

export async function GET(request: NextRequest) {
  const ctx = await getAdminContext()
  if (!ctx) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  const batchId = request.nextUrl.searchParams.get('batchId')
  const vaultId = request.nextUrl.searchParams.get('vaultId')
  if (!batchId && !vaultId) {
    return NextResponse.json({ error: 'batchId veya vaultId gerekli' }, { status: 400 })
  }

  const supabase = await createServiceClient()
  let query = supabase
    .from('vaults')
    .select('id, display_name, bulk_batch_id')
    .eq('vault_origin', 'bulk_import')
    .order('display_name', { ascending: true })

  query = batchId ? query.eq('bulk_batch_id', batchId) : query.eq('id', vaultId as string)

  const { data: vaults, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!vaults?.length) return NextResponse.json({ error: 'Kayıt bulunamadı' }, { status: 404 })

  const records: LetterRecord[] = vaults.map((v) => ({ displayName: v.display_name }))
  const pdf = await buildLetterPdf(records)

  if (batchId) {
    await supabase.from('vaults').update({ letter_printed: true }).eq('bulk_batch_id', batchId)
  } else {
    await supabase.from('vaults').update({ letter_printed: true }).eq('id', vaultId as string)
  }

  return new NextResponse(pdf as unknown as BodyInit, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="mektup-${batchId ?? vaultId}.pdf"`,
      'Cache-Control': 'no-store',
    },
  })
}
