import { createServiceClient } from '@/lib/supabase/server'
import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { vaultId } = await req.json()
    if (!vaultId || typeof vaultId !== 'string') {
      return Response.json({ ok: false }, { status: 400 })
    }

    const supabase = await createServiceClient()
    await supabase.rpc('increment_vault_view_count', { vault_id_input: vaultId })

    return Response.json({ ok: true })
  } catch {
    return Response.json({ ok: false }, { status: 500 })
  }
}
