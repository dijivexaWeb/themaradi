import { NextRequest, NextResponse } from 'next/server'
import { getAdminContext } from '@/lib/admin/auth'
import { createServiceClient } from '@/lib/supabase/server'
import { buildGuidePdf } from '@/lib/labels/build-guide-pdf'

export async function GET(request: NextRequest) {
  const ctx = await getAdminContext()
  if (!ctx) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  const batchId = request.nextUrl.searchParams.get('batchId')
  const vaultId = request.nextUrl.searchParams.get('vaultId')

  const pdf = await buildGuidePdf()

  if (batchId || vaultId) {
    const supabase = await createServiceClient()
    let query = supabase.from('vaults').update({ guide_printed: true })
    query = batchId ? query.eq('bulk_batch_id', batchId) : query.eq('id', vaultId as string)
    await query
  }

  return new NextResponse(pdf as unknown as BodyInit, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="kullanim-kilavuzu.pdf"',
      'Cache-Control': 'no-store',
    },
  })
}
