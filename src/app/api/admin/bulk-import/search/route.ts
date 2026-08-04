import { NextRequest, NextResponse } from 'next/server'
import { getAdminContext } from '@/lib/admin/auth'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const ctx = await getAdminContext()
  if (!ctx) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  const q = (request.nextUrl.searchParams.get('q') ?? '').trim()
  if (q.length < 2) return NextResponse.json({ results: [] })

  const supabase = await createServiceClient()
  const { data, error } = await supabase
    .from('vaults')
    .select('id, display_name, login_username, qr_id, status, shipping_address, bulk_batch_id')
    .not('qr_id', 'is', null)
    .ilike('display_name', `%${q}%`)
    .order('display_name', { ascending: true })
    .limit(50)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ results: data ?? [] })
}
