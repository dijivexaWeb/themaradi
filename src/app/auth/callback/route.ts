import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'
import { getLoginRedirectUrl } from '@/lib/login-redirect'

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
        const redirectPath = await getLoginRedirectUrl(supabase, user.id)
        return NextResponse.redirect(`${origin}${redirectPath}`)
      }

      return NextResponse.redirect(`${origin}/anma-paneli`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
