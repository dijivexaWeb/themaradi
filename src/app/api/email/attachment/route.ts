import { NextRequest, NextResponse } from 'next/server'
import { createPresignedReadUrl } from '@/lib/r2'
import { requireAdmin } from '@/lib/admin/auth'

export async function GET(req: NextRequest) {
  try {
    await requireAdmin()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const key = req.nextUrl.searchParams.get('key')
  if (!key) return NextResponse.json({ error: 'Missing key' }, { status: 400 })

  const bucket = process.env.R2_PRIVATE_BUCKET || 'tem-private-documents'

  try {
    const url = await createPresignedReadUrl(bucket, key, 300)
    return NextResponse.redirect(url)
  } catch {
    return NextResponse.json({ error: 'File not found' }, { status: 404 })
  }
}
