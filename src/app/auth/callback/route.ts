import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? null

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Explicit next parametresi varsa kullan — yalnızca kendi domain'e yönlendir
      if (next && next.startsWith('/') && !next.startsWith('//')) {
        return NextResponse.redirect(`${origin}${next}`)
      }

      // Kullanıcının en son vault'una göre yönlendir
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: vault } = await supabase
          .from('vaults')
          .select('id, product_type')
          .eq('owner_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        if (vault?.product_type === 'memorial_profile') {
          return NextResponse.redirect(`${origin}/anma-paneli/${vault.id}?purchased=1`)
        }
        if (vault?.product_type === 'life_vault') {
          return NextResponse.redirect(`${origin}/dashboard/vault/${vault.id}?purchased=1`)
        }
      }

      return NextResponse.redirect(`${origin}/dashboard`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
