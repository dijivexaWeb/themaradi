import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function proxy(request: NextRequest) {
  const response = await updateSession(request)

  // Admin routes: must have admin session (checked at layout level via requireAdmin())
  // Proxy ensures no unauthenticated caching for /admin/* paths
  if (request.nextUrl.pathname.startsWith('/admin')) {
    response.headers.set('Cache-Control', 'no-store, no-cache')
  }

  if (!request.cookies.get('tm_lang')) {
    const acceptLang = request.headers.get('accept-language') ?? ''
    const primary = acceptLang.split(',')[0].slice(0, 2).toLowerCase()
    const lang = ['ka', 'tr', 'ru'].includes(primary) ? primary : 'en'

    response.cookies.set('tm_lang', lang, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
      sameSite: 'lax',
    })
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|images|fonts|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff2?|ttf|otf)$).*)',
  ],
}
