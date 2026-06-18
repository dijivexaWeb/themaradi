import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

// Country code → language mapping (Vercel provides x-vercel-ip-country)
const COUNTRY_LANG: Record<string, string> = {
  GE: 'ka',
  TR: 'tr',
  IL: 'he',
  AM: 'hy',
  AZ: 'az',
  RU: 'ru', UA: 'ru', BY: 'ru',
  KZ: 'ru', UZ: 'ru', KG: 'ru', TJ: 'ru', TM: 'ru', MD: 'ru',
}

function detectLangFromRequest(request: NextRequest): string | null {
  // 1) Vercel geo header (IP-based, most reliable)
  const country = request.headers.get('x-vercel-ip-country')?.toUpperCase()
  if (country && COUNTRY_LANG[country]) return COUNTRY_LANG[country]

  // 2) Accept-Language browser header
  const acceptLang = request.headers.get('accept-language') ?? ''
  const primary = acceptLang.split(',')[0]?.split(';')[0]?.trim().slice(0, 2).toLowerCase()
  if (primary === 'ka') return 'ka'
  if (primary === 'tr') return 'tr'
  if (primary === 'ru') return 'ru'
  if (primary === 'hy') return 'hy'
  if (primary === 'az') return 'az'
  if (primary === 'he') return 'he'

  return null
}

export async function proxy(request: NextRequest) {
  const response = await updateSession(request)

  // Admin paths: no caching
  if (request.nextUrl.pathname.startsWith('/admin')) {
    response.headers.set('Cache-Control', 'no-store, no-cache')
  }

  // Only set language cookie on first visit (user hasn't chosen manually yet)
  if (!request.cookies.get('tm_lang')) {
    const lang = detectLangFromRequest(request) ?? 'en'
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
