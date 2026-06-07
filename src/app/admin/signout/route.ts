import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST() {
  const supabase = await createClient()
  const service = await createServiceClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    await service.from('admin_audit_logs').insert({
      admin_id: user.id,
      admin_email: user.email,
      action: 'ADMIN_LOGOUT',
      entity_type: 'auth',
    })
  }

  await supabase.auth.signOut()

  return NextResponse.redirect(new URL('/admin/login', process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'))
}
